import React, { useState, useEffect } from 'react';
import { SearchBar } from '../components/ui/SearchBar';
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
    <div style={{ flex: 1, backgroundColor: '#121212', color: '#e0e0e0', display: 'flex', flexDirection: 'column', minHeight: '100vh', overflowY: 'auto' }}>
      {/* Header Operatore */}
      <div style={{ backgroundColor: '#c0392b', padding: '16px', color: '#fff', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <span style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>🚨 MODALITÀ OPERATORE</span>
          <button onClick={() => onNavigate('home')} style={{ color: '#fff', fontSize: '1.5rem' }}>×</button>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
          <span>{profile?.grado} {profile?.nome} {profile?.cognome}</span>
          <span>{time.toLocaleTimeString('it-IT')} | {time.toLocaleDateString('it-IT')}</span>
        </div>
      </div>

      <div style={{ padding: '16px', flex: 1 }}>
        <SearchBar 
          value={search} 
          onChange={e => setSearch(e.target.value)} 
          placeholder="Cerca violazione..." 
        />
        
        {search.length === 0 && (
          <p style={{ color: '#aaa', fontSize: '0.85rem', marginBottom: '12px' }}>Mostrando i tuoi preferiti</p>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {displayList.map(item => {
            const isExpanded = expandedId === item.id;
            const itemNote = note[item.id];
            
            return (
              <div key={item.id} style={{ backgroundColor: '#1e1e1e', borderRadius: '8px', overflow: 'hidden', border: '1px solid #333' }}>
                <div 
                  onClick={() => setExpandedId(isExpanded ? null : item.id)}
                  style={{ padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                >
                  <div>
                    <span style={{ color: '#f39c12', fontWeight: 'bold', fontSize: '0.8rem', marginRight: '8px' }}>{item.rif_normativo}</span>
                    <span style={{ fontWeight: '600', fontSize: '0.95rem' }}>{item.titolo}</span>
                  </div>
                  <span>{isExpanded ? '▲' : '▼'}</span>
                </div>
                
                {isExpanded && (
                  <div style={{ padding: '12px', borderTop: '1px solid #333', backgroundColor: '#252525' }}>
                    {/* Griglia Sanzioni 4 Colonne */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px', marginBottom: '12px', textAlign: 'center' }}>
                      <div style={{ backgroundColor: '#333', padding: '6px', borderRadius: '4px' }}>
                        <div style={{ fontSize: '0.65rem', color: '#aaa' }}>Diurna</div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#e74c3c' }}>€{item.pmr}</div>
                      </div>
                      <div style={{ backgroundColor: '#333', padding: '6px', borderRadius: '4px' }}>
                        <div style={{ fontSize: '0.65rem', color: '#aaa' }}>Scontata</div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#2ecc71' }}>{item.scontato_30 ? `€${item.scontato_30}` : 'N.A.'}</div>
                      </div>
                      <div style={{ backgroundColor: '#333', padding: '6px', borderRadius: '4px', gridColumn: 'span 2' }}>
                        <div style={{ fontSize: '0.65rem', color: '#aaa' }}>Notturna</div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#e74c3c' }}>{item.sanzione_notturna ? 'Sì (+33%)' : 'No'}</div>
                      </div>
                    </div>
                    
                    {/* Punti e Accessoria */}
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                      {item.punti_patente > 0 && (
                        <div style={{ backgroundColor: '#c0392b', color: '#fff', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                          -{item.punti_patente} PT
                        </div>
                      )}
                      <div style={{ flex: 1, backgroundColor: '#333', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', color: '#ddd' }}>
                        Acc: {item.sanzione_accessoria || 'Nessuna'}
                      </div>
                    </div>

                    {/* Note Operative */}
                    {item.note_operative && (
                      <div style={{ backgroundColor: 'rgba(192, 57, 43, 0.2)', padding: '8px', borderRadius: '4px', borderLeft: '3px solid #e74c3c', marginBottom: '8px' }}>
                        <span style={{ fontSize: '0.75rem', color: '#e74c3c', fontWeight: 'bold', display: 'block', marginBottom: '2px' }}>NOTE OPERATIVE</span>
                        <span style={{ fontSize: '0.85rem' }}>{item.note_operative}</span>
                      </div>
                    )}
                    
                    {/* Memo */}
                    {itemNote && (
                      <div style={{ backgroundColor: 'rgba(243, 156, 18, 0.1)', padding: '8px', borderRadius: '4px', borderLeft: '3px solid #f39c12' }}>
                        <span style={{ fontSize: '0.75rem', color: '#f39c12', fontWeight: 'bold', display: 'block', marginBottom: '2px' }}>MEMO</span>
                        <span style={{ fontSize: '0.85rem' }}>{itemNote}</span>
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
