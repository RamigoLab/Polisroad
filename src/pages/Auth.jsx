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

export const Auth = () => {
  const { signIn, signUp } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nome, setNome] = useState('');
  const [cognome, setCognome] = useState('');
  const [grado, setGrado] = useState('');
  const [forza, setForza] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState('');

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    const emailError = validators.email(normalizedEmail);
    if (emailError) {
      setToast(emailError);
      return;
    }
    if (!password) {
      setToast('Password obbligatoria');
      return;
    }

    const attempt = loginRateLimiter.canAttempt(normalizedEmail);
    if (isLogin && !attempt.allowed) {
      setToast(attempt.reason);
      return;
    }

    setLoading(true);
    setToast('');
    if (isLogin) {
      const { error } = await signIn(normalizedEmail, password);
      loginRateLimiter.recordAttempt(normalizedEmail, !error);
      if (error) setToast(error.message);
    } else {
      const passwordError = validators.password(password);
      const requiredError =
        validators.required(nome, 'Nome') ||
        validators.required(cognome, 'Cognome') ||
        validators.required(grado, 'Grado') ||
        validators.required(forza, 'Forza di Polizia') ||
        passwordError;

      if (requiredError) {
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
      if (error) setToast(error.message);
      else { setToast('Registrazione completata!'); setIsLogin(true); }
    }
    setLoading(false);
  };

  return (
    <PageWrapper style={authPageStyle}>
      <div className="auth-viewport-wrapper">
        <div style={authHeaderStyle}>
          <h1 style={authTitleStyle}>PolisRoad</h1>
          <p style={authSubtitleStyle}>Il Codice della Strada, sempre con te</p>
        </div>

        <div style={authCardStyle}>
          <h2 style={authCardTitleStyle}>{isLogin ? 'Accedi' : 'Registrati'}</h2>

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

          <div style={authSwitchStyle}>
            <button type="button" onClick={() => setIsLogin(!isLogin)} style={authSwitchBtnStyle}>
              {isLogin ? 'Non hai un account? Registrati' : 'Hai già un account? Accedi'}
            </button>
          </div>
        </div>
      </div>

      {toast && <Toast message={toast} type="error" onClose={() => setToast('')} />}
    </PageWrapper>
  );
};
