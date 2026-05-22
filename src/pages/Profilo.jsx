import React, { useState, useEffect } from 'react';
import { PageWrapper } from '../components/layout/PageWrapper';
import { TextInput } from '../components/ui/TextInput';
import { useToast } from '../components/ui/ToastManager';
import { C } from '../styles/theme';
import { S } from '../styles/styles';
import { PS } from '../styles/pages';
import { useGamification } from '../hooks/useGamification';
import { LevelProgress } from '../components/gamification/LevelProgress';
import { StreakCounter } from '../components/gamification/StreakCounter';
import { BadgeShowcase } from '../components/gamification/BadgeShowcase';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { DB_VERSION_CDS, DB_VERSION_PRONTUARIO, SYSTEM_STATUS, APP_VERSION } from '../config/constants';

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

  // Gamification hook
  const {
    stats,
    loading,
    error,
    addXP,
    updateStreak,
    getUnlockedBadges,
    checkNewBadges,
    setFeaturedBadge,
    level,
    xp,
    currentStreak,
    longestStreak,
    featuredBadge,
    unlockedBadges,
  } = useGamification();

  // Update daily streak on mount
  useEffect(() => {
    if (!loading && stats) {
      updateStreak();
    }
  }, [loading, stats]);

  const [reportOpen, setReportOpen] = useState(false);
  const [reportType, setReportType] = useState('Problema Tecnico');
  const [reportDetails, setReportDetails] = useState('');
  const [reportSending, setReportSending] = useState(false);

  const handleSendReport = async (e) => {
    e.preventDefault();
    if (!reportDetails.trim()) return;
    setReportSending(true);

    const operatoreNome = `${profile?.grado || ''} ${profile?.nome || ''} ${profile?.cognome || ''}`.trim() || 'Operatore Anonimo';
    const operatoreEmail = profile?.email || 'Nessuna';
    const reportData = {
      tipo: reportType,
      dettagli: reportDetails,
      email: operatoreEmail,
      operatore: operatoreNome,
      created_at: new Date().toISOString(),
      risolto: false
    };

    let saved = false;
    try {
      const { supabase, isSupabaseConfigured } = await import('../config/supabase');
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.from('segnalazioni').insert([reportData]);
        if (!error) saved = true;
      }
    } catch (err) {
      console.warn("Supabase insert report skipped/failed:", err);
    }

    if (!saved) {
      try {
        const local = localStorage.getItem('polisroad_local_segnalazioni');
        const list = local ? JSON.parse(local) : [];
        list.push({ ...reportData, id: `local_${Date.now()}` });
        localStorage.setItem('polisroad_local_segnalazioni', JSON.stringify(list));
      } catch (err) {
        console.error("Local storage report backup failed:", err);
      }
    }

    setReportSending(false);
    showToast('Segnalazione registrata con successo!', 'success');

    // Prepara e lancia mailto
    const subject = encodeURIComponent(`[PolisRoad Segnalazione] ${reportType}`);
    const body = encodeURIComponent(
      `--- SEGNALAZIONE PROBLEMA POLISROAD ---\n` +
      `Tipo: ${reportType}\n` +
      `Data: ${new Date().toLocaleString()}\n` +
      `Versione App: ${APP_VERSION}\n` +
      `Operatore: ${operatoreNome}\n` +
      `Email: ${operatoreEmail}\n` +
      `---------------------------------------\n\n` +
      `Dettagli:\n${reportDetails}\n`
    );
    window.location.href = `mailto:admin@polisroad.it?subject=${subject}&body=${body}`;

    setReportDetails('');
    setReportOpen(false);
  };

  const handleSave = async () => {
    setLoading(true);
    const { error } = await updateProfile(formData);
    if (error) showToast('Errore nel salvataggio: ' + error.message, 'error');
    else { showToast('Profilo aggiornato!', 'success'); setIsEditing(false); }
    setLoading(false);
  };

  const handleCancel = () => {
    setFormData({
      grado: profile?.grado || '',
      nome: profile?.nome || '',
      cognome: profile?.cognome || '',
      forza: profile?.forza || '',
      email: profile?.email || '',
      telefono: profile?.telefono || '',
    });
    setIsEditing(false);
  };

  // Set featured badge
  const handleBadgeSelect = async (badgeId) => {
    try {
      await setFeaturedBadge(badgeId);
      showToast('Badge impostato come featured!', 'success');
    } catch (e) {
      showToast('Impossibile impostare il badge', 'error');
    }
  };


  return (
    <PageWrapper onNavigate={onNavigate}>
      <div style={{ ...S.pageHeader, marginBottom: '24px' }}>
        <h2 style={S.pageTitle}>Profilo Operatore</h2>
        <button onClick={signOut} style={PS.profileExitBtn}>Esci</button>
      </div>

      {/* Scheda Identità */}
      <div style={{ ...S.cardElevated, marginBottom: '24px', overflow: isEditing ? 'visible' : 'hidden' }}>
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

      {/* Modulo Segnala un Problema */}
      <div style={PS.profileSysBox}>
        <div 
          onClick={() => setReportOpen(!reportOpen)} 
          style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            cursor: 'pointer',
            userSelect: 'none'
          }}
        >
          <h4 style={{ ...PS.profileSysTitle, margin: 0 }}>🚨 Segnala un Problema</h4>
          <span style={{ 
            fontSize: '0.8rem', 
            color: C.textLight, 
            transition: 'transform 0.2s', 
            transform: reportOpen ? 'rotate(90deg)' : 'none',
            display: 'inline-block'
          }}>
            ▶
          </span>
        </div>
        
        {reportOpen && (
          <form onSubmit={handleSendReport} style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '16px' }}>
            <p style={{ fontSize: '0.85rem', color: C.textLight, margin: '0 0 4px 0', lineHeight: '1.4' }}>
              Segnala bug, errori nei dati o malfunzionamenti. La segnalazione verrà registrata sul database per l'amministratore e si aprirà l'app e-mail per l'invio diretto.
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 'bold', color: C.textLight, textTransform: 'uppercase' }}>
                Tipo di problema
              </label>
              <select
                value={reportType}
                onChange={e => setReportType(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: `1px solid ${C.border}`,
                  backgroundColor: C.card,
                  color: C.text,
                  fontSize: '0.9rem',
                  outline: 'none',
                  cursor: 'pointer',
                  boxSizing: 'border-box'
                }}
              >
                <option value="Problema Tecnico">Problema Tecnico (Bug)</option>
                <option value="Errore nel Prontuario">Errore nel Prontuario</option>
                <option value="Errore nella Normativa">Errore nella Normativa</option>
                <option value="Suggerimento">Suggerimento / Richiesta</option>
                <option value="Altro">Altro</option>
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 'bold', color: C.textLight, textTransform: 'uppercase' }}>
                  Dettagli / Messaggio
                </label>
                <span style={{ fontSize: '0.7rem', color: reportDetails.length > 900 ? C.danger : C.textLight }}>
                  {reportDetails.length}/1000
                </span>
              </div>
              <textarea
                value={reportDetails}
                onChange={e => setReportDetails(e.target.value.slice(0, 1000))}
                placeholder="Descrivi dettagliatamente il problema o l'errore riscontrato..."
                rows={4}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: `1px solid ${C.border}`,
                  backgroundColor: C.card,
                  color: C.text,
                  fontSize: '0.9rem',
                  outline: 'none',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                  boxSizing: 'border-box',
                  lineHeight: '1.4'
                }}
              />
            </div>

            <button 
              type="submit" 
              disabled={reportSending || !reportDetails.trim()} 
              style={{ 
                ...S.btnPrimary, 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                gap: '8px',
                opacity: !reportDetails.trim() ? 0.6 : 1,
                cursor: !reportDetails.trim() ? 'not-allowed' : 'pointer',
                border: 'none',
                marginTop: '6px'
              }}
            >
              {reportSending ? 'Registrazione...' : 'Invia e Apri Email 📧'}
            </button>
          </form>
        )}
      </div>

      {/* Pannello Amministratore (Solo se admin) */}
      {profile?.ruolo === 'admin' && (
        <div style={{ ...PS.profileSysBox, borderLeft: `4px solid ${C.accent}` }}>
          <h4 style={PS.profileSysTitle}>⚙️ Pannello di Controllo Amministratore</h4>
          <p style={{ fontSize: '0.85rem', color: C.textLight, marginBottom: '12px', lineHeight: '1.4' }}>
            Il tuo account dispone dei privilegi di amministratore. Accedi al pannello per gestire notizie, prontuario e leggere le segnalazioni inviate.
          </p>
          <button 
            onClick={() => onNavigate('admin_dashboard')} 
            style={{ 
              ...S.btnPrimary, 
              backgroundColor: C.accent, 
              color: '#fff', 
              border: 'none',
              cursor: 'pointer' 
            }}
          >
            Accedi ad Area Amministrativa
          </button>
        </div>
      )}

      {/* Gamification Dashboard */}
      {!loading && stats && (
        <div style={{ ...S.cardElevated, marginBottom: '24px' }}>
          <LevelProgress
            level={level}
            xp={xp}
            nextLevelXp={stats.next_level_xp || (level + 1) * 100}
          />
          <StreakCounter
            currentStreak={currentStreak}
            longestStreak={longestStreak}
          />
          <BadgeShowcase
            unlockedBadges={unlockedBadges}
            featuredBadge={featuredBadge}
            onSelect={handleBadgeSelect}
          />
        </div>
      )}

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
