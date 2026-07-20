import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { supabase, isSupabaseConfigured } from '../config/supabase';
import {
  fetchProfile,
  upsertProfile,
  fetchUserCount as fetchUserCountService,
  signIn as signInService,
  signInWithPasskey as signInWithPasskeyService,
  registerPasskey as registerPasskeyService,
  listPasskeys as listPasskeysService,
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
  const [hasRegisteredPasskey, setHasRegisteredPasskey] = useState(false);

  // FIX BUG-01/04: ref per tracciare se getSession() ha già avviato un loadProfile,
  // evitando che INITIAL_SESSION lo lanci di nuovo in parallelo.
  const profileLoadInitiated = useRef(false);

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

  // FIX BUG-11: loadProfile con timeout 8s e FIX BUG-01: retry per race condition signUp
  const loadProfile = async (userId, { retries = 0, silent = false } = {}) => {
    try {
      if (!silent) {
        setProfileLoading(true);
        setProfileError(false);
      }

      // Timeout 8s per evitare blocchi indefiniti su rete irraggiungibile
      const data = await Promise.race([
        fetchProfile(userId),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('profile_timeout')), 8000)
        ),
      ]);

      if (!data && retries < 3) {
        // FIX BUG-01: race condition signUp → profile insert non ancora completato.
        // Riprova con backoff (600ms × tentativo) prima di dichiarare errore.
        logger.warn(`loadProfile: profilo non trovato, retry ${retries + 1}/3`);
        await new Promise(r => setTimeout(r, 600 * (retries + 1)));
        return loadProfile(userId, { retries: retries + 1, silent });
      }

      setProfile(data || null);
      if (!data) setProfileError(true);
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

    // FIX BUG-02: su iOS PWA, la sessione può richiedere un momento per essere
    // ripristinata dal browser dopo un resume dal background. getSession() può
    // tornare null prima che INITIAL_SESSION arrivi con la sessione reale.
    // Usiamo un timeout di 350ms: se getSession() ritorna null, aspettiamo
    // prima di concludere che l'utente non è autenticato.
    let noSessionTimer = null;

    supabase.auth.getSession()
      .then(({ data: { session }, error }) => {
        if (error) {
          logger.error('getSession error:', error.message);
          setLoading(false);
          return;
        }

        if (session?.user?.id) {
          profileLoadInitiated.current = true;
          setSession(session);
          setProfileLoading(true);
          loadProfile(session.user.id);
        } else {
          // FIX BUG-02: non dichiarare subito "nessuna sessione" — su iOS PWA
          // INITIAL_SESSION può arrivare poco dopo con la sessione reale.
          noSessionTimer = setTimeout(() => {
            setLoading(false);
          }, 350);
        }
      })
      .catch((err) => {
        logger.error('getSession unexpected error:', err);
        setLoading(false);
      });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        // PASSWORD_RECOVERY: setta il flag e NON procedere con il login normale.
        // Il flag viene resettato solo dopo updatePassword o clearPasswordRecovery.
        if (event === 'PASSWORD_RECOVERY') {
          setPasswordRecovery(true);
          setSession(session);
          return;
        }

        setSession(session);

        if (session?.user?.id) {
          // FIX BUG-04: INITIAL_SESSION è già gestito da getSession() sopra.
          // Evitare un secondo loadProfile parallelo che causa doppie query su Supabase.
          if (event === 'INITIAL_SESSION') {
            if (!profileLoadInitiated.current) {
              // getSession() aveva restituito null (es. iOS race), ora arriva la sessione
              clearTimeout(noSessionTimer);
              profileLoadInitiated.current = true;
              setProfileLoading(true);
              loadProfile(session.user.id);
            }
            return;
          }

          // TOKEN_REFRESHED: aggiornamento silenzioso del JWT, profilo invariato
          if (event === 'TOKEN_REFRESHED') return;

          // Per tutti gli altri eventi (SIGNED_IN, USER_UPDATED, ecc.)
          loadProfile(session.user.id);
        } else {
          clearTimeout(noSessionTimer);
          profileLoadInitiated.current = false;
          setProfile(null);
          setLoading(false);
        }
      }
    );

    loadUserCount();
    return () => {
      clearTimeout(noSessionTimer);
      subscription.unsubscribe();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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

  // Login vero senza password — richiede un passkey già registrato su questo
  // account. Beta lato Supabase: resta sempre un'opzione in più, mai l'unica.
  const signInWithPasskey = async () => {
    if (!isSupabaseConfigured || !supabase) {
      return { error: { message: 'Passkey non disponibile in modalità demo.' } };
    }
    try {
      await signInWithPasskeyService();
      return { error: null };
    } catch (err) {
      return { error: { message: err.message || 'Accesso con passkey non riuscito.' } };
    }
  };

  // Rilegge da Supabase se l'utente ha almeno un passkey registrato — fonte
  // di verità reale, non un flag locale che potrebbe disallinearsi.
  const refreshPasskeyStatus = async () => {
    if (!isSupabaseConfigured || !supabase) return;
    try {
      const list = await listPasskeysService();
      setHasRegisteredPasskey(list.length > 0);
    } catch {
      // API sperimentale: se la lista fallisce (es. non ancora abilitata
      // lato progetto Supabase) non blocchiamo la UI, resta 'non registrato'.
    }
  };

  // Ogni volta che cambia la sessione (login/logout/cambio utente), riallinea
  // lo stato "passkey registrato" leggendolo da Supabase invece di tenerlo
  // in un flag locale che può disallinearsi dalla realtà del server.
  useEffect(() => {
    if (session?.user?.id && isSupabaseConfigured && supabase) {
      refreshPasskeyStatus();
    } else {
      setHasRegisteredPasskey(false);
    }
  }, [session?.user?.id]);

  // Registra un passkey per l'utente già loggato (da Profilo).
  const registerPasskeyForAccount = async () => {
    if (!isSupabaseConfigured || !supabase) {
      return { error: { message: 'Passkey non disponibile in modalità demo.' } };
    }
    try {
      await registerPasskeyService();
      await refreshPasskeyStatus();
      return { error: null };
    } catch (err) {
      return { error: { message: err.message || 'Registrazione passkey non riuscita.' } };
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
    profileLoadInitiated.current = false;
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
        isApproved,
        isAdmin,
        profileError,
        signIn,
        signInWithPasskey,
        registerPasskeyForAccount,
        hasRegisteredPasskey,
        signUp,
        signOut,
        resetPassword,
        updatePassword,
        updateProfile,
        clearPasswordRecovery: () => setPasswordRecovery(false),
        refreshUserCount: loadUserCount,
        refreshProfile: () => session?.user?.id ? loadProfile(session.user.id) : Promise.resolve(),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
