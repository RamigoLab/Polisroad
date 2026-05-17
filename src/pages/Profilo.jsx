import React, { useState } from 'react';
import { PageWrapper } from '../components/layout/PageWrapper';
import { TextInput } from '../components/ui/TextInput';
import { useToast } from '../components/ui/ToastManager';
import { C } from '../styles/theme';
import { S } from '../styles/styles';
import { PS } from '../styles/pages';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { DB_VERSION_CDS, DB_VERSION_PRONTUARIO, SYSTEM_STATUS } from '../config/constants';

const DataRow = ({ label, value, icon }) => (
  <div style={S.dataRow}>
    <div style={S.dataRowIcon}>{icon}</div>
    <div style={{ flex: 1 }}>
      <div style={S.dataRowLabel}>{label}</div>
      <div style={S.dataRowValue}>{value || 'Non specificato'}</div>
    </div>
  </div>
);

const SysRow = ({ label, value, valueStyle }) => (
  <div style={S.infoRow}>
    <span style={{ color: C.textLight }}>{label}</span>
    <span style={{ fontWeight: 'bold', ...valueStyle }}>{value}</span>
  </div>
);

export const Profilo = ({ onNavigate }) => {
  const { profile, updateProfile, signOut, userCount } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    grado: profile?.grado || '',
    nome: profile?.nome || '',
    cognome: profile?.cognome || '',
    forza: profile?.forza || '',
    email: profile?.email || '',
    telefono: profile?.telefono || '',
  });
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const { isDarkMode, toggleTheme } = useTheme();

  const handleSave = async () => {
    setLoading(true);
    const { error } = await updateProfile(formData);
    if (error) showToast('Errore nel salvataggio: ' + error.message, 'error');
    else { showToast('Profilo aggiornato!', 'success'); setIsEditing(false); }
    setLoading(false);
  };

  const handleCancel = () => {
    setFormData({
      grado: profile?.grado || '', nome: profile?.nome || '',
      cognome: profile?.cognome || '', forza: profile?.forza || '',
      email: profile?.email || '', telefono: profile?.telefono || '',
    });
    setIsEditing(false);
  };


  return (
    <PageWrapper onNavigate={onNavigate}>
      <div style={{ ...S.pageHeader, marginBottom: '24px' }}>
        <h2 style={S.pageTitle}>Profilo Operatore</h2>
        <button onClick={signOut} style={PS.profileExitBtn}>Esci</button>
      </div>

      {/* Scheda Identità */}
      <div style={{ ...S.cardElevated, marginBottom: '24px' }}>
        <div style={PS.profileHeaderBg}>
          <div style={PS.profileAvatar}>👮</div>
          <div>
            <h3 style={PS.profileHeaderName}>{profile?.nome} {profile?.cognome}</h3>
            <p style={PS.profileHeaderGrado}>{profile?.grado || 'Operatore'}</p>
          </div>
        </div>

        <div style={{ padding: '16px' }}>
          {isEditing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <TextInput label="Grado" value={formData.grado} onChange={e => setFormData({ ...formData, grado: e.target.value })} />
              <TextInput label="Nome" value={formData.nome} onChange={e => setFormData({ ...formData, nome: e.target.value })} />
              <TextInput label="Cognome" value={formData.cognome} onChange={e => setFormData({ ...formData, cognome: e.target.value })} />
              <TextInput label="Forza di Polizia" value={formData.forza} onChange={e => setFormData({ ...formData, forza: e.target.value })} />
              <TextInput label="Email" type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
              <TextInput label="Telefono" type="tel" value={formData.telefono} onChange={e => setFormData({ ...formData, telefono: e.target.value })} />
              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <button onClick={handleCancel} style={S.btnSecondary}>Annulla</button>
                <button onClick={handleSave} disabled={loading} style={{ ...S.btnPrimary, flex: 2 }}>
                  {loading ? 'Salvataggio...' : 'Salva Modifiche'}
                </button>
              </div>
            </div>
          ) : (
            <>
              <DataRow label="Grado / Qualifica" value={profile?.grado} icon="🎖️" />
              <DataRow label="Nome" value={profile?.nome} icon="👤" />
              <DataRow label="Cognome" value={profile?.cognome} icon="🆔" />
              <DataRow label="Corpo / Forza" value={profile?.forza} icon="🏢" />
              <DataRow label="Email di Servizio" value={profile?.email} icon="📧" />
              <DataRow label="Contatto Telefonico" value={profile?.telefono} icon="📱" />
              <button onClick={() => setIsEditing(true)} style={S.btnOutline}>⚙️ Modifica Profilo</button>
            </>
          )}
        </div>
      </div>

      {/* Impostazioni Aspetto */}
      <div style={PS.profileSysBox}>
        <h4 style={PS.profileSysTitle}>🎨 Impostazioni Aspetto</h4>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: C.text, fontWeight: '500' }}>Dark Mode (Tema Scuro)</span>
          <button 
            onClick={toggleTheme} 
            style={{
              padding: '8px 16px',
              backgroundColor: isDarkMode ? C.success : C.textLight,
              color: '#fff',
              borderRadius: '20px',
              fontWeight: 'bold',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            {isDarkMode ? '🌙 Attiva' : '☀️ Disattivata'}
          </button>
        </div>
      </div>

      {/* Informazioni di Sistema */}
      <div style={PS.profileSysBox}>
        <h4 style={PS.profileSysTitle}>📦 Informazioni di Sistema</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <SysRow label="Versione Database CdS:" value={DB_VERSION_CDS} valueStyle={{ color: C.primary }} />
          <SysRow label="Versione Prontuario:" value={DB_VERSION_PRONTUARIO} valueStyle={{ color: C.primary }} />
          <SysRow label="Operatori Iscritti:" value={userCount} valueStyle={{ color: C.accent }} />
          <SysRow label="Stato Connessione:" value={SYSTEM_STATUS} valueStyle={{ color: C.success }} />
        </div>
      </div>

      {/* Supporta */}
      <div style={PS.profileSupportBox}>
        <h4 style={{ color: C.primary, marginBottom: '8px' }}>Supporta PolisRoad</h4>
        <p style={{ fontSize: '0.85rem', color: C.textLight, marginBottom: '12px' }}>
          Questa app è sviluppata per supportare il lavoro delle forze dell'ordine. Se la trovi utile, puoi offrire un caffè allo sviluppatore.
        </p>
        <a href="https://www.paypal.me" target="_blank" rel="noreferrer" style={PS.profileDonateBtn}>
          ☕ Dona con PayPal
        </a>
      </div>
    </PageWrapper>
  );
};
