import React, { useState, useEffect, useMemo } from 'react';
import { PageWrapper } from '../components/layout/PageWrapper';
import { SkeletonList } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { SearchBar } from '../components/ui/SearchBar';
import { ProntuarioItem } from '../components/ProntuarioItem';
import { ProntuarioDetail } from '../components/ProntuarioDetail';
import { C } from '../styles/theme';
import { S } from '../styles/styles';
import { useProntuario } from '../hooks/useProntuario';
import { usePreferiti } from '../hooks/usePreferiti';
import { useNote } from '../hooks/useNote';
import { useToast } from '../components/ui/ToastManager';
import { useGamificationContext } from '../context/GamificationContext';
import { useDebounce } from '../hooks/useDebounce';
import { sortItems, groupByArticolo } from '../utils/prontuarioUtils';
import posthog from 'posthog-js';

// Ricerca con priorità: esatta sul numero articolo > rif_normativo > testo libero
const smartSearch = (list, raw) => {
  const s = raw.trim().toLowerCase();
  if (s.length < 2) return { exact: [], partial: [], text: [] };
  const isNumeric = /^\d+$/.test(s);
  const exact = [], partial = [], text = [];
  list.forEach(item => {
    const artNum = (item.articolo_numero || '').toLowerCase();
    const rifNorm = (item.rif_normativo || '').toLowerCase();
    const titolo = (item.titolo || '').toLowerCase();
    const codice = (item.codice_violazione || '').toLowerCase();
    if (isNumeric) {
      if (artNum === s) exact.push(item);
      else if (rifNorm.startsWith(`art. ${s}`) || rifNorm.startsWith(`art.${s}`)) partial.push(item);
      else if (titolo.includes(s) || rifNorm.includes(s) || codice.includes(s)) text.push(item);
    } else {
      if (titolo.includes(s) || rifNorm.includes(s) || codice.includes(s)) text.push(item);
    }
  });
  return { exact, partial, text };
};

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
  const { addXP } = useGamificationContext();

  const [search, setSearch] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    if (navigationParams?.selectedId && list.length > 0) {
      const item = list.find(i => i.id === navigationParams.selectedId);
      if (item) { setSelectedItem(item); onNavigate('prontuario', null); }
    }
  }, [navigationParams, list, onNavigate]);

  const groups = useMemo(() => groupByArticolo(list), [list]);

  const searchResults = useMemo(() => {
    if (debouncedSearch.trim().length < 2) return null;
    const { exact, partial, text } = smartSearch(list, debouncedSearch);
    return { exactGroups: groupByArticolo(exact), partial: sortItems(partial), text: sortItems(text) };
  }, [list, debouncedSearch]);

  const handleSelectItem = async (item) => {
    setSelectedItem(item);
    await addXP(5, 'article');
    posthog.capture('prontuario_item_selected', { prontuario_id: item.id });
  };

  const handleContestazione = async () => {
    await addXP(20, 'contestazione');
    showToast('Contestazione registrata con successo!', 'success');
    posthog.capture('prontuario_contestazione', { prontuario_id: selectedItem?.id });
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
    const isFav = preferiti.includes(itemId);
    await toggle(itemId);
    if (!isFav) await addXP(15, 'favorite');
  };

  // ── DETTAGLIO VOCE ────────────────────────────────────────────────────────
  if (selectedItem) {
    return (
      <PageWrapper
        style={{ padding: 0 }}
        title={null}
        subtitle={selectedItem.rif_normativo}
        onNavigate={onNavigate}
        headerLeftAction={<button onClick={() => setSelectedItem(null)} style={backBtnStyle}>← Indietro</button>}
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
          onContestazione={handleContestazione}
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
              onClick={() => handleSelectItem(item)}
            />
          ))}
        </div>
      </PageWrapper>
    );
  }

  // ── LISTA PRINCIPALE ──────────────────────────────────────────────────────
  const renderGroupRow = (group) => (
    <div
      key={group.articolo_numero}
      onClick={() => setSelectedGroup(group)}
      style={{ ...S.cardClickable, display: 'flex', alignItems: 'center', gap: '12px' }}
      role="button"
      aria-label={`${group.label} - ${group.titolo || ''} - ${group.count} voci`}
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && setSelectedGroup(group)}
    >
      <div style={{ minWidth: '56px', height: '56px', borderRadius: '12px', backgroundColor: C.accentLight, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: '0.6rem', color: C.accent, fontWeight: '700', textTransform: 'uppercase' }}>Art.</span>
        <span style={{ fontSize: '1rem', color: C.accent, fontWeight: '800', lineHeight: 1 }}>{group.articolo_numero}</span>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <h3 style={{ fontSize: '0.95rem', color: C.text, lineHeight: 1.3, marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {group.titolo || `Articolo ${group.articolo_numero}`}
        </h3>
        <span style={{ fontSize: '0.8rem', color: C.textLight }}>{group.count} {group.count === 1 ? 'voce' : 'voci'}</span>
      </div>
      <span style={{ color: C.textLight }}>›</span>
    </div>
  );

  let content;
  if (loading) {
    content = <SkeletonList count={5} />;
  } else if (searchResults) {
    const { exactGroups, partial, text } = searchResults;
    const hasResults = exactGroups.length > 0 || partial.length > 0 || text.length > 0;
    if (!hasResults) {
      content = <EmptyState compact icon="clipboard-list" title="Nessun risultato" subtitle="Prova con un termine diverso o il numero dell'articolo." />;
    } else {
      content = (
        <div style={S.list}>
          {exactGroups.length > 0 && (
            <><SectionHeader label={`Articolo ${debouncedSearch.trim()} (corrispondenza esatta)`} />{exactGroups.map(renderGroupRow)}</>
          )}
          {partial.length > 0 && (
            <><SectionHeader label="Voci correlate" />{partial.map(item => <ProntuarioItem key={item.id} item={item} isFavorite={preferiti.includes(item.id)} onClick={() => handleSelectItem(item)} />)}</>
          )}
          {text.length > 0 && (
            <><SectionHeader label="Altri risultati" />{text.map(item => <ProntuarioItem key={item.id} item={item} isFavorite={preferiti.includes(item.id)} onClick={() => handleSelectItem(item)} />)}</>
          )}
        </div>
      );
    }
  } else {
    content = <div style={S.list}>{groups.map(renderGroupRow)}</div>;
  }

  return (
    <PageWrapper title="Prontuario" subtitle="Archivio operativo" onNavigate={onNavigate} onRefresh={refresh} enablePullToRefresh>
      <div style={{ marginBottom: '16px' }}>
        <SearchBar value={search} onChange={e => setSearch(e.target.value)} placeholder="Cerca articolo, titolo o codice..." />
      </div>
      {content}
    </PageWrapper>
  );
};
