import React, { useState, useEffect, useMemo } from 'react';
import posthog from 'posthog-js';
import { PageWrapper } from '../components/layout/PageWrapper';
import { SkeletonList } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { SearchBar } from '../components/ui/SearchBar';
import { Badge } from '../components/ui/Badge';
import { C } from '../styles/theme';
import { Icon } from '../components/ui/Icon';
import { S } from '../styles/styles';
import { PS } from '../styles/pages';
import { useNormativa } from '../hooks/useNormativa';
import { useGamificationContext } from '../context/GamificationContext';
import { useDebounce } from '../hooks/useDebounce';

export const Normativa = ({ onNavigate, navigationParams }) => {
  const { list, loading } = useNormativa();
  const { addXP } = useGamificationContext();
  const [search, setSearch] = useState('');
  
  const [selectedCategory, setSelectedCategory] = useState(null);
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
    if (!navigationParams || hierarchy.articoliMap.length === 0) return;

    // Navigazione diretta a un comma specifico (dal motore di ricerca)
    if (navigationParams.selectedId) {
      const art = hierarchy.articoliMap.find(a => a.commi.some(c => c.id === navigationParams.selectedId));
      if (art) {
        setSelectedArticolo(art);
        onNavigate('normativa', null);
      }
      return;
    }

    // Navigazione per numero articolo (link intelligente da Prontuario)
    if (navigationParams.searchArticolo) {
      const artNum = String(navigationParams.searchArticolo).trim();
      const art = hierarchy.articoliMap.find(a =>
        String(a.numero || '').trim() === artNum ||
        String(a.articolo_num || '').trim() === artNum
      );
      if (art) {
        setSelectedArticolo(art);
      } else {
        // Fallback: attiva la barra di ricerca con il numero articolo
        setSearch(artNum);
      }
      onNavigate('normativa', null);
    }
  }, [navigationParams, hierarchy, onNavigate]);

  const debouncedSearch = useDebounce(search, 300);

  const filteredArticoli = useMemo(() => {
    const s = debouncedSearch.trim().toLowerCase();
    if (!s) return null;

    const isNumeric = /^\d+$/.test(s);

    const exact = [];
    const partial = [];
    const text = [];

    hierarchy.articoliMap.forEach(art => {
      const artNum = (art.articolo_num?.toString() || '').toLowerCase();
      const artLabel = (art.articolo || '').toLowerCase(); // es. "art. 142"
      const titolo = (art.titolo_articolo || '').toLowerCase();
      const hasCommaMatch = art.commi.some(c =>
        (c.testo?.toLowerCase() || '').includes(s) ||
        (c.comma?.toLowerCase() || '').includes(s)
      );

      if (isNumeric) {
        if (artNum === s) {
          exact.push(art);
        } else if (artLabel.startsWith(`art. ${s}`) || artLabel.startsWith(`art.${s}`)) {
          partial.push(art);
        } else if (titolo.includes(s) || hasCommaMatch) {
          text.push(art);
        }
      } else {
        if (titolo.includes(s) || artLabel.includes(s) || hasCommaMatch) {
          text.push(art);
        }
      }
    });

    return { exact, partial, text, isNumeric };
  }, [hierarchy, debouncedSearch]);

  const handleBack = () => {
    if (selectedArticolo) setSelectedArticolo(null);
    else if (selectedCapo) setSelectedCapo(null);
    else if (selectedTitolo) setSelectedTitolo(null);
    else if (selectedCategory) setSelectedCategory(null);
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
      posthog.capture('normativa_article_opened', {
        articolo_num: art.articolo_num,
        titolo: art.titolo_articolo,
      });
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

  const renderCategoryRow = (id, title, desc) => (
    <div key={id} onClick={() => setSelectedCategory(id)} style={{...PS.normativaItemRow, marginBottom: '12px', padding: '16px'}}>
      <div style={{ flex: 1 }}>
        <h3 style={{...PS.normativaItemTitle, fontSize: '1.1rem', color: C.primary}}>{title}</h3>
        {desc && <p style={{ fontSize: '0.85rem', color: C.textLight, marginTop: '4px' }}>{desc}</p>}
      </div>
      <span style={{ color: C.textLight, fontSize: '1.5rem' }}>›</span>
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
          <button
            onClick={() => setSelectedArticolo(null)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: C.card,
              color: C.primary,
              border: `1px solid ${C.border}`,
              borderRadius: '8px',
              padding: '8px 12px',
              fontSize: '0.9rem',
              fontWeight: '600',
              cursor: 'pointer',
              marginBottom: '16px',
            }}
          >
            ← Indietro
          </button>
          {selectedArticolo.commi.map(c => (
            <div key={c.id} style={{ marginBottom: '16px', padding: '16px', backgroundColor: C.card, borderRadius: '12px', border: `1px solid ${C.border}`, boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
              <Badge type="secondary" style={{ marginBottom: '10px', display: 'inline-block' }}>Comma {(c.comma || '?').replace(/\.$/, '')}</Badge>
              <p style={{ ...PS.normativaDetailText, marginTop: 0 }}>{c.testo}</p>
            </div>
          ))}
        </div>
      </PageWrapper>
    );
  }

  const isDeep = selectedCategory || selectedTitolo || selectedCapo;
  const backAction = isDeep ? <button onClick={handleBack} style={backBtnStyle}><span>←</span> Indietro</button> : null;

  let viewContent;
  if (loading) {
    viewContent = <SkeletonList count={6} />;
  } else if (filteredArticoli) {
    const { exact, partial, text } = filteredArticoli;
    const hasResults = exact.length > 0 || partial.length > 0 || text.length > 0;

    const sectionLabel = (label) => (
      <div style={{ padding: '8px 4px 2px', fontSize: '0.72rem', fontWeight: '700', color: '#999', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        {label}
      </div>
    );

    viewContent = (
      <div style={S.list}>
        {!hasResults && <EmptyState compact icon="book-open" title="Nessun risultato" subtitle="Prova con un termine diverso o il numero dell'articolo." />}
        {exact.length > 0 && (
          <>
            {sectionLabel(`Art. ${debouncedSearch.trim()} — corrispondenza esatta`)}
            {exact.map(renderArticleRow)}
          </>
        )}
        {partial.length > 0 && (
          <>
            {sectionLabel('Articoli correlati')}
            {partial.map(renderArticleRow)}
          </>
        )}
        {text.length > 0 && (
          <>
            {sectionLabel('Altri risultati')}
            {text.map(renderArticleRow)}
          </>
        )}
      </div>
    );
  } else if (selectedCapo) {
    viewContent = (
      <div style={S.list}>
        <button
          onClick={() => setSelectedCapo(null)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: C.card,
            color: C.primary,
            border: `1px solid ${C.border}`,
            borderRadius: '8px',
            padding: '8px 12px',
            fontSize: '0.9rem',
            fontWeight: '600',
            cursor: 'pointer',
            marginBottom: '16px',
          }}
        >
          ← Indietro
        </button>
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
  } else if (selectedCategory === 'cds') {
    const showOnlyArticles = hierarchy.tree.length === 1 && hierarchy.tree[0].numero === 'Titolo Sconosciuto';
    
    viewContent = (
      <div style={S.list}>
        <div style={{ marginBottom: '16px', padding: '0 4px', fontSize: '0.85rem', color: C.textLight }}>
          <span onClick={() => setSelectedCategory(null)} style={{cursor: 'pointer', textDecoration: 'underline'}}>Categorie</span>
          {' > '}
          <span style={{fontWeight: 'bold', color: C.text}}>Codice della Strada</span>
        </div>
        {showOnlyArticles 
          ? hierarchy.tree[0].articoli.map(renderArticleRow)
          : hierarchy.tree.map(renderTitoloRow)
        }
      </div>
    );
  } else if (selectedCategory) {
    viewContent = (
      <div style={S.list}>
        <div style={{ marginBottom: '16px', padding: '0 4px', fontSize: '0.85rem', color: C.textLight }}>
          <span onClick={() => setSelectedCategory(null)} style={{cursor: 'pointer', textDecoration: 'underline'}}>Categorie</span>
          {' > '}
          <span style={{fontWeight: 'bold', color: C.text}}>Lavori in corso</span>
        </div>
        <div style={{ ...S.emptyState, marginTop: '40px' }}>
          <span style={{ display: 'block', marginBottom: '12px', color: 'var(--color-warning)' }}><Icon name="construction" size={32} /></span>
          Stiamo lavorando per aggiungere questa normativa.<br/>Torna presto!
        </div>
      </div>
    );
  } else {
    viewContent = (
      <div style={S.list}>
        {renderCategoryRow('cds', 'Codice della Strada', 'Decreto Legislativo 30 aprile 1992 n. 285', hierarchy.tree.length)}
        {renderCategoryRow('regolamento', 'Regolamento di Attuazione', 'D.P.R. 16 dicembre 1992, n. 495')}
        {renderCategoryRow('penale', 'Codice Penale', 'Regio Decreto 19 ottobre 1930, n. 1398')}
        {renderCategoryRow('costituzione', 'Costituzione Italiana', 'Principi fondamentali')}
      </div>
    );
  }

  return (
    <PageWrapper 
      title="Normative" 
      subtitle={selectedCategory === 'cds' ? "Codice della Strada" : "Testi di Legge"} 
      onNavigate={onNavigate}
      headerLeftAction={backAction}
      onRefresh={refresh}
      enablePullToRefresh
    >
      <div style={{ marginBottom: '16px' }}>
        <SearchBar value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cerca n° articolo o parola..." />
      </div>

      {viewContent}
    </PageWrapper>
  );
};


