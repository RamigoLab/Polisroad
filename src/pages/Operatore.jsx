import React, { useState, useEffect } from 'react';
import { SearchBar } from '../components/ui/SearchBar';
import { PS } from '../styles/pages';
import { useProntuario } from '../hooks/useProntuario';
import { usePreferiti } from '../hooks/usePreferiti';
import { useNote } from '../hooks/useNote';
import { useAuth } from '../hooks/useAuth';

export const Operatore = ({ onNavigate }) => {
  const { list } = useProntuario();
  const { preferiti } = usePreferiti();
  const { note } = useNote();
  const { profile } = useAuth();

  const [search, setSearch] = useState('');
  const [time, setTime] = useState(new Date());
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const displayList = search.length > 0
    ? list.filter(item =>
        item.titolo.toLowerCase().includes(search.toLowerCase()) ||
        item.rif_normativo.toLowerCase().includes(search.toLowerCase())
      )
    : list.filter(item => preferiti.includes(item.id));

  return (
    <div style={PS.operatoreContainer}>
      {/* Header */}
      <div style={PS.operatoreHeader}>
        <div style={PS.operatoreHeaderTop}>
          <span style={PS.operatoreHeaderTitle}>🚨 MODALITÀ OPERATORE</span>
          <button onClick={() => onNavigate('home')} style={PS.operatoreExitBtn}>ESCI</button>
        </div>
        <div style={PS.operatoreHeaderMeta}>
          <span>{profile?.grado} {profile?.nome} {profile?.cognome}</span>
          <span>{time.toLocaleTimeString('it-IT')} | {time.toLocaleDateString('it-IT')}</span>
        </div>
      </div>

      <div style={PS.operatoreBody}>
        <SearchBar value={search} onChange={e => setSearch(e.target.value)} placeholder="Cerca violazione..." />

        {search.length === 0 && (
          <p style={PS.operatoreFavLabel}>⭐ I TUOI PREFERITI</p>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {displayList.map(item => {
            const isExpanded = expandedId === item.id;
            const itemNote = note[item.id];

            return (
              <div key={item.id} style={PS.operatoreItemCard}>
                <div onClick={() => setExpandedId(isExpanded ? null : item.id)} style={PS.operatoreItemHeader}>
                  <div>
                    <span style={PS.operatoreItemRef}>{item.rif_normativo}</span>
                    <span style={PS.operatoreItemTitle}>{item.titolo}</span>
                  </div>
                  <span>{isExpanded ? '▲' : '▼'}</span>
                </div>

                {isExpanded && (
                  <div style={PS.operatoreDetailPanel}>
                    {/* Griglia Importi */}
                    <div style={PS.operatoreGrid}>
                      <div style={PS.operatoreCell}>
                        <div style={PS.operatoreCellLabel}>Diurna</div>
                        <div style={PS.operatoreCellValue}>€{item.pmr}</div>
                      </div>
                      <div style={PS.operatoreCell}>
                        <div style={PS.operatoreCellLabel}>Scontata</div>
                        <div style={PS.operatoreCellValueGreen}>{item.scontato_30 ? `€${item.scontato_30}` : 'N.A.'}</div>
                      </div>
                      <div style={PS.operatoreCellWide}>
                        <div style={PS.operatoreCellLabel}>Notturna (+33.3%)</div>
                        <div style={{ ...PS.operatoreCellValue, color: item.sanzione_notturna ? '#e74c3c' : '#aaa' }}>
                          {item.sanzione_notturna ? `€${(parseFloat(item.pmr) * 1.333333).toFixed(2)}` : 'Non prevista'}
                        </div>
                      </div>
                    </div>

                    {/* Descrizione */}
                    <div style={PS.operatoreDescBlock}>
                      <span style={PS.operatoreDescLabel}>DESCRIZIONE VIOLAZIONE</span>
                      <p style={PS.operatoreDescText}>{item.descrizione}</p>
                    </div>

                    {/* Punti e Accessoria */}
                    <div style={PS.operatoreTagsRow}>
                      {item.punti_patente > 0 && (
                        <div style={PS.operatorePointsBadge}>-{item.punti_patente} PT</div>
                      )}
                      <div style={PS.operatoreAccessoriaTag}>Acc: {item.sanzione_accessoria || 'Nessuna'}</div>
                    </div>

                    {/* Note Operative */}
                    {item.note_operative && (
                      <div style={PS.operatoreNoteOpBlock}>
                        <span style={PS.operatoreNoteOpLabel}>NOTE OPERATIVE</span>
                        <span style={PS.operatoreTextSm}>{item.note_operative}</span>
                      </div>
                    )}

                    {/* Memo */}
                    {itemNote && (
                      <div style={PS.operatoreMemoBlock}>
                        <span style={PS.operatoreMemoLabel}>MEMO</span>
                        <span style={PS.operatoreTextSm}>{itemNote}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
