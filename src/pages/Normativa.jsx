import React, { useState, useEffect, useMemo } from 'react';
import { PageWrapper } from '../components/layout/PageWrapper';
import { SearchBar } from '../components/ui/SearchBar';
import { Badge } from '../components/ui/Badge';
import { C } from '../styles/theme';
import { S } from '../styles/styles';
import { PS } from '../styles/pages';
import { useNormativa } from '../hooks/useNormativa';
import { useGamificationContext } from '../context/GamificationContext';
import { useDebounce } from '../hooks/useDebounce';

export const Normativa = ({ onNavigate, navigationParams }) => {
  const { list, loading } = useNormativa();
  const { addXP } = useGamificationContext();
  const [search, setSearch] = useState('');
  
  const [selectedTitolo, setSelectedTitolo] = useState(null);
  const [selectedCapo, setSelectedCapo] = useState(null);
  const [selectedArticolo, setSelectedArticolo] = useState(null);

  const cleanTitle = (title) => {
    if (!title) return '';
    return title.replace(/^\s*\(\s*/, '').replace(/\s*\)\s*\.?\s*$/, '').trim();
  };

  const hierarchy = useMemo(() => {
    const tree = [];
    const titoliMap = new Map();
    const capiMap = new Map();
    const articoliMap = new Map();

    list.forEach(item => {
      // 1. Titolo
      const tNum = item.titolo_numero || 'Titolo Sconosciuto';
      let titolo = titoliMap.get(tNum);
      if (!titolo) {
        titolo = {
          id: `t_${tNum}`,
          numero: tNum,
          nome: item.titolo_nome || '',
          capi: [],
          articoli: [],
          ordine: item.ordine || 0,
        };
        titoliMap.set(tNum, titolo);
        tree.push(titolo);
      }

      // 2. Capo
      const cNum = item.capo_numero;
      let capo = null;
      if (cNum) {
        const capoKey = `${tNum}_${cNum}`;
        capo = capiMap.get(capoKey);
        if (!capo) {
          capo = {
            id: `c_${capoKey}`,
            numero: cNum,
            nome: item.capo_nome || '',
            articoli: [],
            ordine: item.ordine || 0,
          };
          capiMap.set(capoKey, capo);
          titolo.capi.push(capo);
        }
      }

      // 3. Articolo
      const aNum = item.articolo_num;
      const artKey = `art_${aNum}`;
      let articolo = articoliMap.get(artKey);
      if (!articolo) {
        articolo = {
          id: artKey,
          articolo: item.articolo,
          articolo_num: item.articolo_num,
          titolo_articolo: item.titolo_articolo || item.titolo,
          commi: [],
          titolo_numero: item.titolo_numero,
          capo_numero: item.capo_numero,
        };
        articoliMap.set(artKey, articolo);
        
        if (capo) {
          capo.articoli.push(articolo);
        } else {
          titolo.articoli.push(articolo);
        }
      }

      // 4. Comma
      articolo.commi.push(item);
    });

    // Sorting
    tree.sort((a, b) => a.ordine - b.ordine);
    tree.forEach(t => {
      t.capi.sort((a, b) => a.ordine - b.ordine);
      t.capi.forEach(c => {
        c.articoli.sort((a, b) => a.articolo_num - b.articolo_num);
        c.articoli.forEach(art => art.commi.sort((a, b) => a.comma_num - b.comma_num));
      });
      t.articoli.sort((a, b) => a.articolo_num - b.articolo_num);
      t.articoli.forEach(art => art.commi.sort((a, b) => a.comma_num - b.comma_num));
    });

    return { tree, articoliMap: Array.from(articoliMap.values()) };
  }, [list]);

  useEffect(() => {
    if (navigationParams?.selectedId && hierarchy.articoliMap.length > 0) {
      const art = hierarchy.articoliMap.find(a => a.commi.some(c => c.id === navigationParams.selectedId));
      if (art) {
        setSelectedArticolo(art);
        onNavigate('normativa', null);
      }
    }
  }, [navigationParams, hierarchy, onNavigate]);

  const debouncedSearch = useDebounce(search, 300);

  const filteredArticoli = useMemo(() => {
    const s = debouncedSearch.trim().toLowerCase();
    if (!s) return null;

    return hierarchy.articoliMap.filter(art => {
      if (
        (art.titolo_articolo?.toLowerCase() || '').includes(s) || 
        (art.articolo?.toLowerCase() || '').includes(s) || 
        (art.articolo_num?.toString() || '') === debouncedSearch
      ) {
        return true;
      }
      return art.commi.some(c => 
        (c.testo?.toLowerCase() || '').includes(s) ||
        (c.comma?.toLowerCase() || '').includes(s)
      );
    });
  }, [hierarchy, debouncedSearch]);

  const handleBack = () => {
    if (selectedArticolo) setSelectedArticolo(null);
    else if (selectedCapo) setSelectedCapo(null);
    else if (selectedTitolo) setSelectedTitolo(null);
  };

  const backBtnStyle = {
    fontSize: '0.85rem',
    padding: '6px 12px',
    color: '#fff',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontWeight: 'bold',
  };

  const renderArticleRow = (art) => (
    <div key={art.id} onClick={async () => {
      await addXP(5, 'article');
      setSelectedArticolo(art);
    }} style={{...PS.normativaItemRow, marginBottom: '12px'}}>
      <div style={PS.normativaItemNum}>
        <span style={PS.normativaItemNumPrefix}>{(art.articolo || 'Art.').split('.')[0].toUpperCase()}</span>
        <span style={PS.normativaItemNumValue}>{art.articolo_num || '?'}</span>
      </div>
      <div style={{ flex: 1 }}>
        <h3 style={PS.normativaItemTitle}>{cleanTitle(art.titolo_articolo || 'Senza Titolo')}</h3>
        <p style={PS.normativaItemPreview}>{(art.commi || []).length} commi</p>
      </div>
      <span style={{ color: C.textLight }}>›</span>
    </div>
  );

  const renderTitoloRow = (titolo) => (
    <div key={titolo.id} onClick={() => setSelectedTitolo(titolo)} style={{...PS.normativaItemRow, marginBottom: '12px'}}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '0.85rem', color: C.primary, fontWeight: 'bold', marginBottom: '4px' }}>{titolo.numero}</div>
        <h3 style={{...PS.normativaItemTitle, fontSize: '1.05rem'}}>{cleanTitle(titolo.nome) || 'Senza Nome'}</h3>
      </div>
      <span style={{ color: C.textLight }}>›</span>
    </div>
  );

  const renderCapoRow = (capo) => (
    <div key={capo.id} onClick={() => setSelectedCapo(capo)} style={{...PS.normativaItemRow, marginBottom: '12px', borderLeft: `4px solid ${C.accent}`}}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '0.8rem', color: C.accent, fontWeight: 'bold', marginBottom: '4px' }}>{capo.numero}</div>
        <h3 style={{...PS.normativaItemTitle, fontSize: '0.95rem'}}>{cleanTitle(capo.nome) || 'Senza Nome'}</h3>
      </div>
      <span style={{ color: C.textLight }}>›</span>
    </div>
  );

  if (selectedArticolo) {
    const breadcrumb = `${selectedArticolo.titolo_numero || ''}${selectedArticolo.capo_numero ? ' > ' + selectedArticolo.capo_numero : ''} > ${selectedArticolo.articolo}`;
    return (
      <PageWrapper
        style={{ padding: 0 }}
        title={cleanTitle(selectedArticolo.titolo_articolo)}
        subtitle={breadcrumb}
        onNavigate={onNavigate}
        headerLeftAction={<button onClick={handleBack} style={backBtnStyle}><span>←</span> Indietro</button>}
      >
        <div style={PS.normativaDetailBody}>
          {selectedArticolo.commi.map(c => (
            <div key={c.id} style={{ marginBottom: '16px', padding: '16px', backgroundColor: '#fff', borderRadius: '12px', border: `1px solid ${C.border}`, boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
              <Badge type="secondary" style={{ marginBottom: '10px', display: 'inline-block' }}>Comma {(c.comma || '?').replace(/\.$/, '')}</Badge>
              <p style={{ ...PS.normativaDetailText, marginTop: 0 }}>{c.testo}</p>
            </div>
          ))}
        </div>
      </PageWrapper>
    );
  }

  const isDeep = selectedTitolo || selectedCapo;
  const backAction = isDeep ? <button onClick={handleBack} style={backBtnStyle}><span>←</span> Indietro</button> : null;

  let viewContent;
  if (loading) {
    viewContent = <div style={S.emptyState}>Caricamento in corso...</div>;
  } else if (filteredArticoli) {
    viewContent = (
      <div style={S.list}>
        {filteredArticoli.length > 0 ? filteredArticoli.map(renderArticleRow) : <div style={S.emptyState}>Nessun risultato trovato.</div>}
      </div>
    );
  } else if (selectedCapo) {
    viewContent = (
      <div style={S.list}>
        <div style={{ marginBottom: '16px', padding: '0 4px', fontSize: '0.85rem', color: C.textLight }}>
          <span onClick={() => { setSelectedTitolo(null); setSelectedCapo(null); }} style={{cursor: 'pointer', textDecoration: 'underline'}}>Normativa</span>
          {' > '}
          <span onClick={() => setSelectedCapo(null)} style={{cursor: 'pointer', textDecoration: 'underline'}}>{selectedTitolo.numero}</span>
          {' > '}
          <span style={{fontWeight: 'bold', color: C.text}}>{selectedCapo.numero}</span>
        </div>
        {selectedCapo.articoli.map(renderArticleRow)}
      </div>
    );
  } else if (selectedTitolo) {
    viewContent = (
      <div style={S.list}>
        <div style={{ marginBottom: '16px', padding: '0 4px', fontSize: '0.85rem', color: C.textLight }}>
          <span onClick={() => setSelectedTitolo(null)} style={{cursor: 'pointer', textDecoration: 'underline'}}>Normativa</span>
          {' > '}
          <span style={{fontWeight: 'bold', color: C.text}}>{selectedTitolo.numero}</span>
        </div>
        {selectedTitolo.capi.map(renderCapoRow)}
        {selectedTitolo.articoli.map(renderArticleRow)}
      </div>
    );
  } else {
    viewContent = (
      <div style={S.list}>
        {hierarchy.tree.map(renderTitoloRow)}
      </div>
    );
  }

  return (
    <PageWrapper 
      title="Normativa PolisRoad" 
      subtitle="Codice della Strada" 
      onNavigate={onNavigate}
      headerLeftAction={backAction}
    >
      <div style={{ marginBottom: '16px' }}>
        <SearchBar value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cerca n° articolo o parola..." />
      </div>

      {viewContent}
    </PageWrapper>
  );
};


