/**
 * DataContext.jsx
 * Fornisce solo configurazione/stato globale dell'app.
 * I fetch dei dati (prontuario, normativa, news) sono delegati
 * ai rispettivi hook via React Query.
 */
import React, { createContext, useContext } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { isSupabaseConfigured } from '../config/supabase';
import { getProntuario } from '../services/prontuarioService';
import { getNormativa } from '../services/normativaService';
import { getNews } from '../services/newsService';
import { getSearchSynonyms } from '../services/synonymsService';
import { logger } from '../utils/logger';

const DataContext = createContext();

// Chiavi di cache centralizzate — importabili dagli hook per invalidare la cache
export const QUERY_KEYS = {
  prontuario: ['prontuario'],
  normativa: ['normativa'],
  news: ['news'],
  searchSynonyms: ['searchSynonyms'],
};

export const DataProvider = ({ children }) => {
  const queryClient = useQueryClient();

  // ─── PRONTUARIO ──────────────────────────────────────────────────────────
  const {
    data: prontuario = [],
    isLoading: prontuarioLoading,
    error: prontuarioError,
  } = useQuery({
    queryKey: QUERY_KEYS.prontuario,
    queryFn: getProntuario,
    staleTime: 1000 * 60 * 30,   // 30 min: dati stabili
    gcTime: 1000 * 60 * 60 * 24, // 24 ore in cache
    retry: 2,
  });

  // ─── NORMATIVA ───────────────────────────────────────────────────────────
  const {
    data: normativa = [],
    isLoading: normativaLoading,
    error: normativaError,
  } = useQuery({
    queryKey: QUERY_KEYS.normativa,
    queryFn: getNormativa,
    staleTime: 1000 * 60 * 30,
    gcTime: 1000 * 60 * 60 * 24,
    retry: 2,
  });

  // ─── NEWS ─────────────────────────────────────────────────────────────────
  const {
    data: news = [],
    isLoading: newsLoading,
    error: newsError,
  } = useQuery({
    queryKey: QUERY_KEYS.news,
    queryFn: getNews,
    staleTime: 1000 * 60 * 5,    // 5 min: news più dinamiche
    gcTime: 1000 * 60 * 60 * 12,
    retry: 2,
  });

  // ─── SINONIMI DI RICERCA ─────────────────────────────────────────────────
  const {
    data: searchSynonyms = [],
    isLoading: synonymsLoading,
  } = useQuery({
    queryKey: QUERY_KEYS.searchSynonyms,
    queryFn: getSearchSynonyms,
    staleTime: 1000 * 60 * 30,   // 30 min: cambiano raramente
    gcTime: 1000 * 60 * 60 * 24, // 24 ore in cache, disponibili offline
    retry: 2,
  });

  const loading = prontuarioLoading || normativaLoading || newsLoading;

  // Genera un messaggio di errore user-friendly dal primo errore disponibile
  const rawError = prontuarioError || normativaError || newsError;
  let error = null;
  if (rawError) {
    const msg = rawError.message || '';
    if (msg.includes('fetch') || msg.includes('Network')) {
      error = 'Errore di rete: controlla la tua connessione internet o la VPN.';
    } else if (rawError.code === '42P01') {
      error = 'Database non pronto: manca una tabella in Supabase.';
    } else if (rawError.code === '42501' || msg.includes('policy') || msg.includes('Row Level Security')) {
      error = 'Accesso negato: Le Policies RLS su Supabase stanno bloccando la lettura.';
    } else {
      error = 'Impossibile caricare i dati aggiornati. Riprova più tardi.';
    }
  }

  // Refresh globale: invalida tutte le cache e ricarica
  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.prontuario });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.normativa });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.news });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.searchSynonyms });
  };

  const value = {
    prontuario,
    normativa,
    news,
    searchSynonyms,
    synonymsLoading,
    loading,
    error,
    refresh,
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within a DataProvider');
  return context;
};
