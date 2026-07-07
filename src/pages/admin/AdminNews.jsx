import React, { useState } from 'react';
import { C } from '../../styles/theme';
import { Icon } from '../../components/ui/Icon';
import { S } from '../../styles/styles';
import { PS } from '../../styles/pages';
import { TextInput } from '../../components/ui/TextInput';
import { TextArea } from '../../components/ui/TextArea';
import { useNews } from '../../hooks/useNews';
import { useToast } from '../../components/ui/ToastManager';
import { useConfirm } from '../../components/ui/ConfirmDialog';
import { validators, sanitizers } from '../../utils/validation';
import { logger } from '../../utils/logger';
import { supabase } from '../../config/supabase';

// Le fonti RSS curate vivono ora lato server in supabase/functions/fetch-rss
// (prima erano qui come FEEDS e venivano fetchate dal browser via api.rss2json.com).

// Relevant keywords to filter traffic/enforcement news only
const RELEVANT_KEYWORDS = [
  "codice", "sanzione", "patente", "strada", "multa", "velox", "velocità", 
  "veicol", "guida", "decreto", "legge", "polizia", "vigil", "circolazione", 
  "infrazione", "autovelox", "tutor", "incidente", "stradali", "ammenda", "verbali"
];

export const AdminNews = () => {
  const { list, add, update, remove } = useNews();
  const { showToast } = useToast();
  const confirmDialog = useConfirm();

  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [formData, setFormData] = useState({
    titolo: '', contenuto: '', fonte: '', url_fonte: '', categoria: 'informativa', pubblicato: false,
  });

  const handleEdit = (item) => {
    let contentText = item.contenuto || '';
    let extractedSource = item.fonte || '';
    let extractedLink = item.url_fonte || '';

    // Automatically parse embedded source/link metadata from content if present
    if (contentText.startsWith('[Fonte:')) {
      const match = contentText.match(/^\[Fonte:\s*([^|\]]+)(?:\s*\|\s*Link:\s*([^\]]+))?\]\s*\n*\s*/);
      if (match) {
        extractedSource = match[1].trim();
        if (match[2]) {
          extractedLink = match[2].trim();
        }
        contentText = contentText.substring(match[0].length);
      }
    }

    setEditingId(item.id);
    setFormData({
      ...item,
      contenuto: contentText,
      fonte: extractedSource,
      url_fonte: extractedLink
    });
  };

  const handleNew = () => {
    setEditingId('new');
    setFormData({ titolo: '', contenuto: '', fonte: '', url_fonte: '', categoria: 'informativa', pubblicato: true });
  };

  const handleSave = async () => {
    // Basic required fields
    if (!formData.titolo || !formData.contenuto) {
      showToast('Titolo e contenuto sono obbligatori!', 'error');
      return;
    }
    // Validate title length (max 200 chars)
    const titleError = validators.maxLength(formData.titolo, 200, 'Titolo');
    if (titleError) {
      showToast(titleError, 'error');
      return;
    }
    // Validate content length (max 5000 chars)
    const contentError = validators.maxLength(formData.contenuto, 5000, 'Contenuto');
    if (contentError) {
      showToast(contentError, 'error');
      return;
    }
    // Optional: validate source URL if provided
    if (formData.url_fonte) {
      // Ensure URL format is valid
      const urlValid = sanitizers.url(formData.url_fonte);
      if (!urlValid) {
        showToast('URL fonte non è valida.', 'error');
        return;
      }
    }
    
    setLoading(true);
    
    // Sanitize HTML content to allow only safe tags
    const sanitizedContent = sanitizers.html(formData.contenuto);
    
    // Embed source metadata if not already present
    let finalContenuto = sanitizedContent;
    if (formData.fonte && !finalContenuto.startsWith('[Fonte:')) {
      const sourceStr = `[Fonte: ${formData.fonte}${formData.url_fonte ? ` | Link: ${formData.url_fonte}` : ''}]\n\n`;
      finalContenuto = sourceStr + finalContenuto;
    }

    const payload = {
      ...formData,
      contenuto: finalContenuto
    };

    let res;
    if (editingId === 'new') {
      res = await add(payload);
    } else {
      res = await update(editingId, payload);
    }
    setLoading(false);

    if (res && res.error) {
      showToast('Errore durante il salvataggio: ' + res.error.message, 'error');
    } else {
      showToast('Notizia salvata con successo!', 'success');
      setEditingId(null);
    }
  };

  const handleDelete = async (id, title) => {
    const ok = await confirmDialog({
      title: 'Eliminare la notizia?',
      message: `"${title}" sarà rimossa definitivamente.`,
    });
    if (!ok) return;
    
    setLoading(true);
    const { error } = await remove(id);
    setLoading(false);

    if (error) {
      showToast('Errore durante l\'eliminazione: ' + error.message, 'error');
    } else {
      showToast('Notizia eliminata con successo!', 'success');
    }
  };

  // Helper function to strip HTML tags and decode HTML entities
  const cleanHtml = (text) => {
    if (!text) return '';
    return text
      .replace(/<[^>]*>/g, '') // Strip HTML tags
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#8217;/g, "'")
      .replace(/&#8211;/g, "-")
      .replace(/&#8220;/g, '"')
      .replace(/&#8221;/g, '"')
      .replace(/\s+/g, ' ')
      .trim();
  };

  // Checks if the article matches any traffic enforcement keyword
  const checkRelevance = (title, content) => {
    const combinedText = `${title} ${content}`.toLowerCase();
    return RELEVANT_KEYWORDS.some(keyword => combinedText.includes(keyword));
  };

  // Triggers live RSS Feed synchronization
  const handleSyncFeeds = async () => {
    setSyncing(true);
    showToast('Inizio sincronizzazione feeds RSS...', 'info');
    let addedCount = 0;
    let skippedDuplicate = 0;
    let skippedIrrelevant = 0;

    try {
      const { data, error: fnError } = await supabase.functions.invoke('fetch-rss');
      if (fnError) throw fnError;

      for (const feed of data.feeds) {
        for (const item of feed.items) {
          const title = cleanHtml(item.title);
          const link = item.link;
          const content = cleanHtml(item.description || '');

          // 1. Check for duplicates in current news list using both title and link embedded in content
          const isDuplicate = list.some(existing => 
            (existing.contenuto && existing.contenuto.includes(link)) || 
            (existing.titolo.toLowerCase() === title.toLowerCase())
          );

          if (isDuplicate) {
            skippedDuplicate++;
            continue;
          }

          // 2. Check for keywords relevance (PolisRoad focus)
          const relevant = checkRelevance(title, content);

          if (!relevant) {
            skippedIrrelevant++;
            continue;
          }

          // 3. Save relevant and clean news item with embedded source
          const cleanedContent = content.length > 500 ? content.substring(0, 500) + '...' : content;
          const contentWithSource = `[Fonte: ${feed.fonte} | Link: ${link}]\n\n${cleanedContent}`;

          const newsItem = {
            titolo: title,
            contenuto: contentWithSource,
            categoria: feed.categoria,
            pubblicato: false,
            data_creazione: new Date(item.pubDate || Date.now()).toISOString()
          };

          const { error } = await add(newsItem);
          if (!error) {
            addedCount++;
          }
        }
      }

      if (addedCount > 0) {
        showToast(`Sincronizzazione completata! Aggiunte ${addedCount} nuove notizie utili.`, 'success');
      } else {
        showToast(`Tutte le notizie RSS sono già sincronizzate o non pertinenti al CdS.`, 'info');
      }
      
      logger.log(`Sync completed. Added: ${addedCount}, Duplicates: ${skippedDuplicate}, Irrelevant: ${skippedIrrelevant}`);
    } catch (error) {
      logger.warn('RSS sync failed:', error);
      showToast('Errore generale durante la sincronizzazione feeds', 'error');
    } finally {
      setSyncing(false);
    }
  };

  if (editingId) {
    return (
      <div>
        <div style={S.formHeader}>
          <h2 style={S.sectionTitle}>{editingId === 'new' ? 'Nuova Notizia' : 'Modifica Notizia'}</h2>
          <button onClick={() => setEditingId(null)} style={S.btnCancel}>Annulla</button>
        </div>
        <div style={S.formCard}>
          <TextInput 
            label="Titolo Notizia" 
            value={formData.titolo} 
            onChange={e => setFormData({ ...formData, titolo: e.target.value })} 
            placeholder="Es. Nuovo Decreto Autovelox approvato in Gazzetta Ufficiale"
          />
          <TextArea 
            label="Contenuto / Articolo" 
            rows={8}
            value={formData.contenuto} 
            onChange={e => setFormData({ ...formData, contenuto: e.target.value })} 
            placeholder="Scrivi qui il testo completo della notizia stradale..."
          />
          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ flex: 1 }}>
              <TextInput 
                label="Fonte Informativa" 
                value={formData.fonte} 
                onChange={e => setFormData({ ...formData, fonte: e.target.value })} 
                placeholder="Es. Ministero dei Trasporti"
              />
            </div>
            <div style={{ flex: 1 }}>
              <TextInput 
                label="URL Fonte (Link originale)" 
                value={formData.url_fonte} 
                onChange={e => setFormData({ ...formData, url_fonte: e.target.value })} 
                placeholder="https://..."
              />
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ ...S.checkboxLabel, fontWeight: '600', marginBottom: '6px', display: 'block' }}>Categoria Notizia</label>
            <select 
              value={formData.categoria} 
              onChange={e => setFormData({ ...formData, categoria: e.target.value })}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: `1px solid ${C.border}`,
                backgroundColor: C.card,
                color: C.text,
                fontSize: '1rem',
                fontFamily: 'inherit'
              }}
            >
              <option value="normativa">Normativa e Leggi</option>
              <option value="sicurezza">Sicurezza Stradale</option>
              <option value="informativa">Utility e Comunicazioni</option>
              <option value="banner">Banner Notifica Homepage (Giallo)</option>
              <option value="notifica">Notifica (Lista in Home)</option>
              <option value="popup">Popup Modale (Avvio App)</option>
            </select>
          </div>

          <label style={{ ...S.checkboxLabel, marginTop: '8px', marginBottom: '16px' }}>
            <input 
              type="checkbox" 
              checked={formData.pubblicato} 
              onChange={e => setFormData({ ...formData, pubblicato: e.target.checked })} 
            />
            <span style={{ marginLeft: '8px', fontWeight: '500' }}>Pubblica immediatamente all'operatore</span>
          </label>
          
          <button 
            onClick={handleSave} 
            disabled={loading} 
            style={S.btnPrimary}
          >
            {loading ? 'Salvataggio in corso...' : 'Salva Notizia'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={S.formHeader}>
        <h2 style={S.sectionTitle}>Gestione Notizie</h2>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            onClick={handleSyncFeeds} 
            disabled={syncing} 
            style={{ 
              ...S.btnOutline, 
              fontSize: '0.85rem', 
              padding: '6px 12px',
              borderColor: C.success,
              color: C.success,
              backgroundColor: syncing ? 'rgba(46, 204, 113, 0.05)' : 'transparent'
            }}
          >
            {syncing ? <><Icon name="rotate-cw" size={16}/> Sincronizzazione...</> : <><Icon name="zap" size={16}/> Sincronizza RSS Live</>}
          </button>
          <button onClick={handleNew} style={S.btnPrimarySmall}>+ Nuova Notizia</button>
        </div>
      </div>
      
      <div style={S.list}>
        {list.map(item => (
          <div key={item.id} style={PS.adminListItem(item.pubblicato)}>
            <div style={PS.adminListItemHeader}>
              <span style={{ 
                ...S.labelUppercase, 
                backgroundColor: item.categoria === 'normativa' ? 'rgba(231, 76, 60, 0.1)' : item.categoria === 'sicurezza' ? 'rgba(243, 156, 18, 0.1)' : item.categoria === 'banner' ? 'rgba(243, 156, 18, 0.15)' : item.categoria === 'popup' ? 'rgba(155, 89, 182, 0.1)' : item.categoria === 'notifica' ? 'rgba(52, 152, 219, 0.2)' : 'rgba(52, 152, 219, 0.1)',
                color: item.categoria === 'normativa' ? C.danger : item.categoria === 'sicurezza' ? C.warning : item.categoria === 'banner' ? C.warning : item.categoria === 'popup' ? '#9b59b6' : item.categoria === 'notifica' ? C.primary : C.primary,
                padding: '2px 8px',
                borderRadius: '12px',
                fontSize: '0.75rem',
                fontWeight: 'bold'
              }}>
                {item.categoria === 'normativa' ? 'Normativa' : item.categoria === 'sicurezza' ? 'Sicurezza' : item.categoria === 'banner' ? 'Banner Homepage' : item.categoria === 'popup' ? 'Popup Avvio' : item.categoria === 'notifica' ? 'Notifica Home' : 'Informativa'}
              </span>
              <span style={{ 
                fontSize: '0.8rem', 
                fontWeight: 'bold',
                color: item.pubblicato ? C.success : C.textLight 
              }}>
                {item.pubblicato
                  ? <><Icon name="circle-check" size={14}/> Pubblicata</>
                  : <><Icon name="circle-x" size={14}/> Bozza</>
                }
              </span>
            </div>
            <h3 style={{ ...PS.adminListItemTitle, margin: '8px 0', fontSize: '1.05rem', fontWeight: '700' }}>{item.titolo}</h3>
            <p style={{ fontSize: '0.85rem', color: C.textLight, marginBottom: '12px', fontStyle: 'italic' }}>
              Fonte: <strong>{item.fonte}</strong> | Data: {new Date(item.created_at).toLocaleDateString('it-IT')}
            </p>
            <div style={PS.adminListItemActions}>
              <button onClick={() => handleEdit(item)} style={S.btnAccent}>Modifica Notizia</button>
              <button onClick={() => handleDelete(item.id, item.titolo)} style={S.btnDanger}>Elimina</button>
            </div>
          </div>
        ))}
        {list.length === 0 && (
          <div style={S.emptyState}>Nessuna notizia presente. Clicca su "Sincronizza RSS Live" per caricarne subito!</div>
        )}
      </div>
    </div>
  );
};
