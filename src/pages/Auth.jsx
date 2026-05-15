import React, { useState } from 'react';
import { PageWrapper } from '../components/layout/PageWrapper';
import { TextInput } from '../components/ui/TextInput';
import { Toast } from '../components/ui/Toast';
import { C } from '../styles/theme';
import { S } from '../styles/styles';
import { useAuth } from '../hooks/useAuth';

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

  const handleSubmit = async () => {
    setLoading(true);
    setToast('');
    if (isLogin) {
      const { error } = await signIn(email, password);
      if (error) setToast(error.message);
    } else {
      const { error } = await signUp(email, password, { nome, cognome, grado, forza });
      if (error) setToast(error.message);
      else { setToast('Registrazione completata!'); setIsLogin(true); }
    }
    setLoading(false);
  };

  return (
    <PageWrapper style={authPageStyle}>
      <div style={authHeaderStyle}>
        <h1 style={authTitleStyle}>PolisRoad</h1>
        <p style={authSubtitleStyle}>Il Codice della Strada, sempre con te</p>
      </div>

      <div style={authCardStyle}>
        <h2 style={authCardTitleStyle}>{isLogin ? 'Accedi' : 'Registrati'}</h2>

        {!isLogin && (
          <>
            <TextInput label="Nome" value={nome} onChange={(e) => setNome(e.target.value)} />
            <TextInput label="Cognome" value={cognome} onChange={(e) => setCognome(e.target.value)} />
            <TextInput label="Grado" value={grado} onChange={(e) => setGrado(e.target.value)} />
            <TextInput label="Forza di Polizia" value={forza} onChange={(e) => setForza(e.target.value)} />
          </>
        )}

        <TextInput label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <TextInput label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />

        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{ ...S.btnPrimary, marginTop: '8px', opacity: loading ? 0.7 : 1 }}
        >
          {loading ? 'Attendi...' : (isLogin ? 'Accedi' : 'Registrati')}
        </button>

        <div style={authSwitchStyle}>
          <button onClick={() => setIsLogin(!isLogin)} style={authSwitchBtnStyle}>
            {isLogin ? 'Non hai un account? Registrati' : 'Hai già un account? Accedi'}
          </button>
        </div>
      </div>

      {toast && <Toast message={toast} type="error" onClose={() => setToast('')} />}
    </PageWrapper>
  );
};
