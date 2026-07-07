import React, { useState } from 'react';
import { S } from '../../styles/styles';
import { PS } from '../../styles/pages';
import { C } from '../../styles/theme';
import { TextInput } from '../../components/ui/TextInput';
import { TextArea } from '../../components/ui/TextArea';
import { Icon } from '../../components/ui/Icon';
import { useNormativa } from '../../hooks/useNormativa';
import { useToast } from '../../components/ui/ToastManager';
import { useConfirm } from '../../components/ui/ConfirmDialog';

export const AdminNormativa = () => {
  const { list, add, update, remove } = useNormativa();
  const { showToast } = useToast();
  const confirmDialog = useConfirm();

  const [expandedGroupId, setExpandedGroupId] = useState(null); // id del gruppo articolo espanso (es. "art_186")
  const [editingId, setEditingId] = useState(null); // 'new' per aggiungere un nuovo articolo
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  // Stati del modulo per modificare l'intestazione dell'articolo
  const [artNum, setArtNum] = useState('');
  const [artTitle, setArtTitle] = useState('');
  const [titoloNum, setTitoloNum] = useState('');
  const [titoloNome, setTitoloNome] = useState('');
  const [capoNum, setCapoNum] = useState('');
  const [capoNome, setCapoNome] = useState('');

  // Stato per la creazione di un nuovo articolo da zero
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

  // Stato per salvare temporaneamente le modifiche ai singoli commi
  const [commiEdits, setCommiEdits] = useState({});

  // Raggruppa la normativa per articolo
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

  // Carica i dati dell'articolo per la modifica quando viene espanso
  const handleExpandArticle = (group) => {
    setArtNum(group.articolo_num);
    setArtTitle(cleanTitle(group.titolo_articolo));
    setTitoloNum(group.titolo_numero || '');
    setTitoloNome(group.titolo_nome || '');
    setCapoNum(group.capo_numero || '');
    setCapoNome(group.capo_nome || '');
    
    // Inizializza lo stato dei singoli commi
    const edits = {};
    group.commi.forEach(c => {
      edits[c.id] = {
        comma: (c.comma || '').replace(/\.$/, ''),
        testo: c.testo || ''
      };
    });
    setCommiEdits(edits);
  };

  // Salva i metadati dell'articolo su tutti i suoi commi
  const handleSaveArticleMeta = async (group) => {
    if (!artNum) {
      showToast('Il numero articolo è obbligatorio', 'error');
      return;
    }
    setLoading(true);
    const parsedNum = parseInt(artNum);
    const artString = `Art. ${parsedNum}.`;

    try {
      const promises = group.commi.map(c => 
        update(c.id, {
          articolo: artString,
          articolo_num: parsedNum,
          titolo_articolo: artTitle,
          titolo: artTitle,
          titolo_numero: titoloNum,
          titolo_nome: titoloNome,
          capo_numero: capoNum,
          capo_nome: capoNome
        })
      );
      await Promise.all(promises);
      showToast('Intestazione articolo aggiornata con successo!', 'success');
    } catch {
      showToast('Errore durante il salvataggio dell\'intestazione', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Salva le modifiche a un singolo comma
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

  // Elimina un singolo comma
  const handleDeleteComma = async (commaId, commaLabel) => {
    const ok = await confirmDialog({
      title: 'Eliminare il comma?',
      message: `Il Comma ${commaLabel} sarà eliminato definitivamente.`,
    });
    if (!ok) return;

    setLoading(true);
    const { error } = await remove(commaId);
    setLoading(false);

    if (!error) {
      showToast(`Comma ${commaLabel} eliminato!`, 'success');
    } else {
      showToast('Errore durante l\'eliminazione del comma: ' + error.message, 'error');
    }
  };

  // Aggiungi un nuovo comma all'articolo corrente
  const handleAddNewComma = async (group) => {
    setLoading(true);
    const maxCommaNum = group.commi.reduce((max, c) => Math.max(max, c.comma_num || 0), 0);
    const nextCommaNum = maxCommaNum + 1;

    const newCommaItem = {
      titolo_numero: group.titolo_numero,
      titolo_nome: group.titolo_nome,
      capo_numero: group.capo_numero,
      capo_nome: group.capo_nome,
      articolo: group.articolo,
      articolo_num: group.articolo_num,
      titolo_articolo: group.titolo_articolo,
      titolo: group.titolo_articolo,
      comma: `${nextCommaNum}.`,
      comma_num: nextCommaNum,
      testo: 'Nuovo comma...',
      ordine: list.length + 1
    };

    const { error } = await add(newCommaItem);
    setLoading(false);

    if (!error) {
      showToast(`Nuovo Comma ${nextCommaNum} aggiunto!`, 'success');
    } else {
      showToast('Errore durante l\'aggiunta del comma: ' + error.message, 'error');
    }
  };

  // Elimina un intero articolo (tutti i suoi commi)
  const handleDeleteArticle = async (group) => {
    const commiCount = group.commi.length;
    const ok = await confirmDialog({
      title: 'Eliminare l\'intero articolo?',
      message: `L'Articolo ${group.articolo_num} e tutti i suoi ${commiCount} commi saranno eliminati. Questa azione è irreversibile.`,
    });
    if (!ok) return;

    setLoading(true);
    try {
      const promises = group.commi.map(c => remove(c.id));
      await Promise.all(promises);
      showToast(`Articolo ${group.articolo_num} ed i suoi commi sono stati eliminati.`, 'success');
      setExpandedGroupId(null);
    } catch {
      showToast('Errore durante l\'eliminazione dell\'articolo', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Crea un nuovo articolo da zero
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
      titolo: newArt.titolo_articolo,
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
      setNewArt({ titolo_numero: '', titolo_nome: '', capo_numero: '', capo_nome: '', articolo_num: '', titolo_articolo: '', comma: '1', testo: '' });
    } else {
      showToast('Errore durante la creazione: ' + error.message, 'error');
    }
  };

  const filteredGroups = groupedList.filter(group => {
    const query = search.toLowerCase();
    return (
      (group.articolo_num?.toString() || '').includes(query) ||
      (group.titolo_articolo || '').toLowerCase().includes(query) ||
      (group.articolo || '').toLowerCase().includes(query)
    );
  });

  if (editingId === 'new') {
    return (
      <div>
        <div style={S.formHeader}>
          <h2 style={S.sectionTitle}>Nuovo Articolo Normativa</h2>
          <button onClick={() => setEditingId(null)} style={S.btnCancel}>Annulla</button>
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
          
          <TextInput label="Articolo (Numero)" type="number" value={newArt.articolo_num} onChange={e => setNewArt({ ...newArt, articolo_num: e.target.value })} placeholder="Es. 186" />
          <TextInput label="Nome/Rubrica dell'Articolo" value={newArt.titolo_articolo} onChange={e => setNewArt({ ...newArt, titolo_articolo: e.target.value })} placeholder="Es. Guida sotto l'influenza dell'alcool" />
          <TextInput label="Numero Comma" value={newArt.comma} onChange={e => setNewArt({ ...newArt, comma: e.target.value })} placeholder="Es. 1" />
          <TextArea label="Testo del Primo Comma" rows={6} value={newArt.testo} onChange={e => setNewArt({ ...newArt, testo: e.target.value })} placeholder="Inserisci qui la legge del comma..." />
          <button onClick={handleCreateNewArticle} disabled={loading} style={{ ...S.btnPrimary, marginTop: '8px' }}>
            {loading ? 'Creazione in corso...' : 'Crea Articolo'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={S.formHeader}>
        <h2 style={S.sectionTitle}>Gestione Normativa ({groupedList.length} articoli)</h2>
        <button onClick={() => setEditingId('new')} style={S.btnPrimarySmall}>+ Nuovo Articolo</button>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <TextInput placeholder="Cerca per n° articolo o parole chiave..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {filteredGroups.map(group => {
          const isExpanded = expandedGroupId === group.id;
          return (
            <div
              key={group.id}
              role="button"
              tabIndex={0}
              aria-expanded={isExpanded}
              onClick={() => {
                const expanding = !isExpanded;
                setExpandedGroupId(expanding ? group.id : null);
                if (expanding) {
                  handleExpandArticle(group);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  const expanding = !isExpanded;
                  setExpandedGroupId(expanding ? group.id : null);
                  if (expanding) handleExpandArticle(group);
                }
              }}
              style={{
                ...S.card,
                backgroundColor: C.accentLight,
                borderLeft: `4px solid ${C.accent}`,
                cursor: 'pointer',
                padding: '12px 16px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <span style={{ fontWeight: '800', color: C.accent, fontSize: '1rem' }}>ART. {group.articolo_num}</span>
                  <span style={{ fontSize: '0.82rem', color: C.text, marginLeft: '8px' }}>{cleanTitle(group.titolo_articolo) || 'Senza Nome'}</span>
                  <div style={{ fontSize: '0.78rem', color: C.textLight, marginTop: '2px' }}>{group.commi.length} {group.commi.length === 1 ? 'comma' : 'commi'}</div>
                </div>
                <span style={{ color: C.accent }}>{isExpanded ? '▲' : '▼'}</span>
              </div>

              {isExpanded && (
                <div onClick={(e) => e.stopPropagation()} style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* METADATA DELL'ARTICOLO */}
                  <div style={{ ...S.formCard, backgroundColor: C.card, padding: '16px', border: `1px solid ${C.border}`, borderRadius: '8px', margin: 0 }}>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Icon name="settings" size={14}/> Intestazione dell'Articolo
                    </h4>
                    <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
                      <div style={PS.adminSanzioniGrid}>
                        <TextInput label="Titolo (Es. Titolo I)" value={titoloNum} onChange={e => setTitoloNum(e.target.value)} />
                        <TextInput label="Nome del Titolo" value={titoloNome} onChange={e => setTitoloNome(e.target.value)} />
                      </div>
                      <div style={PS.adminSanzioniGrid}>
                        <TextInput label="Capo (Es. Capo I)" value={capoNum} onChange={e => setCapoNum(e.target.value)} />
                        <TextInput label="Nome del Capo" value={capoNome} onChange={e => setCapoNome(e.target.value)} />
                      </div>
                      <div style={PS.adminSanzioniGrid}>
                        <TextInput label="Articolo (Numero)" type="number" value={artNum} onChange={e => setArtNum(e.target.value)} />
                        <TextInput label="Nome dell'Articolo" value={artTitle} onChange={e => setArtTitle(e.target.value)} />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
                        <button onClick={() => handleDeleteArticle(group)} disabled={loading} style={S.btnDanger}>Elimina Articolo</button>
                        <button onClick={() => handleSaveArticleMeta(group)} disabled={loading} style={S.btnPrimarySmall}>Salva Intestazione</button>
                      </div>
                    </div>
                  </div>

                  {/* LISTA DEI COMMI E AGGIUNTA */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h4 style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>Commi dell'Articolo</h4>
                      <button onClick={() => handleAddNewComma(group)} disabled={loading} style={S.btnPrimarySmall}>+ Aggiungi Comma</button>
                    </div>

                    {group.commi.map(c => {
                      const edit = commiEdits[c.id] || { comma: '', testo: '' };
                      return (
                        <div key={c.id} style={{ ...S.card, backgroundColor: C.card, border: `1px solid ${C.border}`, padding: '12px', margin: 0 }}>
                          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '8px' }}>
                            <div style={{ width: '80px' }}>
                              <TextInput 
                                label="Comma" 
                                value={edit.comma} 
                                onChange={e => setCommiEdits({
                                  ...commiEdits,
                                  [c.id]: { ...edit, comma: e.target.value }
                                })} 
                                placeholder="Es. 1"
                              />
                            </div>
                            <span style={{ fontSize: '0.78rem', color: C.textLight, marginTop: '16px' }}>ID: {c.id}</span>
                          </div>
                          <TextArea 
                            label="Testo del Comma" 
                            rows={3} 
                            value={edit.testo} 
                            onChange={e => setCommiEdits({
                              ...commiEdits,
                              [c.id]: { ...edit, testo: e.target.value }
                            })} 
                          />
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
                            <button onClick={() => handleDeleteComma(c.id, edit.comma)} disabled={loading} style={{ ...S.btnDanger, padding: '4px 8px', fontSize: '0.75rem' }}>Elimina</button>
                            <button onClick={() => handleSaveComma(c.id)} disabled={loading} style={{ ...S.btnAccent, padding: '4px 8px', fontSize: '0.75rem' }}>Salva</button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filteredGroups.length === 0 && (
          <div style={S.emptyState}>Nessun articolo trovato.</div>
        )}
      </div>
    </div>
  );
};
