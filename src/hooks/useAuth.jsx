import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../config/supabase';
import {
  fetchProfile,
  upsertProfile,
  fetchUserCount as fetchUserCountService,
  signIn as signInService,
  signUp as signUpService,
  resetPassword as resetPasswordService,
  updatePassword as updatePasswordService,
  signOut as signOutService,
} from '../services/authService';
import { logger } from '../utils/logger';

const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true' && !import.meta.env.PROD;

const DEMO_USER = {
  id: import.meta.env.VITE_DEMO_USER_ID || 'demo-1',
  email: import.meta.env.VITE_DEMO_USER_EMAIL || 'admin@polisroad.it',
  nome: 'Demo',
  cognome: 'User',
  grado: 'Operatore',
  forza: 'Test',
  telefono: '',
  ruolo: import.meta.env.VITE_DEMO_USER_ROLE || 'operatore',
};

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [userCount, setUserCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState(false);
  const [passwordRecovery, setPasswordRecovery] = useState(false);

  // 👉 FIX: approvazione derivata correttamente
  // - gli admin sono sempre approvati (ruolo === 'admin')
  // - altrimenti si legge il campo approvato dal profilo DB
  const isAdmin = profile?.ruolo === 'admin';
  const isApproved = isAdmin || !!profile?.approvato;

  const loadUserCount = async () => {
    if (!isSupabaseConfigured || !supabase) {
      setUserCount(isDemoMode ? 1 : 0);
      return;
    }
    try {
      const count = await fetchUserCountService();
      setUserCount(count);
    } catch (err) {
      logger.warn('User count fetch failed:', err);
    }
  };

  const loadProfile = async (userId) => {
    try {
      setProfileLoading(true);
      setProfileError(false);
      const data = await fetchProfile(userId);
      setProfile(data || null);
    } catch (err) {
      logger.error('Error fetching profile:', err.message);
      setProfile(null);
      setProfileError(true);
    } finally {
      setProfileLoading(false);
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

    supabase.auth.getSession()
      .then(({ data: { session }, error }) => {
        if (error) {
          logger.error('getSession error:', error.message);
          setLoading(false);
          return;
        }
        setSession(session);
        if (session?.user?.id) {
          // Segnala subito che il profilo è in caricamento così App.jsx
          // non mostra la pending screen per un frame con profileLoading=false
          setProfileLoading(true);
          loadProfile(session.user.id);
        } else {
          setLoading(false);
        }
      })
      .catch((err) => {
        // Supabase irraggiungibile: sblocca comunque il gate di caricamento
        logger.error('getSession unexpected error:', err);
        setLoading(false);
      });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setPasswordRecovery(event === 'PASSWORD_RECOVERY');
        setSession(session);

        if (session?.user?.id) {
          // TOKEN_REFRESHED è un aggiornamento silenzioso del JWT: non serve
          // ricaricare il profilo perché i dati utente non sono cambiati.
          // Ricaricare qui causava race condition e ricaricamenti continui.
          // SIGNED_OUT / USER_DELETED: profilo già azzerato sotto
          if (event === 'TOKEN_REFRESHED') return;
          loadProfile(session.user.id);
        } else {
          setProfile(null);
          setLoading(false);
        }
      }
    );

    loadUserCount();
    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email, password) => {
    if (!isSupabaseConfigured || !supabase) {
      if (
        isDemoMode &&
        email === import.meta.env.VITE_DEMO_USER_EMAIL &&
        password === import.meta.env.VITE_DEMO_USER_PASSWORD
      ) {
        localStorage.setItem('polisroad_demo_session', 'true');
        setSession({ user: DEMO_USER });
        setProfile(DEMO_USER);
        return { error: null };
      }
      return { error: { message: 'Supabase non configurato.' } };
    }

    try {
      await signInService(email, password);
      return { error: null };
    } catch (err) {
      return { error: { message: err.message || 'Errore di connessione.' } };
    }
  };

  const signUp = async (email, password, userData) => {
    if (!isSupabaseConfigured || !supabase) {
      return { error: { message: 'Registrazione non disponibile.' } };
    }

    try {
      const data = await signUpService(email, password, userData);
      return { data, error: null };
    } catch (err) {
      return { error: { message: err.message } };
    }
  };

  const resetPassword = async (email) => {
    if (!isSupabaseConfigured || !supabase) {
      return { error: { message: 'Recupero password non disponibile.' } };
    }

    try {
      await resetPasswordService(email, window.location.origin);
      return { error: null };
    } catch (err) {
      return { error: { message: err.message } };
    }
  };

  const updatePassword = async (password) => {
    if (!isSupabaseConfigured || !supabase) {
      return { error: { message: 'Aggiornamento password non disponibile.' } };
    }

    try {
      await updatePasswordService(password);
      setPasswordRecovery(false);
      return { error: null };
    } catch (err) {
      return { error: { message: err.message } };
    }
  };

  const signOut = async () => {
    // Resetta sempre lo stato locale indipendentemente dall'esito della chiamata
    setProfile(null);
    setProfileError(false);
    setPasswordRecovery(false);

    if (!isSupabaseConfigured || !supabase) {
      localStorage.removeItem('polisroad_demo_session');
      setSession(null);
      return { error: null };
    }

    try {
      await signOutService();
      return { error: null };
    } catch (err) {
      // Anche se signOut fallisce, lo stato locale è già pulito
      logger.warn('signOut API error (stato locale già resettato):', err);
      setSession(null);
      return { error: err };
    }
  };

  const updateProfile = async (updates) => {
    const currentId = profile?.id || session?.user?.id;

    if (!currentId) {
      return { error: { message: 'Utente non loggato' } };
    }

    try {
      await upsertProfile(currentId, updates);
      setProfile(prev => ({ ...prev, ...updates, id: currentId }));
      return { error: null };
    } catch (err) {
      return { error: err };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        profile,
        userCount,
        loading,
        profileLoading,
        passwordRecovery,

        // 🔥 FIX IMPORTANTE
        isApproved,
        isAdmin,
        profileError,

        signIn,
        signUp,
        signOut,
        resetPassword,
        updatePassword,
        updateProfile,
        clearPasswordRecovery: () => setPasswordRecovery(false),
        refreshUserCount: loadUserCount,
        // Usato dalla schermata "in attesa di approvazione" per rilevare
        // quando l'admin approva l'account senza che l'utente ricarichi.
        refreshProfile: () => session?.user?.id ? loadProfile(session.user.id) : Promise.resolve(),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
