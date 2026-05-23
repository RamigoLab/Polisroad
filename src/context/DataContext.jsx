import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../config/supabase';
import { mockProntuario } from '../data/prontuario';
import { mockNormativa } from '../data/normativa';
import { mockNews } from '../data/news';

const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const [prontuario, setProntuario] = useState([]);
  const [normativa, setNormativa] = useState([]);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAllData = async () => {
    setLoading(true);
    setError(null);

    if (!isSupabaseConfigured || !supabase) {
      setProntuario(mockProntuario);
      setNormativa(mockNormativa);
      setNews(mockNews);
      setLoading(false);
      return;
    }

    // Helper per aggirare il limite dei 1000 risultati di Supabase
    const fetchAllRows = async (table, orderCol) => {
      let allData = [];
      let from = 0;
      const step = 1000;
      while (true) {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .order(orderCol)
          .range(from, from + step - 1);
        
        if (error) return { data: null, error };
        if (!data || data.length === 0) break;
        
        allData = [...allData, ...data];
        if (data.length < step) break; // Fine dei risultati
        
        from += step;
      }
      return { data: allData, error: null };
    };

    try {
      // Fetch impaginate automatiche per bypassare i blocchi del server
      const [prontuarioRes, normativaRes, newsRes] = await Promise.all([
        fetchAllRows('prontuario', 'rif_normativo'),
        fetchAllRows('codice_strada', 'ordine'),
        supabase.from('news').select('*').order('created_at', { ascending: false }).limit(100)
      ]);

      if (prontuarioRes.error || normativaRes.error || newsRes.error) {
        console.error('Data Fetch Errors:', {
          prontuario: prontuarioRes.error,
          normativa: normativaRes.error,
          news: newsRes.error
        });
        
        const anyError = prontuarioRes.error || normativaRes.error || newsRes.error;
        let userMsg = "Si è verificato un errore durante il caricamento dei dati.";
        
        if (anyError.message?.includes('fetch') || anyError.message?.includes('Network')) {
          userMsg = "Errore di rete: controlla la tua connessione internet o la VPN.";
        } else if (anyError.code === '42P01') {
          userMsg = "Database non pronto: manca una tabella in Supabase.";
        } else if (anyError.code === '42501' || anyError.message?.includes('policy') || anyError.message?.includes('Row Level Security')) {
          userMsg = "Accesso negato: Le Policies RLS su Supabase stanno bloccando la lettura (0 risultati).";
        } else {
          userMsg = "Impossibile caricare i dati aggiornati. Riprova più tardi.";
        }
        
        setError(userMsg);
      }

      setProntuario(prontuarioRes.data || mockProntuario);
      setNormativa(normativaRes.data || mockNormativa);
      
      // Auto-delete published news older than 30 days
      const fetchedNews = newsRes.data || mockNews;
      const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
      const now = Date.now();
      
      const validNews = [];
      const idsToDelete = [];
      
      fetchedNews.forEach(item => {
        if (item.pubblicato) {
          const createdAt = new Date(item.data_creazione || item.created_at).getTime();
          if ((now - createdAt) > THIRTY_DAYS_MS) {
            idsToDelete.push(item.id);
            return; // Skip adding to validNews
          }
        }
        validNews.push(item);
      });

      // Background deletion from database if configured
      if (isSupabaseConfigured && supabase && idsToDelete.length > 0) {
        supabase.from('news').delete().in('id', idsToDelete).then(({ error }) => {
          if (error) console.error("Error auto-deleting old news:", error);
        });
      }

      setNews(validNews);

    } catch (err) {
      console.error('General Data Fetch Error:', err);
      setError(`Errore generale di connessione: ${err.message || 'Verifica la connessione a Supabase'}`);
      // Fallback
      setProntuario(mockProntuario);
      setNormativa(mockNormativa);
      setNews(mockNews);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const value = {
    prontuario,
    normativa,
    news,
    loading,
    error,
    refresh: fetchAllData,
    // Helper per aggiornamenti locali (ottimistici) dopo mutazioni
    setProntuario,
    setNormativa,
    setNews
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
