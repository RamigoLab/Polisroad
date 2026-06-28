import React, { useState, useEffect } from 'react';
import { PageWrapper } from '../components/layout/PageWrapper';
import { TextInput } from '../components/ui/TextInput';
import { useToast } from '../components/ui/ToastManager';
import { C } from '../styles/theme';
import { Icon } from '../components/ui/Icon';
import { S } from '../styles/styles';
import { PS } from '../styles/pages';
import { useGamificationContext } from '../context/GamificationContext';
import { LevelProgress } from '../components/gamification/LevelProgress';
import { StreakCounter } from '../components/gamification/StreakCounter';
import { BadgeShowcase } from '../components/gamification/BadgeShowcase';

import { BADGES } from '../config/badges';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { usePushNotifications } from '../hooks/usePushNotifications';
import { useInstallPrompt } from '../hooks/useInstallPrompt';
import { DB_VERSION_CDS, DB_VERSION_PRONTUARIO, SYSTEM_STATUS, APP_VERSION } from '../config/constants';
import { APP_CHANGELOG } from '../config/changelog';
import { sanitizers, validators } from '../utils/validation';
import { supabase, isSupabaseConfigured } from '../config/supabase';

import { logger } from '../utils/logger';
import posthog from 'posthog-js';
const DataRow = ({ label, value, icon }) => (
  <div style={S.dataRow}>
    <div style={S.dataRowIcon}>{icon}</div>
    <div style={{ flex: 1 }}>
      <div style={S.dataRowLabel}>{label}</div>
      <div style={S.dataRowValue}>{value !== undefined && value !== null ? value : 'Non specificato'}</div>
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
  const [saveLoading, setSaveLoading] = useState(false);
  const [resetContestazioniLoading, setResetContestazioniLoading] = useState(false);
  const { showToast } = useToast();

  const { isDarkMode, toggleTheme } = useTheme();
  const {
    isSupported: pushSupported,
    isSafariNotStandalone: pushSafariNotStandalone,
    isSubscribed: pushSubscribed,
    deviceCount: pushDeviceCount,
    permission: pushPermission,
    loading: pushLoading,
    subscribe: pushSubscribe,
    unsubscribe: pushUnsubscribe,
    unsubscribeAll: pushUnsubscribeAll,
  } = usePushNotifications();
  const { isInstallable, isInstalled, promptInstall } = useInstallPrompt();

  // Stato consenso analytics PostHog
  const [analyticsEnabled, setAnalyticsEnabled] = useState(() => !posthog.has_opted_out_capturing());
  const toggleAnalytics = () => {
    if (analyticsEnabled) {
      posthog.opt_out_capturing();
      setAnalyticsEnabled(false);
    } else {
      posthog.opt_in_capturing();
      setAnalyticsEnabled(true);
    }
  };

  // Gamification context
  const {
    stats,
    loading,
    updateStreak,
    setFeaturedBadge,
    level,
    xp,
    currentStreak,
    longestStreak,
    featuredBadge: featuredBadgeId,
    unlockedBadges,
    resetContestazioni,
  } = useGamificationContext();

  // featuredBadge nel context è una stringa ID; lo risolviamo nell'oggetto badge completo
  const featuredBadge = featuredBadgeId
    ? Object.values(BADGES).find(b => b.id === featuredBadgeId) || null
    : null;

  // Update daily streak on mount
  useEffect(() => {
    if (!loading && stats) {
      updateStreak();
    }
  }, [loading, stats, updateStreak]);

  const [reportOpen, setReportOpen] = useState(false);
  const [reportType, setReportType] = useState('Problema Tecnico');
  const [reportDetails, setReportDetails] = useState('');
  const [reportSending, setReportSending] = useState(false);

  const handleSendReport = async (e) => {
    e.preventDefault();
    const detailsRequiredError = validators.required(reportDetails, 'Dettagli');
    const detailsLengthError = validators.maxLength(reportDetails, 1000, 'Dettagli');
    if (detailsRequiredError || detailsLengthError) {
      showToast(detailsRequiredError || detailsLengthError, 'error');
      return;
    }
    setReportSending(true);

    const safeReportType = sanitizers.text(reportType);
    const safeReportDetails = sanitizers.text(reportDetails);
    const operatoreNome = sanitizers.text(`${profile?.grado || ''} ${profile?.nome || ''} ${profile?.cognome || ''}`) || 'Operatore Anonimo';
    const operatoreEmail = profile?.email ? sanitizers.text(profile.email) : 'Nessuna';
    const reportData = {
      tipo: safeReportType,
      dettagli: safeReportDetails,
      email: operatoreEmail,
      operatore: operatoreNome,
      created_at: new Date().toISOString(),
      risolto: false
    };

    // BUG-13: usa l'import statico già presente (rimosso import dinamico)
    let saved = false;
    try {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.from('segnalazioni').insert([reportData]);
        if (!error) saved = true;
      }
    } catch (err) {
      logger.warn("Supabase insert report skipped/failed:", err);
    }

    if (!saved) {
      try {
        const local = localStorage.getItem('polisroad_local_segnalazioni');
        const list = local ? JSON.parse(local) : [];
        list.push({ ...reportData, id: `local_${Date.now()}` });
        localStorage.setItem('polisroad_local_segnalazioni', JSON.stringify(list));
      } catch (err) {
        logger.error("Local storage report backup failed:", err);
      }
    }

    setReportSending(false);
    showToast('Segnalazione registrata con successo!', 'success');

    // Reset immediato dei dettagli del form e chiusura
    setReportDetails('');
    setReportOpen(false);

    // Prepara e lancia mailto dopo un breve delay per mostrare il toast
    setTimeout(() => {
      const subject = encodeURIComponent(`[PolisRoad Segnalazione] ${safeReportType}`);
      const body = encodeURIComponent(
        `--- SEGNALAZIONE PROBLEMA POLISROAD ---\n` +
        `Tipo: ${safeReportType}\n` +
        `Data: ${new Date().toLocaleString()}\n` +
        `Versione App: ${APP_VERSION}\n` +
        `Operatore: ${operatoreNome}\n` +
        `Email: ${operatoreEmail}\n` +
        `---------------------------------------\n\n` +
        `Dettagli:\n${safeReportDetails}\n`
      );
      window.location.href = `mailto:admin@polisroad.it?subject=${subject}&body=${body}`;
    }, 1000);
  };

  const handleSave = async () => {
    const emailError = formData.email ? validators.email(formData.email.trim().toLowerCase()) : null;
    const requiredError =
      validators.required(formData.nome, 'Nome') ||
      validators.required(formData.cognome, 'Cognome') ||
      validators.required(formData.grado, 'Grado') ||
      validators.required(formData.forza, 'Forza di Polizia');
    const lengthError =
      validators.maxLength(formData.nome, 80, 'Nome') ||
      validators.maxLength(formData.cognome, 80, 'Cognome') ||
      validators.maxLength(formData.grado, 80, 'Grado') ||
      validators.maxLength(formData.forza, 120, 'Forza di Polizia') ||
      validators.maxLength(formData.telefono || '', 30, 'Telefono');

    if (requiredError || emailError || lengthError) {
      showToast(requiredError || emailError || lengthError, 'error');
      return;
    }

    const sanitizedProfile = {
      grado: sanitizers.text(formData.grado),
      nome: sanitizers.text(formData.nome),
      cognome: sanitizers.text(formData.cognome),
      forza: sanitizers.text(formData.forza),
      email: formData.email.trim().toLowerCase(),
      telefono: sanitizers.text(formData.telefono || ''),
    };

    setSaveLoading(true);
      const { error } = await updateProfile(sanitizedProfile);
      if (error) showToast('Errore nel salvataggio: ' + error.message, 'error');
      else { showToast('Profilo aggiornato!', 'success'); setIsEditing(false); }
      setSaveLoading(false);
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

  const handleResetContestazioni = async () => {
    const total = stats?.total_contestazioni || 0;
    if (total <= 0) {
      showToast('Il contatore contestazioni è già a zero.', 'success');
      return;
    }

    const confirmed = window.confirm('Vuoi azzerare le contestazioni effettuate? Questa operazione aggiorna il tuo profilo.');
    if (!confirmed) return;

    setResetContestazioniLoading(true);
    const { error } = await resetContestazioni();
    setResetContestazioniLoading(false);

    if (error) showToast('Errore durante l\'azzeramento: ' + error.message, 'error');
    else showToast('Contestazioni azzerate.', 'success');
  };

  const handleExportData = async () => {
    try {
      const uid = profile?.id;
      if (!uid) return;
      
      showToast('Esportazione dati in corso...', 'success');
      
      const [
        profileRes,
        noteRes,
        preferitiRes,
        xpHistoryRes,
        gamificationRes
      ] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', uid),
        supabase.from('note').select('*').eq('user_id', uid),
        supabase.from('preferiti').select('*').eq('user_id', uid),
        supabase.from('xp_history').select('*').eq('user_id', uid),
        supabase.from('gamification').select('*').eq('user_id', uid)
      ]);

      const data = {
        esportato_il: new Date().toISOString(),
        profile: profileRes.data || [],
        note: noteRes.data || [],
        preferiti: preferitiRes.data || [],
        xp_history: xpHistoryRes.data || [],
        gamification: gamificationRes.data || []
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `polisroad_export_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      showToast('Dati esportati con successo!', 'success');
    } catch (err) {
      showToast('Errore durante l\'esportazione: ' + err.message, 'error');
    }
  };

  // Stato modale eliminazione account
  const [deleteModal, setDeleteModal] = useState(false); // step 1
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'ELIMINA') return;
    setDeleteLoading(true);
    try {
      const uid = profile.id;

      // Esegui tutte le DELETE in parallelo e raccogli gli eventuali errori
      const deleteOps = [
        supabase.from('xp_history').delete().eq('user_id', uid),
        supabase.from('gamification').delete().eq('user_id', uid),
        supabase.from('note').delete().eq('user_id', uid),
        supabase.from('preferiti').delete().eq('user_id', uid),
      ];
      if (profile?.email) {
        deleteOps.push(supabase.from('segnalazioni').delete().eq('email', profile.email));
      }
      deleteOps.push(supabase.from('profiles').delete().eq('id', uid));

      const results = await Promise.all(deleteOps);
      const errors = results.filter(r => r.error).map(r => r.error.message);

      if (errors.length > 0) {
        throw new Error('Errore eliminazione dati: ' + errors.join('; '));
      }

      // Invocazione Edge Function per cancellare l'utente auth da Supabase
      const { error: fnError } = await supabase.functions.invoke('delete-user', { body: { uid } });
      if (fnError) {
        throw new Error('Errore eliminazione account auth: ' + fnError.message);
      }

      await signOut();
      showToast('Account e tutti i dati cancellati con successo.', 'success');
    } catch (err) {
      logger.error('handleDeleteAccount error:', err);
      showToast('Errore durante la cancellazione: ' + err.message, 'error');
      setDeleteLoading(false);
      setDeleteModal(false);
      setDeleteConfirmText('');
    }
  };



  return (
    <PageWrapper
      title="Profilo Operatore"
      subtitle="Account, progressi e sistema"
      onNavigate={onNavigate}
      headerRightAction={<button onClick={signOut} style={PS.profileExitBtn}>Esci</button>}
    >

      {/* Scheda Identità */}
      <div style={{ ...S.cardElevated, marginBottom: '24px', overflow: isEditing ? 'visible' : 'hidden' }}>
        <div style={PS.profileHeaderBg}>
          <div style={PS.profileAvatar}>
            <Icon name="user" size={32} />
            {featuredBadge && (
              <div style={{
                position: 'absolute',
                bottom: '-10px',
                right: '-10px',
                fontSize: '1.8rem',
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
              }}>
                {featuredBadge.icon}
              </div>
            )}
          </div>
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
                <button onClick={handleSave} disabled={saveLoading} style={{ ...S.btnPrimary, flex: 2 }}>
                  {saveLoading ? 'Salvataggio...' : 'Salva Modifiche'}
                </button>
              </div>
            </div>
          ) : (
            <>
              <DataRow label="Grado / Qualifica" value={profile?.grado} icon={<Icon name="medal" size={16}/>} />
              <DataRow label="Nome" value={profile?.nome} icon={<Icon name="user" size={16}/>} />
              <DataRow label="Cognome" value={profile?.cognome} icon={<Icon name="user-check" size={16}/>} />
              <DataRow label="Corpo / Forza" value={profile?.forza} icon={<Icon name="building" size={16}/>} />
              <DataRow label="Email di Servizio" value={profile?.email} icon={<Icon name="mail" size={16}/>} />
              <DataRow label="Contatto Telefonico" value={profile?.telefono} icon={<Icon name="smartphone" size={16}/>} />
              <div style={{ margin: '16px 0', padding: '16px', backgroundColor: C.accentLight, borderRadius: '12px' }}>
                <DataRow label="Contestazioni Effettuate" value={stats?.total_contestazioni || 0} icon={<Icon name="shield-alert" size={16}/>} />
                <button
                  onClick={handleResetContestazioni}
                  disabled={resetContestazioniLoading || loading}
                  style={{
                    ...S.btnDanger,
                    width: '100%',
                    marginTop: '12px',
                    padding: '10px 12px',
                    opacity: resetContestazioniLoading || loading ? 0.7 : 1,
                    cursor: resetContestazioniLoading || loading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {resetContestazioniLoading ? 'Azzeramento...' : 'Azzera contestazioni'}
                </button>
              </div>
              <button onClick={() => setIsEditing(true)} style={{ ...S.btnOutline, marginBottom: '10px' }}><Icon name="settings" size={15}/> Modifica Profilo</button>
              <button onClick={handleExportData} style={{ ...S.btnOutline, borderColor: C.primary, color: C.primary }}><Icon name="download" size={15}/> Esporta i miei dati (Portabilità GDPR)</button>
            </>
          )}
        </div>
      </div>

      {/* Impostazioni Aspetto */}
      <div style={PS.profileSysBox}>
        <h4 style={PS.profileSysTitle}><span style={{display:"inline-flex",alignItems:"center",gap:"6px"}}><Icon name="palette" size={16}/>  Impostazioni Aspetto</span></h4>
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
            {isDarkMode ? <><Icon name="moon" size={14}/> Attivo</> : <><Icon name="sun" size={14}/> Disattivata</>}
          </button>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
          <div style={{ flex: 1, paddingRight: '12px' }}>
            <span style={{ color: C.text, fontWeight: '500' }}>Analytics (PostHog)</span>
            <p style={{ fontSize: '0.75rem', color: C.textLight, margin: '2px 0 0' }}>
              Consenso all'invio di dati anonimi sull'utilizzo dell'app per migliorare il servizio.
            </p>
          </div>
          <button
            onClick={toggleAnalytics}
            style={{
              padding: '8px 16px',
              backgroundColor: analyticsEnabled ? C.success : C.textLight,
              color: '#fff',
              borderRadius: '20px',
              fontWeight: 'bold',
              border: 'none',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            {analyticsEnabled ? <><Icon name="check" size={14}/> Attivo</> : <><Icon name="x" size={14}/> Disattivato</>}
          </button>
        </div>
      </div>


      {/* Installazione PWA */}
      {!isInstalled && isInstallable && (
        <div style={PS.profileSysBox}>
          <h4 style={PS.profileSysTitle}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Icon name="download" size={16} /> Installa l'app
            </span>
          </h4>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ flex: 1, paddingRight: '12px' }}>
              <span style={{ color: C.text, fontWeight: '500' }}>Aggiungi alla schermata Home</span>
              <p style={{ fontSize: '0.75rem', color: C.textLight, margin: '2px 0 0' }}>
                Accedi a PolisRoad come un'app nativa, anche offline.
              </p>
            </div>
            <button
              onClick={promptInstall}
              style={{
                padding: '8px 16px',
                backgroundColor: C.accent,
                color: '#fff', borderRadius: '20px',
                fontWeight: 'bold', border: 'none',
                cursor: 'pointer', flexShrink: 0,
              }}
            >
              <Icon name="download" size={14} /> Installa
            </button>
          </div>
        </div>
      )}
      {isInstalled && (
        <div style={{ ...PS.profileSysBox, borderLeft: `3px solid ${C.success}` }}>
          <span style={{ fontSize: '0.85rem', color: C.success, fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <Icon name="circle-check" size={15} /> App installata sul dispositivo
          </span>
        </div>
      )}

      {/* Notifiche Push */}
      <div style={PS.profileSysBox}>
        <h4 style={PS.profileSysTitle}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <Icon name="bell" size={16} /> Notifiche Push
          </span>
        </h4>
        {!pushSupported ? (
          <div style={{ color: C.textLight, fontSize: '0.8rem', textAlign: 'left', lineHeight: '1.6' }}>
            {/* BUG-07: messaggio specifico per Safari non-standalone */}
            {pushSafariNotStandalone ? (
              <span>
                Su Safari le notifiche push sono disponibili solo installando PolisRoad come app.
                {' '}Tocca <strong>Condividi → Aggiungi a schermata Home</strong>, poi riapri l'app installata.
              </span>
            ) : !('Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window) ? (
              <span>Notifiche push non supportate da questo browser o dispositivo.</span>
            ) : (
              <span>Notifiche non configurate sul server (chiave VAPID assente). Contatta l'amministratore.</span>
            )}
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ flex: 1, paddingRight: '12px' }}>
                <span style={{ color: C.text, fontWeight: '500' }}>Notifiche in-app</span>
                <p style={{ fontSize: '0.75rem', color: C.textLight, margin: '2px 0 0' }}>
                  Ricevi aggiornamenti normativi e comunicazioni dall'amministratore direttamente sul dispositivo, anche a schermo spento.
                </p>
                {/* BUG-05/UX-01: info multi-dispositivo */}
                {pushSubscribed && pushDeviceCount > 1 && (
                  <p style={{ fontSize: '0.72rem', color: C.primary, marginTop: '4px' }}>
                    Attive su {pushDeviceCount} browser/dispositivi. Le notifiche si attivano separatamente per ogni browser.
                  </p>
                )}
                {pushPermission === 'denied' && (
                  <p style={{ fontSize: '0.72rem', color: C.danger, marginTop: '4px' }}>
                    Permesso bloccato. Riattiva dalle impostazioni del browser/sistema.
                  </p>
                )}
              </div>
              <button
                onClick={pushSubscribed ? pushUnsubscribe : pushSubscribe}
                disabled={pushLoading || pushPermission === 'denied'}
                style={{
                  padding: '8px 16px',
                  backgroundColor: pushSubscribed ? C.success : C.textLight,
                  color: '#fff', borderRadius: '20px',
                  fontWeight: 'bold', border: 'none',
                  cursor: pushLoading || pushPermission === 'denied' ? 'not-allowed' : 'pointer',
                  opacity: pushLoading ? 0.6 : 1, flexShrink: 0,
                }}
              >
                {pushLoading
                  ? '...'
                  : pushSubscribed
                  ? <><Icon name="check" size={14} /> Attive</>
                  : <><Icon name="bell" size={14} /> Attiva</>}
              </button>
            </div>
            {/* UX-02: disattiva su tutti i dispositivi */}
            {pushSubscribed && pushDeviceCount > 1 && (
              <button
                onClick={pushUnsubscribeAll}
                disabled={pushLoading}
                style={{
                  marginTop: '10px',
                  background: 'none',
                  border: 'none',
                  color: C.danger,
                  fontSize: '0.75rem',
                  cursor: pushLoading ? 'not-allowed' : 'pointer',
                  padding: 0,
                  textDecoration: 'underline',
                }}
              >
                Disattiva su tutti i dispositivi ({pushDeviceCount})
              </button>
            )}
          </div>
        )}
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
          <h4 style={{ ...PS.profileSysTitle, margin: 0 }}><span style={{display:'inline-flex',alignItems:'center',gap:'6px'}}><Icon name="shield-alert" size={16}/> Segnala un Problema</span></h4>
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
              {reportSending ? 'Registrazione...' : 'Invia e Apri Email'}
            </button>
          </form>
        )}
      </div>

      {/* Pannello Amministratore (Solo se admin) */}
      {profile?.ruolo === 'admin' && (
        <div style={{ ...PS.profileSysBox, borderLeft: `4px solid ${C.accent}` }}>
          <h4 style={PS.profileSysTitle}><span style={{display:"inline-flex",alignItems:"center",gap:"6px"}}><Icon name="settings" size={16}/> Pannello di Controllo Amministratore</span></h4>
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
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{
            fontSize: '1.1rem',
            fontWeight: '700',
            color: C.text,
            margin: '0 0 16px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{display:"inline-flex",alignItems:"center",gap:"6px"}}><Icon name="gamepad" size={16}/> Progressi e Gamification</span>
          </h3>
          <LevelProgress
            level={level}
            xp={xp}
          />
          <StreakCounter
            currentStreak={currentStreak}
            longestStreak={longestStreak}
          />
          <div style={{ marginTop: '16px' }}>
            <BadgeShowcase
              unlockedBadges={unlockedBadges || []}
              featuredBadge={featuredBadgeId}
              onSelect={setFeaturedBadge}
            />
          </div>
        </div>
      )}

      {/* Novità dell'app */}
      <div style={{ marginBottom: '24px', padding: '16px', backgroundColor: C.card, borderRadius: '12px', border: `1px solid ${C.border}` }}>
        <h4 style={{ fontSize: '0.9rem', color: C.primary, marginBottom: '14px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Icon name="rocket" size={16} /> Novità
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {APP_CHANGELOG.map((release) => (
            <div key={release.version}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: '700', color: C.white, backgroundColor: release.isNew ? C.accent : C.textLight, padding: '2px 8px', borderRadius: '20px' }}>
                  v{release.version}
                </span>
                {release.isNew && (
                  <span style={{ fontSize: '0.7rem', fontWeight: '700', color: C.accent, backgroundColor: `${C.accent}18`, padding: '2px 8px', borderRadius: '20px' }}>
                    NUOVO
                  </span>
                )}
                <span style={{ fontSize: '0.75rem', color: C.textLight }}>{release.date}</span>
              </div>
              <ul style={{ margin: 0, paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {release.items.map((item, i) => (
                  <li key={i} style={{ fontSize: '0.85rem', color: C.text, lineHeight: 1.5 }}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Informazioni di Sistema */}
      <div style={PS.profileSysBox}>
        <h4 style={PS.profileSysTitle}><span style={{display:"inline-flex",alignItems:"center",gap:"6px"}}><Icon name="package" size={16}/> Informazioni di Sistema</span></h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <SysRow label="Versione Database CdS:" value={DB_VERSION_CDS} valueStyle={{ color: C.primary }} />
          <SysRow label="Versione Prontuario:" value={DB_VERSION_PRONTUARIO} valueStyle={{ color: C.primary }} />
          <SysRow label="Operatori Iscritti:" value={userCount} valueStyle={{ color: C.accent }} />
          <SysRow label="Stato Connessione:" value={SYSTEM_STATUS} valueStyle={{ color: C.success }} />
        </div>
      </div>

      {/* Sezione Documenti Legali */}
      <div style={{ marginTop: '24px', padding: '16px', backgroundColor: C.card, borderRadius: '12px', border: `1px solid ${C.border}`, marginBottom: '16px' }}>
        <h4 style={{ fontSize: '0.85rem', color: C.textLight, marginBottom: '12px', fontWeight: '600' }}>
          <span style={{display:"inline-flex",alignItems:"center",gap:"6px"}}><Icon name="file-text" size={16}/> Documenti legali</span>
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button onClick={() => onNavigate('privacy')} style={{ textAlign: 'left', color: C.accent, fontSize: '0.9rem', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            Privacy Policy →
          </button>
          <button onClick={() => onNavigate('termini')} style={{ textAlign: 'left', color: C.accent, fontSize: '0.9rem', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            Termini di Servizio →
          </button>
        </div>
      </div>

      {/* Supporta */}
      <div style={PS.profileSupportBox}>
        <h4 style={{ color: C.primary, marginBottom: '8px' }}>Supporta PolisRoad</h4>
        <p style={{ fontSize: '0.85rem', color: C.textLight, marginBottom: '12px' }}>
          Questa app è sviluppata per supportare il lavoro delle forze dell'ordine. Se la trovi utile, puoi offrire un caffè allo sviluppatore.
        </p>
        <a href="https://www.paypal.me/polisroad" target="_blank" rel="noreferrer" style={PS.profileDonateBtn}>
          <span style={{display:"inline-flex",alignItems:"center",gap:"6px"}}><Icon name="zap" size={16}/> Dona con PayPal</span>
        </a>
      </div>

      {/* Zona Pericolosa */}
      <div style={{ marginTop: '24px', padding: '16px', borderRadius: '12px', border: `1px solid ${C.danger}` }}>
        <h4 style={{ color: C.danger, fontSize: '0.9rem', marginBottom: '8px', fontWeight: '700' }}>
          <span style={{display:"inline-flex",alignItems:"center",gap:"6px"}}><Icon name="triangle-alert" size={16}/> Zona pericolosa</span>
        </h4>
        <p style={{ fontSize: '0.8rem', color: C.textLight, marginBottom: '12px', lineHeight: 1.5 }}>
          L'eliminazione dell'account è irreversibile. Verranno cancellati in modo permanente il profilo, le statistiche, i badge, la cronologia XP, le note personali, i preferiti e le segnalazioni inviate.
        </p>
        <button
          onClick={() => { setDeleteModal(true); setDeleteConfirmText(''); }}
          style={{ backgroundColor: 'transparent', border: `1px solid ${C.danger}`, color: C.danger, padding: '10px 16px', borderRadius: '8px', fontWeight: '600', fontSize: '0.85rem', cursor: 'pointer' }}
        >
          Elimina il mio account
        </button>
      </div>

      {/* Modale conferma eliminazione account */}
      {deleteModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          backgroundColor: 'rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '24px',
        }}>
          <div style={{
            backgroundColor: 'var(--color-card, #fff)',
            borderRadius: '16px',
            padding: '24px',
            width: '100%',
            maxWidth: '400px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <Icon name="triangle-alert" size={22} style={{ color: C.danger }} />
              <h3 style={{ color: C.danger, fontSize: '1.1rem', fontWeight: '700', margin: 0 }}>Elimina account</h3>
            </div>
            <p style={{ fontSize: '0.85rem', color: C.text, lineHeight: 1.6, marginBottom: '16px' }}>
              Questa azione è <strong>irreversibile</strong>. Verranno eliminati definitivamente:
              profilo, statistiche, badge, cronologia XP, note, preferiti e segnalazioni.
            </p>
            <p style={{ fontSize: '0.85rem', color: C.textLight, marginBottom: '8px' }}>
              Digita <strong>ELIMINA</strong> per confermare:
            </p>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={e => setDeleteConfirmText(e.target.value)}
              placeholder="ELIMINA"
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: `1px solid ${deleteConfirmText === 'ELIMINA' ? C.danger : C.border || '#ccc'}`,
                fontSize: '0.95rem',
                marginBottom: '20px',
                boxSizing: 'border-box',
                outline: 'none',
                backgroundColor: 'var(--color-background, #f5f7fa)',
                color: C.text,
              }}
              autoCapitalize="characters"
            />
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => { setDeleteModal(false); setDeleteConfirmText(''); }}
                disabled={deleteLoading}
                style={{
                  flex: 1, padding: '10px', borderRadius: '8px',
                  border: `1px solid ${C.textLight}`, backgroundColor: 'transparent',
                  color: C.text, fontWeight: '600', cursor: 'pointer',
                }}
              >
                Annulla
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== 'ELIMINA' || deleteLoading}
                style={{
                  flex: 1, padding: '10px', borderRadius: '8px',
                  border: 'none',
                  backgroundColor: deleteConfirmText === 'ELIMINA' && !deleteLoading ? C.danger : '#ccc',
                  color: '#fff', fontWeight: '700', cursor: deleteConfirmText === 'ELIMINA' && !deleteLoading ? 'pointer' : 'not-allowed',
                }}
              >
                {deleteLoading ? 'Eliminazione...' : 'Elimina definitivamente'}
              </button>
            </div>
          </div>
        </div>
      )}
    </PageWrapper>
  );
};
