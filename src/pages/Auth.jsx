import React, { useState } from 'react';
import { PageWrapper } from '../components/layout/PageWrapper';
import { TextInput } from '../components/ui/TextInput';
import { Toast } from '../components/ui/Toast';
import { C } from '../styles/theme';
import { S } from '../styles/styles';
import { useAuth } from '../hooks/useAuth';
import { loginRateLimiter } from '../utils/rateLimiter';
import { sanitizers, validators } from '../utils/validation';

const authPageStyle = {
  justifyContent: 'center',
  backgroundColor: C.primary,
  color: '#fff',
};

const authHeaderStyle = {
  textAlign: 'center',
  marginBottom: '32px',
};

const authTitleStyle = {
  fontSize: '2.5rem',
  marginBottom: '8px',
};

const authSubtitleStyle = {
  color: C.accentLight,
};

const authCardStyle = {
  backgroundColor: '#fff',
  padding: '24px',
  borderRadius: '16px',
  color: C.text,
};

const authCardTitleStyle = {
  marginBottom: '20px',
  textAlign: 'center',
};

const authSwitchStyle = {
  textAlign: 'center',
  marginTop: '16px',
};

const authSwitchBtnStyle = {
  color: C.accent,
  textDecoration: 'underline',
  fontSize: '0.9rem',
};

export const Auth = ({ passwordUpdateMode = false }) => {
  const { signIn, signUp, resetPassword, updatePassword, clearPasswordRecovery } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nome, setNome] = useState('');
  const [cognome, setCognome] = useState('');
  const [grado, setGrado] = useState('');
  const [forza, setForza] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState('');
  const [toastType, setToastType] = useState('error');

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    const emailError = validators.email(normalizedEmail);
    if (emailError) {
      setToastType('error');
      setToast(emailError);
      return;
    }
    if (!password) {
      setToastType('error');
      setToast('Password obbligatoria');
      return;
    }

    const attempt = loginRateLimiter.canAttempt(normalizedEmail);
    if (isLogin && !attempt.allowed) {
      setToastType('error');
      setToast(attempt.reason);
      return;
    }

    setLoading(true);
    setToast('');
    if (isLogin) {
      const { error } = await signIn(normalizedEmail, password);
      loginRateLimiter.recordAttempt(normalizedEmail, !error);
      if (error) {
        setToastType('error');
        setToast(error.message);
      }
    } else {
      const passwordError = validators.password(password);
      const requiredError =
        validators.required(nome, 'Nome') ||
        validators.required(cognome, 'Cognome') ||
        validators.required(grado, 'Grado') ||
        validators.required(forza, 'Forza di Polizia') ||
        passwordError;

      if (requiredError) {
        setToastType('error');
        setToast(requiredError);
        setLoading(false);
        return;
      }

      const { error } = await signUp(normalizedEmail, password, {
        nome: sanitizers.text(nome),
        cognome: sanitizers.text(cognome),
        grado: sanitizers.text(grado),
        forza: sanitizers.text(forza)
      });
      if (error) {
        setToastType('error');
        setToast(error.message);
      }
      else { setToastType('success'); setToast('Registrazione completata!'); setIsLogin(true); }
    }
    setLoading(false);
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    const emailError = validators.email(normalizedEmail);
    if (emailError) {
      setToastType('error');
      setToast(emailError);
      return;
    }

    setLoading(true);
    setToast('');
    const { error } = await resetPassword(normalizedEmail);
    setLoading(false);
    setToastType(error ? 'error' : 'success');
    setToast(error ? error.message : 'Controlla la tua email per completare il recupero password.');
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    const passwordError = validators.password(password);
    if (passwordError) {
      setToastType('error');
      setToast(passwordError);
      return;
    }
    if (password !== confirmPassword) {
      setToastType('error');
      setToast('Le password non coincidono');
      return;
    }

    setLoading(true);
    setToast('');
    const { error } = await updatePassword(password);
    setLoading(false);
    if (error) {
      setToastType('error');
      setToast(error.message);
    }
    else {
      setPassword('');
      setConfirmPassword('');
      setToastType('success');
      setToast('Password aggiornata correttamente.');
    }
  };

  return (
    <PageWrapper style={authPageStyle}>
      <div className="auth-viewport-wrapper">
        <div style={authHeaderStyle}>
          <h1 style={authTitleStyle}>PolisRoad</h1>
          <p style={authSubtitleStyle}>Il Codice della Strada, sempre con te</p>
        </div>

        <div style={authCardStyle}>
          <h2 style={authCardTitleStyle}>
            {passwordUpdateMode ? 'Nuova password' : isResettingPassword ? 'Recupera password' : isLogin ? 'Accedi' : 'Registrati'}
          </h2>

          {passwordUpdateMode ? (
            <form onSubmit={handlePasswordUpdate} style={{ display: 'flex', flexDirection: 'column' }}>
              <TextInput label="Nuova password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
              <TextInput label="Conferma password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
              <button
                type="submit"
                disabled={loading}
                style={{ ...S.btnPrimary, marginTop: '8px', opacity: loading ? 0.7 : 1 }}
              >
                {loading ? 'Attendi...' : 'Aggiorna password'}
              </button>
              <div style={authSwitchStyle}>
                <button type="button" onClick={clearPasswordRecovery} style={authSwitchBtnStyle}>
                  Torna all'app
                </button>
              </div>
            </form>
          ) : isResettingPassword ? (
            <form onSubmit={handlePasswordReset} style={{ display: 'flex', flexDirection: 'column' }}>
              <TextInput label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              <button
                type="submit"
                disabled={loading}
                style={{ ...S.btnPrimary, marginTop: '8px', opacity: loading ? 0.7 : 1 }}
              >
                {loading ? 'Invio...' : 'Invia email di recupero'}
              </button>
              <div style={authSwitchStyle}>
                <button type="button" onClick={() => setIsResettingPassword(false)} style={authSwitchBtnStyle}>
                  Torna al login
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
              {!isLogin && (
                <>
                  <TextInput label="Nome" value={nome} onChange={(e) => setNome(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') handleSubmit(e); }} />
                  <TextInput label="Cognome" value={cognome} onChange={(e) => setCognome(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') handleSubmit(e); }} />
                  <TextInput label="Grado" value={grado} onChange={(e) => setGrado(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') handleSubmit(e); }} />
                  <TextInput label="Forza di Polizia" value={forza} onChange={(e) => setForza(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') handleSubmit(e); }} />
                </>
              )}

              <TextInput label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') handleSubmit(e); }} />
              <TextInput label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') handleSubmit(e); }} />

              <button
                type="submit"
                disabled={loading}
                style={{ ...S.btnPrimary, marginTop: '8px', opacity: loading ? 0.7 : 1 }}
              >
                {loading ? 'Attendi...' : (isLogin ? 'Accedi' : 'Registrati')}
              </button>
            </form>
          )}

          {!passwordUpdateMode && !isResettingPassword && (
            <div style={authSwitchStyle}>
              <button type="button" onClick={() => setIsLogin(!isLogin)} style={authSwitchBtnStyle}>
                {isLogin ? 'Non hai un account? Registrati' : 'Hai gia un account? Accedi'}
              </button>
              {isLogin && (
                <button type="button" onClick={() => setIsResettingPassword(true)} style={{ ...authSwitchBtnStyle, display: 'block', margin: '10px auto 0' }}>
                  Password dimenticata?
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {toast && <Toast message={toast} type={toastType} onClose={() => setToast('')} />}
    </PageWrapper>
  );
};
