import React, { useState, useEffect, useMemo } from 'react';
import { PageWrapper } from '../components/layout/PageWrapper';
import { SkeletonList } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { SearchBar } from '../components/ui/SearchBar';
import { Badge } from '../components/ui/Badge';
import { Icon } from '../components/ui/Icon';
import { ProntuarioItem } from '../components/ProntuarioItem';
import { ProntuarioDetail } from '../components/ProntuarioDetail';
import { C } from '../styles/theme';
import { S } from '../styles/styles';
import { useProntuario } from '../hooks/useProntuario';
import { usePreferiti } from '../hooks/usePreferiti';
import { useNote } from '../hooks/useNote';
import { useToast } from '../components/ui/ToastManager';
import { useDebounce } from '../hooks/useDebounce';
import { useData } from '../context/DataContext';
import { groupByArticolo } from '../utils/prontuarioUtils';
import { createProntuarioSearchIndex, MIN_SEARCH_CHARS } from '../utils/searchEngine';
import posthog from 'posthog-js';

const backBtnStyle = {
  fontSize: '0.85rem', padding: '6px 12px', color: '#fff',
  backgroundColor: 'rgba(255,255,255,0.2)', border: 'none',
  borderRadius: '8px', cursor: 'pointer',
  display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold',
};

const SectionHeader = ({ label }) => (
  <div style={{ padding: '8px 4px 4px', fontSize: '0.75rem', fontWeight: '700', color: C.textLight, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
    {label}
  </div>
);

export const Prontuario = ({ onNavigate, navigationParams }) => {
  const { list, loading, refresh } = useProntuario();
  const { preferiti, toggle } = usePreferiti();
  const { note, save } = useNote();
  const { showToast } = useToast();
  const { searchSynonyms = [] } = useData();

  const [search, setSearch] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [returnTo, setReturnTo] = useState(null);
  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    if (navigationParams?.selectedId && list.length > 0) {
      const item = list.find(i => i.id === navigationParams.selectedId);
      if (item) {
        setSelectedItem(item);
        // Salva returnTo prima di azzerare i params
        if (navigationParams.returnTo) setReturnTo(navigationParams.returnTo);
        onNavigate('prontuario', null);
      }
    }
  }, [navigationParams, list, onNavigate]);

  const groups = useMemo(() => groupByArticolo(list), [list]);

  const searchIndex = useMemo(
    () => createProntuarioSearchIndex(list, searchSynonyms),
    [list, searchSynonyms]
  );

  const searchResults = useMemo(() => {
    if (debouncedSearch.trim().length < MIN_SEARCH_CHARS) return null;
    return searchIndex.search(debouncedSearch, MIN_SEARCH_CHARS);
  }, [searchIndex, debouncedSearch]);

  const handleSelectItem = async (item) => {
    setSelectedItem(item);
    posthog.capture('prontuario_item_selected', { prontuario_id: item.id });
  };

  const handleSaveNota = async (testo) => {
    try {
      await save(selectedItem.id, testo);
      showToast('Nota salvata!', 'success');
      posthog.capture('prontuario_note_saved', { prontuario_id: selectedItem.id });
    } catch {
      showToast('Errore nel salvataggio della nota', 'error');
    }
  };

  const handleToggleFavorite = async (itemId) => {
    await toggle(itemId);
  };

  // ── DETTAGLIO VOCE ────────────────────────────────────────────────────────
  if (selectedItem) {
    return (
      <PageWrapper
        style={{ padding: 0 }}
        title={null}
        subtitle={selectedItem.rif_normativo}
        onNavigate={onNavigate}
        headerLeftAction={
          <button
            onClick={() => {
              if (returnTo === 'ricerca') {
                setReturnTo(null);
                setSelectedItem(null);
                onNavigate('ricerca');
              } else {
                setSelectedItem(null);
              }
            }}
            style={backBtnStyle}
          >
            ← Indietro
          </button>
        }
        headerChildren={
          <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
            <button onClick={() => handleToggleFavorite(selectedItem.id)} style={{ fontSize: '1rem', color: '#fff', fontWeight: 'bold' }}>
              {preferiti.includes(selectedItem.id) ? 'Preferito' : 'Aggiungi preferito'}
            </button>
          </div>
        }
      >
        <ProntuarioDetail
          item={selectedItem}
          isFavorite={preferiti.includes(selectedItem.id)}
          nota={note[selectedItem.id] || ''}
          onSaveNota={handleSaveNota}
          onNavigate={onNavigate}
        />
      </PageWrapper>
    );
  }

  // ── GRUPPO ARTICOLO ───────────────────────────────────────────────────────
  if (selectedGroup) {
    return (
      <PageWrapper
        title={selectedGroup.label}
        subtitle={selectedGroup.titolo}
        onNavigate={onNavigate}
        headerLeftAction={<button onClick={() => setSelectedGroup(null)} style={backBtnStyle}>← Indietro</button>}
      >
        <div style={S.list}>
          {selectedGroup.voci.map(item => (
            <ProntuarioItem
              key={item.id}
              item={item}
              isFavorite={preferiti.includes(item.id)}
              hasNota={!!note[item.id]}
              onClick={() => handleSelectItem(item)}
            />
          ))}
        </div>
      </PageWrapper>
    );
  }

  // ── LISTA PRINCIPALE ──────────────────────────────────────────────────────
  const renderGroupRow = (group, isSuggested = false) => (
    <div
      key={group.articolo_numero}
      onClick={() => setSelectedGroup(group)}
      style={{
        ...S.cardClickable,
        display: 'flex', alignItems: 'center', gap: '12px',
        ...(isSuggested ? { backgroundColor: `${C.warning}18`, borderLeft: `4px solid ${C.warning}` } : {}),
      }}
      role="button"
      aria-label={`${group.label} - ${group.titolo || ''} - ${group.count} voci`}
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && setSelectedGroup(group)}
    >
      <div style={{ minWidth: '56px', height: '56px', borderRadius: '12px', backgroundColor: isSuggested ? `${C.warning}30` : C.accentLight, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: '0.6rem', color: isSuggested ? C.warning : C.accent, fontWeight: '700', textTransform: 'uppercase' }}>Art.</span>
        <span style={{ fontSize: '1rem', color: isSuggested ? C.warning : C.accent, fontWeight: '800', lineHeight: 1 }}>{group.articolo_numero}</span>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        {isSuggested && (
          <Badge type="warning" style={{ fontSize: '0.6rem', display: 'inline-flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
            <Icon name="zap" size={10} strokeWidth={2.5} /> Risultato suggerito
          </Badge>
        )}
        <h3 style={{ fontSize: '0.95rem', color: C.text, lineHeight: 1.3, marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {group.titolo || `Articolo ${group.articolo_numero}`}
        </h3>
        <span style={{ fontSize: '0.8rem', color: C.textLight, display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
          {group.count} {group.count === 1 ? 'voce' : 'voci'}
          {group.voci.some(v => note[v.id]) && <Icon name="file-text" size={12} color={C.accent} aria-label="Nota presente" />}
        </span>
      </div>
      <span style={{ color: C.textLight }}>›</span>
    </div>
  );

  let content;
  if (loading) {
    content = <SkeletonList count={5} />;
  } else if (searchResults) {
    const { exact, suggested, other } = searchResults;
    const hasResults = exact.length > 0 || suggested.length > 0 || other.length > 0;
    if (!hasResults) {
      content = <EmptyState compact icon="clipboard-list" title="Nessun risultato" subtitle="Prova con un termine diverso o il numero dell'articolo." />;
    } else {
      content = (
        <div style={S.list}>
          {suggested.length > 0 && (
            <><SectionHeader label="Risultato suggerito" />{suggested.map(g => renderGroupRow(g, true))}</>
          )}
          {exact.length > 0 && (
            <><SectionHeader label={`Articolo ${debouncedSearch.trim()} (corrispondenza esatta)`} />{exact.map(g => renderGroupRow(g))}</>
          )}
          {other.length > 0 && (
            <><SectionHeader label={(suggested.length > 0 || exact.length > 0) ? 'Altri risultati' : 'Risultati'} />{other.map(g => renderGroupRow(g))}</>
          )}
        </div>
      );
    }
  } else {
    content = <div style={S.list}>{groups.map(g => renderGroupRow(g))}</div>;
  }

  return (
    <PageWrapper title="Prontuario" subtitle="Archivio operativo" onNavigate={onNavigate} onRefresh={refresh} enablePullToRefresh>
      <div style={{ marginBottom: '16px' }}>
        <SearchBar
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Cerca articolo, titolo o codice..."
          loading={search.trim().length >= MIN_SEARCH_CHARS && search !== debouncedSearch}
        />
      </div>
      {content}
    </PageWrapper>
  );
};
