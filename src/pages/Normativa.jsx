import React, { useState, useEffect } from 'react';
import { PageWrapper } from '../components/layout/PageWrapper';
import { SearchBar } from '../components/ui/SearchBar';
import { Badge } from '../components/ui/Badge';
import { C } from '../styles/theme';
import { S } from '../styles/styles';
import { PS } from '../styles/pages';
import { useNormativa } from '../hooks/useNormativa';

export const Normativa = ({ onNavigate, navigationParams }) => {
  const { list, loading } = useNormativa();
  const [search, setSearch] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    if (navigationParams?.selectedId && list.length > 0) {
      const item = list.find(i => i.id === navigationParams.selectedId);
      if (item) {
        setSelectedItem(item);
        onNavigate('normativa', null);
      }
    }
  }, [navigationParams, list, onNavigate]);


  const cleanTitle = (title) => {
    if (!title) return '';
    return title.replace(/^\(|\)\.?$/g, '').trim();
  };

  const filteredList = list.filter(item => {
    const s = search.toLowerCase();
    return (
      (item.titolo?.toLowerCase() || '').includes(s) ||
      (item.articolo?.toLowerCase() || '').includes(s) ||
      (item.testo?.toLowerCase() || '').includes(s) ||
      (item.articolo_num && item.articolo_num.toString() === search)
    );
  });

  if (selectedItem) {
    return (
      <PageWrapper style={{ padding: 0 }} hideLogo={true} onNavigate={onNavigate}>
        <div style={PS.normativaDetailHeader}>
          <button onClick={() => setSelectedItem(null)} style={{ fontSize: '1.2rem', padding: '4px' }}>⬅️</button>
          <div style={{ flex: 1 }}>
            <div style={PS.normativaDetailBadges}>
              <Badge type="primary">{selectedItem.articolo}</Badge>
              {selectedItem.comma && <Badge type="secondary">Comma {selectedItem.comma}</Badge>}
            </div>
            <h2 style={{ fontSize: '1.1rem', color: C.text, lineHeight: 1.3 }}>{cleanTitle(selectedItem.titolo)}</h2>
          </div>
        </div>
        <div style={PS.normativaDetailBody}>
          <p style={PS.normativaDetailText}>{selectedItem.testo}</p>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper onNavigate={onNavigate}>
      <div style={{ marginBottom: '16px' }}>
        <h2 style={S.sectionTitle}>Normativa PolisRoad</h2>
        <SearchBar value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cerca n° articolo o parola..." />
      </div>

      {loading ? (
        <div style={S.emptyState}>Caricamento in corso...</div>
      ) : (
        <div style={S.list}>
          {filteredList.map(item => (
            <div key={item.id} onClick={() => setSelectedItem(item)} style={PS.normativaItemRow}>
              <div style={PS.normativaItemNum}>
                <span style={PS.normativaItemNumPrefix}>{item.articolo.split('.')[0].toUpperCase()}</span>
                <span style={PS.normativaItemNumValue}>{item.articolo_num}</span>
                {item.comma_num && <span style={PS.normativaItemComma}>c. {item.comma_num}</span>}
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={PS.normativaItemTitle}>{cleanTitle(item.titolo)}</h3>
                <p style={PS.normativaItemPreview}>{item.testo.substring(0, 60)}...</p>
              </div>
              <span style={{ color: C.textLight }}>›</span>
            </div>
          ))}
          {filteredList.length === 0 && (
            <div style={S.emptyState}>Nessun risultato trovato.</div>
          )}
        </div>
      )}
    </PageWrapper>
  );
};
