import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import { USE_SUPABASE } from '../config/constants';

const DEMO_USER = {
  id: 'admin-1',
  email: 'admin@cds.it',
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!USE_SUPABASE) {
      const localSession = localStorage.getItem('cds_demo_session');
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

    return () => subscription.unsubscribe();
  }, []);

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
    if (!USE_SUPABASE) {
      if (email === 'admin@cds.it' && password === 'admin123') {
        localStorage.setItem('cds_demo_session', 'true');
        setSession({ user: DEMO_USER });
        setProfile(DEMO_USER);
        return { error: null };
      }
      return { error: { message: 'Credenziali errate. Usa admin@cds.it / admin123' } };
    }
    return await supabase.auth.signInWithPassword({ email, password });
  };

  const signUp = async (email, password, userData) => {
    if (!USE_SUPABASE) return { error: { message: 'Registrazione disabilitata in demo mode' } };
    
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
    if (!USE_SUPABASE) {
      localStorage.removeItem('cds_demo_session');
      setSession(null);
      setProfile(null);
      return { error: null };
    }
    return await supabase.auth.signOut();
  };

  const updateProfile = async (updates) => {
    if (!USE_SUPABASE) {
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
    <AuthContext.Provider value={{ session, profile, loading, signIn, signUp, signOut, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
