import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../config/supabase';

const DEMO_USER = {
  id: 'admin-1',
  email: 'admin@polisroad.it',
  nome: 'Admin',
  cognome: 'Demo',
  grado: 'Ispettore',
  forza: 'Polizia di Stato',
  telefono: '3331234567',
  ruolo: 'admin'
};

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [userCount, setUserCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      const localSession = localStorage.getItem('polisroad_demo_session');
      if (localSession) {
        setSession({ user: DEMO_USER });
        setProfile(DEMO_USER);
      }
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
      else {
        setProfile(null);
        setLoading(false);
      }
    });

    fetchUserCount();

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserCount = async () => {
    if (!isSupabaseConfigured || !supabase) {
      setUserCount(124);
      return;
    }
    try {
      const { count, error } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      if (!error) setUserCount(count);
    } catch (err) {
      console.warn("User count fetch failed:", err);
    }
  };

  const fetchProfile = async (userId) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email, password) => {
    if (!isSupabaseConfigured || !supabase) {
      if (email === 'admin@polisroad.it' && password === 'admin123') {
        localStorage.setItem('polisroad_demo_session', 'true');
        setSession({ user: DEMO_USER });
        setProfile(DEMO_USER);
        return { error: null };
      }
      return { error: { message: 'Credenziali errate. Usa admin@polisroad.it / admin123' } };
    }
    try {
      return await supabase.auth.signInWithPassword({ email, password });
    } catch (error) {
      return { error: { message: "Errore di connessione al server." } };
    }
  };

  const signUp = async (email, password, userData) => {
    if (!isSupabaseConfigured || !supabase) return { error: { message: 'Registrazione disabilitata in demo mode' } };
    
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return { error };

    if (data?.user) {
      const { error: profileError } = await supabase.from('profiles').upsert([
        { id: data.user.id, email, ...userData, ruolo: 'operatore' }
      ]);
      if (profileError) return { error: profileError };
    }
    return { data, error: null };
  };

  const signOut = async () => {
    if (!isSupabaseConfigured || !supabase) {
      localStorage.removeItem('polisroad_demo_session');
      setSession(null);
      setProfile(null);
      return { error: null };
    }
    try {
      return await supabase.auth.signOut();
    } catch (error) {
      return { error };
    }
  };

  const updateProfile = async (updates) => {
    if (!isSupabaseConfigured || !supabase) {
      setProfile({ ...profile, ...updates });
      return { error: null };
    }
    
    const currentId = profile?.id || session?.user?.id;
    if (!currentId) return { error: { message: 'Utente non loggato' } };

    const { error } = await supabase.from('profiles').upsert({ id: currentId, ...updates });
    if (!error) setProfile({ ...profile, ...updates, id: currentId });
    return { error };
  };

  return (
    <AuthContext.Provider value={{ session, profile, userCount, loading, signIn, signUp, signOut, updateProfile, refreshUserCount: fetchUserCount }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
