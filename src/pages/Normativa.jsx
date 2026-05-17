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

  // Raggruppa i commi per articolo
  const groupedList = React.useMemo(() => {
    const groups = Object.values(list.reduce((acc, item) => {
      const art = item.articolo_num;
      if (!acc[art]) {
        acc[art] = {
          id: `art_${art}`,
          articolo: item.articolo,
          articolo_num: item.articolo_num,
          titolo: item.titolo,
          commi: []
        };
      }
      acc[art].commi.push(item);
      return acc;
    }, {})).sort((a, b) => a.articolo_num - b.articolo_num);

    groups.forEach(g => g.commi.sort((a, b) => a.comma_num - b.comma_num));
    return groups;
  }, [list]);

  useEffect(() => {
    if (navigationParams?.selectedId && groupedList.length > 0) {
      const group = groupedList.find(g => g.commi.some(c => c.id === navigationParams.selectedId));
      if (group) {
        setSelectedItem(group);
        onNavigate('normativa', null);
      }
    }
  }, [navigationParams, groupedList, onNavigate]);

  const cleanTitle = (title) => {
    if (!title) return '';
    return title.replace(/^\(|\)\.?$/g, '').trim();
  };

  const filteredList = React.useMemo(() => {
    const s = search.toLowerCase();
    if (!s) return groupedList;

    return groupedList.filter(group => {
      // Cerca nel titolo, nel testo 'Art. X', o nel numero esatto
      if (
        (group.titolo?.toLowerCase() || '').includes(s) || 
        (group.articolo?.toLowerCase() || '').includes(s) || 
        (group.articolo_num?.toString() || '') === search
      ) {
        return true;
      }
      // Cerca all'interno dei testi di tutti i commi
      return group.commi.some(c => 
        (c.testo?.toLowerCase() || '').includes(s) ||
        (c.comma?.toLowerCase() || '').includes(s)
      );
    });
  }, [groupedList, search]);

  if (selectedItem) {
    return (
      <PageWrapper style={{ padding: 0 }} hideLogo={true} onNavigate={onNavigate}>
        <div style={PS.normativaDetailHeader}>
          <button onClick={() => setSelectedItem(null)} style={{ fontSize: '1.2rem', padding: '4px' }}>⬅️</button>
          <div style={{ flex: 1 }}>
            <div style={PS.normativaDetailBadges}>
              <Badge type="primary">{selectedItem.articolo}</Badge>
            </div>
            <h2 style={{ fontSize: '1.1rem', color: C.text, lineHeight: 1.3 }}>{cleanTitle(selectedItem.titolo)}</h2>
          </div>
        </div>
        <div style={PS.normativaDetailBody}>
          {selectedItem.commi.map(c => (
            <div key={c.id} style={{ marginBottom: '16px', padding: '16px', backgroundColor: '#fff', borderRadius: '12px', border: `1px solid ${C.border}`, boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
              <Badge type="secondary" style={{ marginBottom: '10px', display: 'inline-block' }}>Comma {c.comma.replace(/\.$/, '')}</Badge>
              <p style={{ ...PS.normativaDetailText, marginTop: 0 }}>{c.testo}</p>
            </div>
          ))}
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
          {filteredList.map(group => (
            <div key={group.id} onClick={() => setSelectedItem(group)} style={PS.normativaItemRow}>
              <div style={PS.normativaItemNum}>
                <span style={PS.normativaItemNumPrefix}>{group.articolo.split('.')[0].toUpperCase()}</span>
                <span style={PS.normativaItemNumValue}>{group.articolo_num}</span>
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={PS.normativaItemTitle}>{cleanTitle(group.titolo)}</h3>
                <p style={PS.normativaItemPreview}>{group.commi.length} commi</p>
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
