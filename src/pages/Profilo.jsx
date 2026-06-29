import React, { useState } from 'react';
import { PageWrapper } from '../components/layout/PageWrapper';
import { TextInput } from '../components/ui/TextInput';
import { useToast } from '../components/ui/ToastManager';
import { C } from '../styles/theme';
import { Icon } from '../components/ui/Icon';
import { S } from '../styles/styles';
import { PS } from '../styles/pages';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { usePushNotifications } from '../hooks/usePushNotifications';
import { useInstallPrompt } from '../hooks/useInstallPrompt';
import { DB_VERSION_CDS, DB_VERSION_PRONTUARIO, APP_VERSION } from '../config/constants';
import { APP_CHANGELOG } from '../config/changelog';
import { sanitizers, validators } from '../utils/validation';
import { supabase, isSupabaseConfigured } from '../config/supabase';
import { logger } from '../utils/logger';
import posthog from 'posthog-js';

// ─── Componenti locali ────────────────────────────────────────────────────────

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

/** Sezione collassabile generica */
const Section = ({ title, icon, children, defaultOpen = false, accent }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{
      ...PS.profileSysBox,
      borderLeft: accent ? `3px solid ${accent}` : undefined,
    }}>
      <div
        onClick={() => setOpen(v => !v)}
        style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          cursor: 'pointer', userSelect: 'none',
        }}
      >
        <h4 style={{ ...PS.profileSysTitle, margin: 0, borderBottom: 'none', paddingBottom: 0 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <Icon name={icon} size={16} /> {title}
          </span>
        </h4>
        <span style={{
          fontSize: '0.8rem', color: C.textLight,
          transform: open ? 'rotate(90deg)' : 'none',
          transition: 'transform 0.2s', display: 'inline-block',
        }}>▶</span>
      </div>
      {open && (
        <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: `1px solid ${C.border}` }}>
          {children}
        </div>
      )}
    </div>
  );
};

// ─── Pagina Profilo ───────────────────────────────────────────────────────────

export const Profilo = ({ onNavigate }) => {
  const { profile, updateProfile, signOut, userCount } = useAuth();

  // ── Modifica profilo ──────────────────────────────────────────────────────
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

  // ── Segnalazioni ──────────────────────────────────────────────────────────
  const [reportType, setReportType] = useState('Problema Tecnico');
  const [reportDetails, setReportDetails] = useState('');
  const [reportSending, setReportSending] = useState(false);

  // ── Eliminazione account ──────────────────────────────────────────────────
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  // ── Handlers ──────────────────────────────────────────────────────────────

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
      risolto: false,
    };

    let saved = false;
    try {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.from('segnalazioni').insert([reportData]);
        if (!error) saved = true;
      }
    } catch (err) {
      logger.warn('Supabase insert report skipped/failed:', err);
    }

    if (!saved) {
      try {
        const local = localStorage.getItem('polisroad_local_segnalazioni');
        const list = local ? JSON.parse(local) : [];
        list.push({ ...reportData, id: `local_${Date.now()}` });
        localStorage.setItem('polisroad_local_segnalazioni', JSON.stringify(list));
      } catch (err) {
        logger.error('Local storage report backup failed:', err);
      }
    }

    setReportSending(false);
    showToast('Segnalazione registrata con successo!', 'success');
    setReportDetails('');

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

  const handleExportData = async () => {
    try {
      const uid = profile?.id;
      if (!uid) return;
      showToast('Esportazione dati in corso...', 'success');

      const [profileRes, noteRes, preferitiRes, pushRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', uid),
        supabase.from('note').select('*').eq('user_id', uid),
        supabase.from('preferiti').select('*').eq('user_id', uid),
        supabase.from('push_subscriptions').select('endpoint, updated_at').eq('user_id', uid),
      ]);

      const data = {
        esportato_il: new Date().toISOString(),
        profile: profileRes.data || [],
        note: noteRes.data || [],
        preferiti: preferitiRes.data || [],
        push_subscriptions: pushRes.data || [],
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
      showToast("Errore durante l'esportazione: " + err.message, 'error');
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'ELIMINA') return;
    setDeleteLoading(true);
    try {
      const uid = profile.id;

      // FIX race condition: prima chiama la Edge Function per eliminare auth.users.
      // Se questo fallisce, i dati rimangono intatti e l'utente riceve un errore sensato.
      // Il CASCADE su auth.users si occuperà di profiles e tabelle figlio.
      const { error: fnError } = await supabase.functions.invoke('delete-user', { body: { uid } });
      if (fnError) {
        throw new Error('Errore eliminazione account auth: ' + fnError.message);
      }

      // Cleanup esplicito delle tabelle figlio (fallback se CASCADE non configurato)
      const tables = ['note', 'preferiti', 'push_subscriptions'];
      for (const table of tables) {
        try {
          await supabase.from(table).delete().eq('user_id', uid);
        } catch { /* ignora errori singole tabelle */ }
      }
      try {
        if (profile?.email) {
          await supabase.from('segnalazioni').delete().eq('email', profile.email);
        }
        await supabase.from('profiles').delete().eq('id', uid);
      } catch { /* ignora: CASCADE potrebbe averle già rimosse */ }

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

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <PageWrapper
      title="Profilo Operatore"
      subtitle="Account e impostazioni"
      onNavigate={onNavigate}
      headerRightAction={<button onClick={signOut} style={PS.profileExitBtn}>Esci</button>}
    >

      {/* ── IDENTITÀ ── (sempre aperta) */}
      <div style={{ ...S.cardElevated, marginBottom: '16px', overflow: isEditing ? 'visible' : 'hidden' }}>
        <div style={PS.profileHeaderBg}>
          <div style={PS.profileAvatar}>
            <Icon name="user" size={32} />
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
              <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                <button onClick={() => setIsEditing(true)} style={{ ...S.btnOutline, flex: 1 }}>
                  <Icon name="settings" size={15}/> Modifica
                </button>
                <button onClick={handleExportData} style={{ ...S.btnOutline, flex: 1, borderColor: C.primary, color: C.primary }}>
                  <Icon name="download" size={15}/> Esporta (GDPR)
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── ASPETTO ── */}
      <Section title="Aspetto" icon="palette" defaultOpen={false}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <span style={{ color: C.text, fontWeight: '500' }}>Dark Mode</span>
          <button
            onClick={toggleTheme}
            style={{
              padding: '8px 16px', backgroundColor: isDarkMode ? C.success : C.textLight,
              color: '#fff', borderRadius: '20px', fontWeight: 'bold', border: 'none', cursor: 'pointer',
            }}
          >
            {isDarkMode ? <><Icon name="moon" size={14}/> Attivo</> : <><Icon name="sun" size={14}/> Disattivata</>}
          </button>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ flex: 1, paddingRight: '12px' }}>
            <span style={{ color: C.text, fontWeight: '500' }}>Analytics (PostHog)</span>
            <p style={{ fontSize: '0.75rem', color: C.textLight, margin: '2px 0 0' }}>
              Dati anonimi sull'utilizzo per migliorare il servizio.
            </p>
          </div>
          <button
            onClick={toggleAnalytics}
            style={{
              padding: '8px 16px',
              backgroundColor: analyticsEnabled ? C.success : C.textLight,
              color: '#fff', borderRadius: '20px', fontWeight: 'bold',
              border: 'none', cursor: 'pointer', flexShrink: 0,
            }}
          >
            {analyticsEnabled ? <><Icon name="check" size={14}/> Attivo</> : <><Icon name="x" size={14}/> Disattivato</>}
          </button>
        </div>
      </Section>

      {/* ── INSTALLAZIONE PWA ── */}
      {(!isInstalled && isInstallable) && (
        <Section title="Installa l'app" icon="download" defaultOpen={true}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ flex: 1, paddingRight: '12px' }}>
              <span style={{ color: C.text, fontWeight: '500' }}>Aggiungi alla schermata Home</span>
              <p style={{ fontSize: '0.75rem', color: C.textLight, margin: '2px 0 0' }}>
                Accedi a PolisRoad come app nativa, anche offline.
              </p>
            </div>
            <button
              onClick={promptInstall}
              style={{
                padding: '8px 16px', backgroundColor: C.accent,
                color: '#fff', borderRadius: '20px', fontWeight: 'bold',
                border: 'none', cursor: 'pointer', flexShrink: 0,
              }}
            >
              <Icon name="download" size={14} /> Installa
            </button>
          </div>
        </Section>
      )}
      {isInstalled && (
        <div style={{ ...PS.profileSysBox, borderLeft: `3px solid ${C.success}` }}>
          <span style={{ fontSize: '0.85rem', color: C.success, fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <Icon name="circle-check" size={15} /> App installata sul dispositivo
          </span>
        </div>
      )}

      {/* ── NOTIFICHE PUSH ── */}
      <Section title="Notifiche Push" icon="bell" defaultOpen={false}>
        {!pushSupported ? (
          <div style={{ color: C.textLight, fontSize: '0.8rem', lineHeight: '1.6' }}>
            {pushSafariNotStandalone ? (
              <span>
                Su Safari le notifiche push sono disponibili solo installando PolisRoad come app.{' '}
                Tocca <strong>Condividi → Aggiungi a schermata Home</strong>, poi riapri l'app installata.
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
                  Aggiornamenti normativi e comunicazioni dall'amministratore.
                </p>
                {pushSubscribed && pushDeviceCount > 1 && (
                  <p style={{ fontSize: '0.72rem', color: C.primary, marginTop: '4px' }}>
                    Attive su {pushDeviceCount} browser/dispositivi.
                  </p>
                )}
                {pushPermission === 'denied' && (
                  <p style={{ fontSize: '0.72rem', color: C.danger, marginTop: '4px' }}>
                    Permesso bloccato. Riattiva dalle impostazioni del browser.
                  </p>
                )}
              </div>
              <button
                onClick={pushSubscribed ? pushUnsubscribe : pushSubscribe}
                disabled={pushLoading || pushPermission === 'denied'}
                style={{
                  padding: '8px 16px',
                  backgroundColor: pushSubscribed ? C.success : C.textLight,
                  color: '#fff', borderRadius: '20px', fontWeight: 'bold',
                  border: 'none',
                  cursor: pushLoading || pushPermission === 'denied' ? 'not-allowed' : 'pointer',
                  opacity: pushLoading ? 0.6 : 1, flexShrink: 0,
                }}
              >
                {pushLoading ? '...' : pushSubscribed
                  ? <><Icon name="check" size={14} /> Attive</>
                  : <><Icon name="bell" size={14} /> Attiva</>}
              </button>
            </div>
            {pushSubscribed && pushDeviceCount > 1 && (
              <button
                onClick={pushUnsubscribeAll}
                disabled={pushLoading}
                style={{
                  marginTop: '10px', background: 'none', border: 'none',
                  color: C.danger, fontSize: '0.75rem',
                  cursor: pushLoading ? 'not-allowed' : 'pointer',
                  padding: 0, textDecoration: 'underline',
                }}
              >
                Disattiva su tutti i dispositivi ({pushDeviceCount})
              </button>
            )}
          </div>
        )}
      </Section>

      {/* ── NOVITÀ ── */}
      <Section title="Novità dell'app" icon="rocket" defaultOpen={false}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {APP_CHANGELOG.map((release) => (
            <div key={release.version}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{
                  fontSize: '0.8rem', fontWeight: '700', color: '#fff',
                  backgroundColor: release.isNew ? C.accent : C.textLight,
                  padding: '2px 8px', borderRadius: '20px',
                }}>
                  v{release.version}
                </span>
                {release.isNew && (
                  <span style={{
                    fontSize: '0.7rem', fontWeight: '700', color: C.accent,
                    backgroundColor: `${C.accent}18`, padding: '2px 8px', borderRadius: '20px',
                  }}>NUOVO</span>
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
      </Section>

      {/* ── INFORMAZIONI DI SISTEMA ── */}
      <Section title="Informazioni di Sistema" icon="package" defaultOpen={false}>
        <SysRow label="Versione Database CdS:" value={DB_VERSION_CDS} valueStyle={{ color: C.primary }} />
        <SysRow label="Versione Prontuario:" value={DB_VERSION_PRONTUARIO} valueStyle={{ color: C.primary }} />
        <SysRow label="Operatori Iscritti:" value={userCount} valueStyle={{ color: C.accent }} />
      </Section>

      {/* ── SEGNALA UN PROBLEMA ── */}
      <Section title="Segnala un Problema" icon="shield-alert" defaultOpen={false}>
        <p style={{ fontSize: '0.85rem', color: C.textLight, margin: '0 0 12px 0', lineHeight: '1.4' }}>
          Segnala bug, errori nei dati o malfunzionamenti. Verrà registrata sul database e si aprirà l'app e-mail per l'invio diretto.
        </p>
        <form onSubmit={handleSendReport} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 'bold', color: C.textLight, textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
              Tipo di problema
            </label>
            <select
              value={reportType}
              onChange={e => setReportType(e.target.value)}
              style={{
                width: '100%', padding: '10px 12px', borderRadius: '8px',
                border: `1px solid ${C.border}`, backgroundColor: C.card,
                color: C.text, fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box',
              }}
            >
              <option value="Problema Tecnico">Problema Tecnico (Bug)</option>
              <option value="Errore nel Prontuario">Errore nel Prontuario</option>
              <option value="Errore nella Normativa">Errore nella Normativa</option>
              <option value="Suggerimento">Suggerimento / Richiesta</option>
              <option value="Altro">Altro</option>
            </select>
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
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
              placeholder="Descrivi dettagliatamente il problema..."
              rows={4}
              style={{
                width: '100%', padding: '10px 12px', borderRadius: '8px',
                border: `1px solid ${C.border}`, backgroundColor: C.card,
                color: C.text, fontSize: '0.9rem', outline: 'none',
                fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box', lineHeight: '1.4',
              }}
            />
          </div>
          <button
            type="submit"
            disabled={reportSending || !reportDetails.trim()}
            style={{
              ...S.btnPrimary,
              display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px',
              opacity: !reportDetails.trim() ? 0.6 : 1,
              cursor: !reportDetails.trim() ? 'not-allowed' : 'pointer',
              border: 'none',
            }}
          >
            {reportSending ? 'Registrazione...' : 'Invia e Apri Email'}
          </button>
        </form>
      </Section>

      {/* ── PANNELLO ADMIN ── */}
      {profile?.ruolo === 'admin' && (
        <Section title="Pannello Amministratore" icon="settings" defaultOpen={false} accent={C.accent}>
          <p style={{ fontSize: '0.85rem', color: C.textLight, marginBottom: '12px', lineHeight: '1.4' }}>
            Account con privilegi di amministratore. Gestisci notizie, prontuario e segnalazioni.
          </p>
          <button
            onClick={() => onNavigate('admin_dashboard')}
            style={{ ...S.btnPrimary, backgroundColor: C.accent, color: '#fff', border: 'none', cursor: 'pointer' }}
          >
            Accedi ad Area Amministrativa
          </button>
        </Section>
      )}

      {/* ── DOCUMENTI LEGALI ── */}
      <Section title="Documenti Legali" icon="file-text" defaultOpen={false}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button onClick={() => onNavigate('privacy')} style={{ textAlign: 'left', color: C.accent, fontSize: '0.9rem', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            Privacy Policy →
          </button>
          <button onClick={() => onNavigate('termini')} style={{ textAlign: 'left', color: C.accent, fontSize: '0.9rem', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            Termini di Servizio →
          </button>
        </div>
      </Section>

      {/* ── SUPPORTA ── */}
      <div style={PS.profileSupportBox}>
        <h4 style={{ color: C.primary, marginBottom: '8px' }}>Supporta PolisRoad</h4>
        <p style={{ fontSize: '0.85rem', color: C.textLight, marginBottom: '12px' }}>
          Questa app è sviluppata per supportare il lavoro delle forze dell'ordine. Se la trovi utile, puoi offrire un caffè allo sviluppatore.
        </p>
        <a href="https://www.paypal.me/polisroad" target="_blank" rel="noreferrer" style={PS.profileDonateBtn}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <Icon name="zap" size={16}/> Dona con PayPal
          </span>
        </a>
      </div>

      {/* ── ZONA PERICOLOSA ── */}
      <Section title="Zona Pericolosa" icon="triangle-alert" defaultOpen={false} accent={C.danger}>
        <p style={{ fontSize: '0.8rem', color: C.textLight, marginBottom: '12px', lineHeight: 1.5 }}>
          L'eliminazione è irreversibile. Verranno cancellati: profilo, note, preferiti, segnalazioni e l'accesso all'app.
        </p>
        <button
          onClick={() => { setDeleteModal(true); setDeleteConfirmText(''); }}
          style={{
            backgroundColor: 'transparent', border: `1px solid ${C.danger}`,
            color: C.danger, padding: '10px 16px', borderRadius: '8px',
            fontWeight: '600', fontSize: '0.85rem', cursor: 'pointer',
          }}
        >
          Elimina il mio account
        </button>
      </Section>

      {/* ── MODALE ELIMINAZIONE ACCOUNT ── */}
      {deleteModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          backgroundColor: 'rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '24px',
        }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-dialog-title"
        >
          <div style={{
            backgroundColor: 'var(--color-card, #fff)',
            borderRadius: '16px', padding: '24px', width: '100%',
            maxWidth: '400px', boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <Icon name="triangle-alert" size={22} style={{ color: C.danger }} />
              <h3 id="delete-dialog-title" style={{ color: C.danger, fontSize: '1.1rem', fontWeight: '700', margin: 0 }}>
                Elimina account
              </h3>
            </div>
            <p style={{ fontSize: '0.85rem', color: C.text, lineHeight: 1.6, marginBottom: '16px' }}>
              Questa azione è <strong>irreversibile</strong>. Verranno eliminati definitivamente:
              profilo, note, preferiti e l'accesso all'applicazione.
            </p>
            <p style={{ fontSize: '0.85rem', color: C.textLight, marginBottom: '8px' }}>
              Digita <strong>ELIMINA</strong> per confermare:
            </p>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={e => setDeleteConfirmText(e.target.value)}
              placeholder="ELIMINA"
              autoCapitalize="characters"
              style={{
                width: '100%', padding: '10px 12px', borderRadius: '8px',
                border: `1px solid ${deleteConfirmText === 'ELIMINA' ? C.danger : C.border || '#ccc'}`,
                fontSize: '0.95rem', marginBottom: '20px', boxSizing: 'border-box',
                outline: 'none', backgroundColor: 'var(--color-background, #f5f7fa)', color: C.text,
              }}
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
                  flex: 1, padding: '10px', borderRadius: '8px', border: 'none',
                  backgroundColor: deleteConfirmText === 'ELIMINA' && !deleteLoading ? C.danger : '#ccc',
                  color: '#fff', fontWeight: '700',
                  cursor: deleteConfirmText === 'ELIMINA' && !deleteLoading ? 'pointer' : 'not-allowed',
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
