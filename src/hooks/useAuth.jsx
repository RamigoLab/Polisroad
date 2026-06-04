import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../config/supabase';

const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true' && !import.meta.env.PROD;

const DEMO_USER = {
  id: import.meta.env.VITE_DEMO_USER_ID || 'demo-1',
  email: import.meta.env.VITE_DEMO_USER_EMAIL || 'admin@polisroad.it',
  nome: 'Demo',
  cognome: 'User',
  grado: 'Operatore',
  forza: 'Test',
  telefono: '',
  ruolo: import.meta.env.VITE_DEMO_USER_ROLE || 'operatore'
};

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [userCount, setUserCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [passwordRecovery, setPasswordRecovery] = useState(false);

  const fetchUserCount = async () => {
    if (!isSupabaseConfigured || !supabase) {
      setUserCount(isDemoMode ? 1 : 0);
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

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      if (!isDemoMode) {
        setLoading(false);
        return;
      }
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

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setPasswordRecovery(event === 'PASSWORD_RECOVERY');
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

  const signIn = async (email, password) => {
    if (!isSupabaseConfigured || !supabase) {
        if (isDemoMode &&
            email === import.meta.env.VITE_DEMO_USER_EMAIL &&
            password === import.meta.env.VITE_DEMO_USER_PASSWORD) {
          localStorage.setItem('polisroad_demo_session', 'true');
          setSession({ user: DEMO_USER });
          setProfile(DEMO_USER);
          return { error: null };
        }
        return { error: { message: 'Supabase non configurato. Controlla le variabili VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.' } };
    }
    try {
      return await supabase.auth.signInWithPassword({ email, password });
    } catch {
      return { error: { message: "Errore di connessione al server." } };
    }
  };


  const signUp = async (email, password, userData) => {
    if (!isSupabaseConfigured || !supabase) return { error: { message: 'Registrazione non disponibile: Supabase non configurato.' } };
    
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

  const resetPassword = async (email) => {
    if (!isSupabaseConfigured || !supabase) {
      return { error: { message: 'Recupero password non disponibile: Supabase non configurato.' } };
    }

    try {
      return await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin,
      });
    } catch {
      return { error: { message: 'Errore durante la richiesta di recupero password.' } };
    }
  };

  const updatePassword = async (password) => {
    if (!isSupabaseConfigured || !supabase) {
      return { error: { message: 'Aggiornamento password non disponibile: Supabase non configurato.' } };
    }

    try {
      const result = await supabase.auth.updateUser({ password });
      if (!result.error) setPasswordRecovery(false);
      return result;
    } catch {
      return { error: { message: 'Errore durante l\'aggiornamento della password.' } };
    }
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
    <AuthContext.Provider value={{
      session,
      profile,
      userCount,
      loading,
      passwordRecovery,
      signIn,
      signUp,
      signOut,
      resetPassword,
      updatePassword,
      updateProfile,
      clearPasswordRecovery: () => setPasswordRecovery(false),
      refreshUserCount: fetchUserCount
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
