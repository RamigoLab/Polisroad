import React, { useState } from 'react';
import { PageWrapper } from '../components/layout/PageWrapper';
import { SearchBar } from '../components/ui/SearchBar';
import { Badge } from '../components/ui/Badge';
import { C } from '../styles/theme';
import { useNormativa } from '../hooks/useNormativa';

export const Normativa = () => {
  const { list, loading } = useNormativa();
  const [search, setSearch] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);

  const filteredList = list.filter(item => 
    item.titolo.toLowerCase().includes(search.toLowerCase()) || 
    `Art. ${item.articolo}`.toLowerCase().includes(search.toLowerCase()) ||
    item.testo.toLowerCase().includes(search.toLowerCase())
  );

  if (selectedItem) {
    return (
      <PageWrapper style={{ padding: 0 }}>
        <div style={{ backgroundColor: '#fff', padding: '16px', borderBottom: `1px solid ${C.border}`, position: 'sticky', top: 0, zIndex: 10, display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={() => setSelectedItem(null)} style={{ fontSize: '1.2rem', padding: '4px' }}>⬅️</button>
          <div>
            <Badge type="primary" style={{ marginBottom: '4px' }}>Art. {selectedItem.articolo}</Badge>
            <h2 style={{ fontSize: '1.1rem', color: C.text, lineHeight: 1.3 }}>{selectedItem.titolo}</h2>
          </div>
        </div>
        
        <div style={{ padding: '20px', backgroundColor: '#fff', flex: 1 }}>
          <p style={{ fontSize: '1rem', lineHeight: 1.6, color: C.text, whiteSpace: 'pre-wrap', textAlign: 'justify' }}>
            {selectedItem.testo}
          </p>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div style={{ marginBottom: '16px' }}>
        <h2 style={{ color: C.primary, marginBottom: '16px' }}>Normativa CdS</h2>
        <SearchBar value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cerca articolo o parola chiave..." />
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: C.textLight }}>Caricamento in corso...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredList.map(item => (
            <div 
              key={item.id} 
              onClick={() => setSelectedItem(item)}
              style={{ backgroundColor: '#fff', padding: '16px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', cursor: 'pointer', display: 'flex', gap: '16px', alignItems: 'center' }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '60px', borderRight: `1px solid ${C.border}`, paddingRight: '16px' }}>
                <span style={{ fontSize: '0.8rem', color: C.textLight, fontWeight: 'bold' }}>ART.</span>
                <span style={{ fontSize: '1.4rem', color: C.primary, fontWeight: 'bold' }}>{item.articolo}</span>
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '0.95rem', color: C.text, lineHeight: 1.3, marginBottom: '4px' }}>{item.titolo}</h3>
                <p style={{ fontSize: '0.8rem', color: C.textLight, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '240px' }}>
                  {item.testo.substring(0, 60)}...
                </p>
              </div>
              <span style={{ color: C.textLight }}>›</span>
            </div>
          ))}
          {filteredList.length === 0 && (
            <div style={{ textAlign: 'center', padding: '20px', color: C.textLight }}>Nessun risultato trovato.</div>
          )}
        </div>
      )}
    </PageWrapper>
  );
};
