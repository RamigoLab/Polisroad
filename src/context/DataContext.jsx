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

    try {
      // Eseguiamo le fetch in parallelo per velocità
      const [prontuarioRes, normativaRes, newsRes] = await Promise.all([
        supabase.from('prontuario').select('*').order('rif_normativo').limit(5000),
        supabase.from('codice_strada').select('*').order('ordine').limit(5000),
        supabase.from('news').select('*').order('created_at', { ascending: false })
      ]);

      if (prontuarioRes.error) {
        console.error('Prontuario Error:', prontuarioRes.error);
        setError(`Errore nel prontuario: ${prontuarioRes.error.message}`);
      }
      if (normativaRes.error) {
        console.error('Normativa Error:', normativaRes.error);
        setError(`Errore nella normativa: ${normativaRes.error.message}`);
      }
      if (newsRes.error) {
        console.error('News Error:', newsRes.error);
        setError(`Errore nelle news: ${newsRes.error.message}`);
      }

      setProntuario(prontuarioRes.data || mockProntuario);
      setNormativa(normativaRes.data || mockNormativa);
      setNews(newsRes.data || mockNews);

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
