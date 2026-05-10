import React, { useState } from 'react';
import { PageWrapper } from '../components/layout/PageWrapper';
import { TextInput } from '../components/ui/TextInput';
import { Toast } from '../components/ui/Toast';
import { C } from '../styles/theme';
import { useAuth } from '../hooks/useAuth';

export const Profilo = () => {
  const { profile, updateProfile, signOut } = useAuth();
  
  const [grado, setGrado] = useState(profile?.grado || '');
  const [nome, setNome] = useState(profile?.nome || '');
  const [cognome, setCognome] = useState(profile?.cognome || '');
  const [forza, setForza] = useState(profile?.forza || '');
  const [email, setEmail] = useState(profile?.email || '');
  const [telefono, setTelefono] = useState(profile?.telefono || '');
  
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState('');

  const handleSave = async () => {
    setLoading(true);
    const { error } = await updateProfile({ grado, nome, cognome, forza, email, telefono });
    if (error) setToast('Errore nel salvataggio: ' + error.message);
    else setToast('Profilo aggiornato con successo!');
    setLoading(false);
  };

  return (
    <PageWrapper>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ color: C.primary }}>Profilo Operatore</h2>
        <button 
          onClick={signOut}
          style={{ padding: '6px 12px', backgroundColor: C.dangerLight, color: C.danger, borderRadius: '8px', fontWeight: 'bold' }}>
          Esci
        </button>
      </div>
      
      <div style={{ backgroundColor: '#fff', padding: '16px', borderRadius: '12px', marginBottom: '24px' }}>
        <TextInput label="Grado" value={grado} onChange={e => setGrado(e.target.value)} />
        <TextInput label="Nome" value={nome} onChange={e => setNome(e.target.value)} />
        <TextInput label="Cognome" value={cognome} onChange={e => setCognome(e.target.value)} />
        <TextInput label="Forza di Polizia" value={forza} onChange={e => setForza(e.target.value)} />
        <TextInput label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
        <TextInput label="Telefono" type="tel" value={telefono} onChange={e => setTelefono(e.target.value)} />
        
        <button 
          onClick={handleSave}
          disabled={loading}
          style={{ width: '100%', padding: '12px', backgroundColor: C.primary, color: '#fff', borderRadius: '8px', fontWeight: 'bold', marginTop: '8px' }}>
          {loading ? 'Salvataggio...' : 'Salva Modifiche'}
        </button>
      </div>

      <div style={{ backgroundColor: '#fff', padding: '16px', borderRadius: '12px', textAlign: 'center', border: `1px solid ${C.border}` }}>
        <h4 style={{ color: C.primary, marginBottom: '8px' }}>Supporta CdS Pro</h4>
        <p style={{ fontSize: '0.85rem', color: C.textLight, marginBottom: '12px' }}>
          Questa app è sviluppata per supportare il lavoro delle forze dell'ordine. Se la trovi utile, puoi offrire un caffè allo sviluppatore.
        </p>
        <a href="#" style={{ display: 'inline-block', padding: '10px 20px', backgroundColor: '#0070ba', color: '#fff', borderRadius: '24px', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.9rem' }}>
          ☕ Dona con PayPal
        </a>
      </div>

      {toast && <Toast message={toast} onClose={() => setToast('')} />}
    </PageWrapper>
  );
};
