import React, { useState } from 'react';
import { PageWrapper } from '../components/layout/PageWrapper';
import { TextInput } from '../components/ui/TextInput';
import { PasswordInput, isPasswordValid } from '../components/ui/PasswordInput';
import { useToast } from '../components/ui/ToastManager';
import { C } from '../styles/theme';
import { S } from '../styles/styles';
import { useAuth } from '../hooks/useAuth';
import { loginRateLimiter } from '../utils/rateLimiter';
import { mapAuthError } from '../utils/authErrorMapper';
import { sanitizers, validators } from '../utils/validation';
import { PrivacyContent } from './Privacy';
import { TerminiContent } from './TerminiServizio';

// ─── Modal per Privacy / Termini visibile anche senza sessione ───────────────
const DocModal = ({ title, children, onClose }) => (
  <div
    onClick={onClose}
    style={{
      position: 'fixed', inset: 0, zIndex: 9000,
      backgroundColor: 'rgba(0,0,0,0.6)',
      display: 'flex', alignItems: 'flex-end',
    }}
  >
    <div
      onClick={e => e.stopPropagation()}
      style={{
        width: '100%', maxHeight: '82vh',
        backgroundColor: 'var(--bg-global, #fff)',
        borderRadius: '20px 20px 0 0',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 20px',
        borderBottom: '1px solid var(--color-border)',
        flexShrink: 0,
      }}>
        <span style={{ fontWeight: '700', fontSize: '1rem', color: 'var(--color-text)' }}>{title}</span>
        <button
          onClick={onClose}
          aria-label="Chiudi"
          style={{
            background: 'none', border: 'none', fontSize: '1.4rem',
            cursor: 'pointer', color: 'var(--color-text-light)', lineHeight: 1,
          }}
        >✕</button>
      </div>
      {/* Contenuto scrollabile */}
      <div style={{ overflowY: 'auto', padding: '20px', flex: 1 }}>
        {children}
      </div>
    </div>
  </div>
);

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
  backgroundColor: C.card,
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

export const Auth = ({ passwordUpdateMode = false, onNavigate }) => {
  const { signIn, signUp, resetPassword, updatePassword, clearPasswordRecovery } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nome, setNome] = useState('');
  const [cognome, setCognome] = useState('');
  const [grado, setGrado] = useState('');
  const [forza, setForza] = useState('');
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(null); // null | 'privacy' | 'termini'
  const { showToast } = useToast();

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    const emailError = validators.email(normalizedEmail);
    if (emailError) {
      showToast(emailError, 'error');
      return;
    }
    if (!password) {
      showToast('Password obbligatoria', 'error');
      return;
    }

    const attempt = loginRateLimiter.canAttempt(normalizedEmail);
    if (isLogin && !attempt.allowed) {
      showToast(attempt.reason, 'error');
      return;
    }

    setLoading(true);
    if (isLogin) {
      const { error } = await signIn(normalizedEmail, password);
      loginRateLimiter.recordAttempt(normalizedEmail, !error);
      if (error) {
        showToast(mapAuthError(error, 'login'), 'error');
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
        showToast(requiredError, 'error');
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
        showToast(mapAuthError(error, 'register'), 'error');
      }
      else {
        showToast('Registrazione completata! Controlla la tua email per confermare l\'account.', 'success');
        // UX-04: reset campi registrazione al passaggio al login
        setNome(''); setCognome(''); setGrado(''); setForza('');
        setPassword(''); setPrivacyAccepted(false);
        setIsLogin(true);
      }
    }
    setLoading(false);
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    const emailError = validators.email(normalizedEmail);
    if (emailError) {
      showToast(emailError, 'error');
      return;
    }

    setLoading(true);
    const { error } = await resetPassword(normalizedEmail);
    setLoading(false);
    if (error) {
      showToast(mapAuthError(error, 'reset'), 'error');
    } else {
      showToast('Controlla la tua email per completare il recupero password.', 'success');
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    const passwordError = validators.password(password);
    if (passwordError) {
      showToast(passwordError, 'error');
      return;
    }
    if (password !== confirmPassword) {
      showToast('Le password non coincidono', 'error');
      return;
    }

    setLoading(true);
    const { error } = await updatePassword(password);
    setLoading(false);
    if (error) {
      showToast(mapAuthError(error, 'update'), 'error');
    }
    else {
      setPassword('');
      setConfirmPassword('');
      showToast('Password aggiornata correttamente.', 'success');
    }
  };

  return (
    <PageWrapper style={authPageStyle}>
      {/* Modal Privacy / Termini — accessibile anche senza sessione */}
      {modal === 'privacy' && (
        <DocModal title="Privacy Policy" onClose={() => setModal(null)}>
          <PrivacyContent />
        </DocModal>
      )}
      {modal === 'termini' && (
        <DocModal title="Termini di Servizio" onClose={() => setModal(null)}>
          <TerminiContent />
        </DocModal>
      )}
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
              <PasswordInput label="Nuova password" value={password} onChange={(e) => setPassword(e.target.value)} showRequirements />
              <PasswordInput label="Conferma password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
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
              {isLogin ? (
                <PasswordInput label="Password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') handleSubmit(e); }} />
              ) : (
                <PasswordInput label="Password" value={password} onChange={(e) => setPassword(e.target.value)} showRequirements onKeyDown={e => { if (e.key === 'Enter') handleSubmit(e); }} />
              )}

              {!isLogin && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', margin: '12px 0' }}>
                  <input
                    type="checkbox"
                    id="privacy-check"
                    checked={privacyAccepted}
                    onChange={e => setPrivacyAccepted(e.target.checked)}
                    style={{ marginTop: '2px', flexShrink: 0, cursor: 'pointer' }}
                  />
                  <label htmlFor="privacy-check" style={{ fontSize: '0.85rem', color: C.textLight, cursor: 'pointer', lineHeight: 1.4 }}>
                    Ho letto e accetto la{' '}
                    <button
                      type="button"
                      onClick={() => setModal('privacy')}
                      style={{ color: C.accent, textDecoration: 'underline', background: 'none', border: 'none', padding: 0, fontSize: 'inherit', cursor: 'pointer' }}
                    >
                      Privacy Policy
                    </button>
                    {' '}e i{' '}
                    <button
                      type="button"
                      onClick={() => setModal('termini')}
                      style={{ color: C.accent, textDecoration: 'underline', background: 'none', border: 'none', padding: 0, fontSize: 'inherit', cursor: 'pointer' }}
                    >
                      Termini di Servizio
                    </button>
                  </label>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || (!isLogin && (!privacyAccepted || !isPasswordValid(password)))}
                style={{
                  ...S.btnPrimary,
                  marginTop: '8px',
                  opacity: loading ? 0.7 : (isLogin || (privacyAccepted && isPasswordValid(password))) ? 1 : 0.5
                }}
              >
                {loading ? 'Attendi...' : (isLogin ? 'Accedi' : 'Registrati')}
              </button>

              {isLogin && (
                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                  <span style={{ fontSize: '0.75rem', color: C.textLight }}>
                    Utilizzando l'app accetti la{' '}
                    <button type="button" onClick={() => setModal('privacy')} style={{ color: C.accent, textDecoration: 'underline', background: 'none', border: 'none', fontSize: 'inherit', cursor: 'pointer', padding: 0 }}>
                      Privacy Policy
                    </button>
                    {' '}e i{' '}
                    <button type="button" onClick={() => setModal('termini')} style={{ color: C.accent, textDecoration: 'underline', background: 'none', border: 'none', fontSize: 'inherit', cursor: 'pointer', padding: 0 }}>
                      Termini di Servizio
                    </button>
                  </span>
                </div>
              )}
            </form>
          )}

          {!passwordUpdateMode && !isResettingPassword && (
            <div style={authSwitchStyle}>
              <button type="button" onClick={() => setIsLogin(!isLogin)} style={authSwitchBtnStyle}>
                {isLogin ? 'Non hai un account? Registrati' : 'Hai già un account? Accedi'}
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
    </PageWrapper>
  );
};
