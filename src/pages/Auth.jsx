import React, { useState } from 'react';
import { PageWrapper } from '../components/layout/PageWrapper';
import { TextInput } from '../components/ui/TextInput';
import { Toast } from '../components/ui/Toast';
import { useAuth } from '../hooks/useAuth';
import { C } from '../styles/theme';

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
      else {
        setToast('Registrazione completata!');
        setIsLogin(true);
      }
    }
    setLoading(false);
  };

  return (
    <PageWrapper style={{ justifyContent: 'center', backgroundColor: C.primary, color: '#fff' }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '8px' }}>CdS Pro</h1>
        <p style={{ color: C.accentLight }}>Codice della Strada e Prontuario</p>
      </div>

      <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '16px', color: C.text }}>
        <h2 style={{ marginBottom: '20px', textAlign: 'center' }}>{isLogin ? 'Accedi' : 'Registrati'}</h2>
        
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
          style={{
            width: '100%',
            padding: '14px',
            backgroundColor: C.primary,
            color: '#fff',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: 'bold',
            marginTop: '8px',
            opacity: loading ? 0.7 : 1
          }}
        >
          {loading ? 'Attendi...' : (isLogin ? 'Accedi' : 'Registrati')}
        </button>

        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <button 
            onClick={() => setIsLogin(!isLogin)}
            style={{ color: C.accent, textDecoration: 'underline', fontSize: '0.9rem' }}
          >
            {isLogin ? 'Non hai un account? Registrati' : 'Hai già un account? Accedi'}
          </button>
        </div>
      </div>
      
      {toast && <Toast message={toast} type="error" onClose={() => setToast('')} />}
    </PageWrapper>
  );
};
