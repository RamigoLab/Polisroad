import React, { useState } from 'react';
import { S } from '../../styles/styles';
import { PS } from '../../styles/pages';
import { TextInput } from '../../components/ui/TextInput';
import { TextArea } from '../../components/ui/TextArea';
import { useNormativa } from '../../hooks/useNormativa';
import { useToast } from '../../components/ui/ToastManager';
import { C } from '../../styles/theme';
import { Icon } from '../../components/ui/Icon';

export const AdminNormativa = () => {
  const { list, add, update, remove } = useNormativa();
  const { showToast } = useToast();

  const [selectedArticle, setSelectedArticle] = useState(null);
  const [editingId, setEditingId] = useState(null); // 'new' for adding new article
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  // Form states for modifying article header
  const [artNum, setArtNum] = useState('');
  const [artTitle, setArtTitle] = useState('');
  const [titoloNum, setTitoloNum] = useState('');
  const [titoloNome, setTitoloNome] = useState('');
  const [capoNum, setCapoNum] = useState('');
  const [capoNome, setCapoNome] = useState('');

  // Form state for creating a brand new article
  const [newArt, setNewArt] = useState({
    titolo_numero: '',
    titolo_nome: '',
    capo_numero: '',
    capo_nome: '',
    articolo_num: '',
    titolo_articolo: '',
    comma: '1',
    testo: ''
  });

  // State for temporary edits inside the selected article's commi
  const [commiEdits, setCommiEdits] = useState({});

  // Group normativa by article (just like in the main user view)
  const groupedList = React.useMemo(() => {
    const groups = Object.values(list.reduce((acc, item) => {
      const art = item.articolo_num;
      if (!acc[art]) {
        acc[art] = {
          id: `art_${art}`,
          articolo: item.articolo,
          articolo_num: item.articolo_num,
          titolo_articolo: item.titolo_articolo || item.titolo,
          titolo_numero: item.titolo_numero,
          titolo_nome: item.titolo_nome,
          capo_numero: item.capo_numero,
          capo_nome: item.capo_nome,
          commi: []
        };
      }
      acc[art].commi.push(item);
      return acc;
    }, {})).sort((a, b) => a.articolo_num - b.articolo_num);

    groups.forEach(g => g.commi.sort((a, b) => a.comma_num - b.comma_num));
    return groups;
  }, [list]);

  const cleanTitle = (title) => {
    if (!title) return '';
    return title.replace(/^\s*\(\s*/, '').replace(/\s*\)\s*\.?\s*$/, '').trim();
  };

  // Open the detailed article editor
  const handleEditArticle = (group) => {
    setSelectedArticle(group);
    setArtNum(group.articolo_num);
    setArtTitle(cleanTitle(group.titolo_articolo));
    setTitoloNum(group.titolo_numero || '');
    setTitoloNome(group.titolo_nome || '');
    setCapoNum(group.capo_numero || '');
    setCapoNome(group.capo_nome || '');
    
    // Initialize temporary comma edits state
    const edits = {};
    group.commi.forEach(c => {
      edits[c.id] = {
        comma: (c.comma || '').replace(/\.$/, ''),
        testo: c.testo || ''
      };
    });
    setCommiEdits(edits);
  };

  // Close editors and return to list
  const handleBackToList = () => {
    setSelectedArticle(null);
    setEditingId(null);
  };

  // Save the article's core metadata across all its commi
  const handleSaveArticleMeta = async () => {
    if (!artNum) {
      showToast('Il numero articolo è obbligatorio', 'error');
      return;
    }
    setLoading(true);
    const parsedNum = parseInt(artNum);
    const artString = `Art. ${parsedNum}.`;

    try {
      const promises = selectedArticle.commi.map(c => 
        update(c.id, {
          articolo: artString,
          articolo_num: parsedNum,
          titolo_articolo: artTitle,
          titolo: artTitle, // keep fallback
          titolo_numero: titoloNum,
          titolo_nome: titoloNome,
          capo_numero: capoNum,
          capo_nome: capoNome
        })
      );
      await Promise.all(promises);
      showToast('Intestazione articolo aggiornata con successo!', 'success');
      
      // Update local state to reflect changes without full reload
      setSelectedArticle({
        ...selectedArticle,
        articolo: artString,
        articolo_num: parsedNum,
        titolo_articolo: artTitle,
        titolo_numero: titoloNum,
        titolo_nome: titoloNome,
        capo_numero: capoNum,
        capo_nome: capoNome
      });
    } catch {
      showToast('Errore durante il salvataggio dell\'intestazione', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Save an individual comma's edits to Supabase
  const handleSaveComma = async (commaId) => {
    const edit = commiEdits[commaId];
    if (!edit || !edit.comma) {
      showToast('Il numero di comma è obbligatorio', 'error');
      return;
    }

    setLoading(true);
    const commaString = `${edit.comma}.`;
    const commaNum = parseInt(edit.comma) || 1;

    const { error } = await update(commaId, {
      comma: commaString,
      comma_num: commaNum,
      testo: edit.testo
    });

    setLoading(false);
    if (!error) {
      showToast(`Comma ${edit.comma} salvato con successo!`, 'success');
    } else {
      showToast('Errore nel salvare il comma: ' + error.message, 'error');
    }
  };

  // Delete a specific comma from Supabase
  const handleDeleteComma = async (commaId, commaLabel) => {
    if (!window.confirm(`Sei sicuro di voler eliminare definitivamente il Comma ${commaLabel}?`)) return;

    setLoading(true);
    const { error } = await remove(commaId);
    setLoading(false);

    if (!error) {
      showToast(`Comma ${commaLabel} eliminato!`, 'success');
      // Update selected article's local commi state
      const updatedCommi = selectedArticle.commi.filter(c => c.id !== commaId);
      
      if (updatedCommi.length === 0) {
        // If no commi remain, go back to list
        setSelectedArticle(null);
      } else {
        setSelectedArticle({ ...selectedArticle, commi: updatedCommi });
      }
    } else {
      showToast('Errore durante l\'eliminazione del comma: ' + error.message, 'error');
    }
  };

  // Add a brand new comma to the currently selected article
  const handleAddNewComma = async () => {
    setLoading(true);
    // Find the next logical comma number
    const maxCommaNum = selectedArticle.commi.reduce((max, c) => Math.max(max, c.comma_num || 0), 0);
    const nextCommaNum = maxCommaNum + 1;

    const newCommaItem = {
      titolo_numero: selectedArticle.titolo_numero,
      titolo_nome: selectedArticle.titolo_nome,
      capo_numero: selectedArticle.capo_numero,
      capo_nome: selectedArticle.capo_nome,
      articolo: selectedArticle.articolo,
      articolo_num: selectedArticle.articolo_num,
      titolo_articolo: selectedArticle.titolo_articolo,
      titolo: selectedArticle.titolo_articolo, // fallback
      comma: `${nextCommaNum}.`,
      comma_num: nextCommaNum,
      testo: 'Inserisci qui il testo del nuovo comma...',
      ordine: list.length + 1
    };

    const { error } = await add(newCommaItem);
    setLoading(false);

    if (!error) {
      showToast(`Nuovo Comma ${nextCommaNum} aggiunto! Ora puoi modificarne il testo.`, 'success');
      setTimeout(() => {
        const updatedGroup = groupedList.find(g => g.articolo_num === selectedArticle.articolo_num);
        if (updatedGroup) {
          handleEditArticle(updatedGroup);
        }
      }, 500);
    } else {
      showToast('Errore durante l\'aggiunta del comma: ' + error.message, 'error');
    }
  };

  // Create a brand new article with its first comma
  const handleCreateNewArticle = async () => {
    if (!newArt.articolo_num || !newArt.titolo_articolo || !newArt.testo) {
      showToast('I campi (articolo, titolo, testo) sono obbligatori', 'error');
      return;
    }

    setLoading(true);
    const parsedNum = parseInt(newArt.articolo_num);
    const artString = `Art. ${parsedNum}.`;
    const commaString = `${newArt.comma}.`;
    const commaNum = parseInt(newArt.comma) || 1;

    const item = {
      titolo_numero: newArt.titolo_numero,
      titolo_nome: newArt.titolo_nome,
      capo_numero: newArt.capo_numero,
      capo_nome: newArt.capo_nome,
      articolo: artString,
      articolo_num: parsedNum,
      titolo_articolo: newArt.titolo_articolo,
      titolo: newArt.titolo_articolo, // fallback
      comma: commaString,
      comma_num: commaNum,
      testo: newArt.testo,
      ordine: list.length + 1
    };

    const { error } = await add(item);
    setLoading(false);

    if (!error) {
      showToast('Nuovo articolo creato con successo!', 'success');
      setEditingId(null);
      // Reset form
      setNewArt({ titolo_numero: '', titolo_nome: '', capo_numero: '', capo_nome: '', articolo_num: '', titolo_articolo: '', comma: '1', testo: '' });
    } else {
      showToast('Errore durante la creazione: ' + error.message, 'error');
    }
  };

  // Delete an entire article (all its commi)
  const handleDeleteArticle = async (group) => {
    const commiCount = group.commi.length;
    if (!window.confirm(`Sei sicuro di voler eliminare interamente l'Articolo ${group.articolo_num} e tutti i suoi ${commiCount} commi? Questa azione è irreversibile.`)) return;

    setLoading(true);
    try {
      const promises = group.commi.map(c => remove(c.id));
      await Promise.all(promises);
      showToast(`Articolo ${group.articolo_num} ed i suoi commi sono stati eliminati.`, 'success');
    } catch {
      showToast('Errore durante l\'eliminazione dell\'articolo', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Filtered grouped articles based on search query
  const filteredGroups = groupedList.filter(group => {
    const query = search.toLowerCase();
    return (
      (group.articolo_num?.toString() || '').includes(query) ||
      (group.titolo_articolo || '').toLowerCase().includes(query) ||
      (group.articolo || '').toLowerCase().includes(query)
    );
  });

  // Render view: CREATE NEW ARTICLE
  if (editingId === 'new') {
    return (
      <div>
        <div style={S.formHeader}>
          <h2 style={S.sectionTitle}>Nuovo Articolo Normativa</h2>
          <button onClick={handleBackToList} style={S.btnCancel}>Annulla</button>
        </div>
        <div style={S.formCard}>
          <div style={PS.adminSanzioniGrid}>
            <TextInput label="Titolo (Es. Titolo I)" value={newArt.titolo_numero} onChange={e => setNewArt({ ...newArt, titolo_numero: e.target.value })} />
            <TextInput label="Nome del Titolo" value={newArt.titolo_nome} onChange={e => setNewArt({ ...newArt, titolo_nome: e.target.value })} />
          </div>
          <div style={PS.adminSanzioniGrid}>
            <TextInput label="Capo (Es. Capo I)" value={newArt.capo_numero} onChange={e => setNewArt({ ...newArt, capo_numero: e.target.value })} />
            <TextInput label="Nome del Capo" value={newArt.capo_nome} onChange={e => setNewArt({ ...newArt, capo_nome: e.target.value })} />
          </div>
          
          <TextInput 
            label="Articolo (Numero)" 
            type="number" 
            value={newArt.articolo_num} 
            onChange={e => setNewArt({ ...newArt, articolo_num: e.target.value })} 
            placeholder="Es. 186"
          />
          <TextInput 
            label="Nome/Rubrica dell'Articolo" 
            value={newArt.titolo_articolo} 
            onChange={e => setNewArt({ ...newArt, titolo_articolo: e.target.value })} 
            placeholder="Es. Guida sotto l'influenza dell'alcool"
          />
          <TextInput 
            label="Numero Comma di partenza" 
            value={newArt.comma} 
            onChange={e => setNewArt({ ...newArt, comma: e.target.value })} 
            placeholder="Es. 1 o 1-bis"
          />
          <TextArea 
            label="Testo del Primo Comma" 
            rows={8} 
            value={newArt.testo} 
            onChange={e => setNewArt({ ...newArt, testo: e.target.value })} 
            placeholder="Inserisci qui la legge del comma..."
          />
          <button 
            onClick={handleCreateNewArticle} 
            disabled={loading} 
            style={{ ...S.btnPrimary, marginTop: '8px' }}
          >
            {loading ? 'Creazione in corso...' : 'Crea Articolo'}
          </button>
        </div>
      </div>
    );
  }

  // Render view: DETAILED ARTICLE EDITOR (COMMA MANAGER)
  if (selectedArticle) {
    return (
      <div>
        <div style={S.formHeader}>
          <button onClick={handleBackToList} style={{ fontSize: '1.2rem', padding: '6px', marginRight: '8px', cursor: 'pointer', background: 'none', border: 'none' }}>⬅️ Torna alla Lista</button>
          <h2 style={S.sectionTitle}>Modifica Articolo {selectedArticle.articolo_num}</h2>
        </div>

        {/* SECTION 1: ARTICLE HEAD METADATA */}
        <div style={{ ...S.formCard, marginBottom: '24px', borderLeft: `4px solid ${C.primary}` }}>
          <h3 style={{ ...S.infoBoxTitle, marginBottom: '12px' }}><Icon name="settings" size={16}/> Intestazione dell'Articolo</h3>
          <div style={{ display: 'flex', gap: '16px', flexDirection: 'column' }}>
            <div style={PS.adminSanzioniGrid}>
              <TextInput label="Titolo (Es. Titolo I)" value={titoloNum} onChange={e => setTitoloNum(e.target.value)} />
              <TextInput label="Nome del Titolo" value={titoloNome} onChange={e => setTitoloNome(e.target.value)} />
            </div>
            <div style={PS.adminSanzioniGrid}>
              <TextInput label="Capo (Es. Capo I)" value={capoNum} onChange={e => setCapoNum(e.target.value)} />
              <TextInput label="Nome del Capo" value={capoNome} onChange={e => setCapoNome(e.target.value)} />
            </div>

            <TextInput 
              label="Articolo (Numero)" 
              type="number" 
              value={artNum} 
              onChange={e => setArtNum(e.target.value)} 
            />
            <TextInput 
              label="Nome dell'Articolo" 
              value={artTitle} 
              onChange={e => setArtTitle(e.target.value)} 
            />
            <button 
              onClick={handleSaveArticleMeta} 
              disabled={loading} 
              style={{ ...S.btnPrimarySmall, width: 'fit-content', alignSelf: 'flex-end' }}
            >
              {loading ? 'Aggiornamento...' : 'Salva Intestazione'}
            </button>
          </div>
        </div>

        {/* SECTION 2: INDIVIDUAL COMMA CARDS */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={S.sectionTitle}><Icon name="scroll" size={16}/> Commi dell'Articolo ({(selectedArticle.commi || []).length})</h3>
            <button onClick={handleAddNewComma} disabled={loading} style={S.btnPrimarySmall}>+ Aggiungi Comma</button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {selectedArticle.commi.map((c) => {
              const edit = commiEdits[c.id] || { comma: '', testo: '' };
              return (
                <div key={c.id} style={{ ...S.card, border: `1px solid ${C.border}` }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ width: '120px' }}>
                      <TextInput 
                        label="Comma" 
                        value={edit.comma} 
                        onChange={e => setCommiEdits({
                          ...commiEdits,
                          [c.id]: { ...edit, comma: e.target.value }
                        })} 
                        placeholder="Es. 1 o 1-bis"
                      />
                    </div>
                    <span style={{ fontSize: '0.8rem', color: C.textLight, marginTop: '16px' }}>
                      ID: {c.id}
                    </span>
                  </div>

                  <TextArea 
                    label="Testo del Comma" 
                    rows={4} 
                    value={edit.testo} 
                    onChange={e => setCommiEdits({
                      ...commiEdits,
                      [c.id]: { ...edit, testo: e.target.value }
                    })} 
                  />

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                    <button 
                      onClick={() => handleDeleteComma(c.id, edit.comma)} 
                      disabled={loading} 
                      style={S.btnDanger}
                    >
                      Elimina Comma
                    </button>
                    <button 
                      onClick={() => handleSaveComma(c.id)} 
                      disabled={loading} 
                      style={S.btnAccent}
                    >
                      Salva Comma
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Render view: PRIMARY GROUPED ARTICLES LIST
  return (
    <div>
      <div style={S.formHeader}>
        <h2 style={S.sectionTitle}>Gestione Normativa</h2>
        <button onClick={() => setEditingId('new')} style={S.btnPrimarySmall}>+ Nuovo Articolo</button>
      </div>
      <TextInput 
        placeholder="Cerca per n° articolo o titolo..." 
        value={search} 
        onChange={e => setSearch(e.target.value)} 
      />
      <div style={{ ...S.list, marginTop: '16px' }}>
        {filteredGroups.map(group => (
          <div key={group.id} style={S.card}>
            <span style={PS.adminItemRef}>ART. {group.articolo_num}</span>
            <h3 style={PS.adminItemTitle}>{cleanTitle(group.titolo_articolo) || 'Senza Nome'}</h3>
            <div style={PS.adminListItemActions}>
              <button onClick={() => handleEditArticle(group)} style={S.btnAccent}>Modifica</button>
              <button onClick={() => handleDeleteArticle(group)} style={S.btnDanger}>Elimina</button>
            </div>
          </div>
        ))}
        {filteredGroups.length === 0 && (
          <div style={S.emptyState}>Nessun articolo trovato.</div>
        )}
      </div>
    </div>
  );
};
