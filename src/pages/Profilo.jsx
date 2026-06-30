import React, { useState, useEffect } from 'react';
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

/** Toggle switch */
const Toggle = ({ active, onToggle }) => (
  <div onClick={onToggle} style={PS.profileToggleTrack(active)}>
    <div style={PS.profileToggleDot(active)} />
  </div>
);

/** Riga item iOS-style */
const ProfileItem = ({
  iconName, iconBg, iconColor,
  label, sub,
  right, onPress, danger = false, isLast = false,
}) => (
  <div
    onClick={onPress}
    style={isLast ? PS.profileItemLast : PS.profileItem}
  >
    <div style={{ ...PS.profileItemIcon, backgroundColor: iconBg || C.surfaceContainer }}>
      <Icon name={iconName} size={16} color={iconColor || (danger ? C.danger : C.textLight)} strokeWidth={1.75} />
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ ...PS.profileItemLabel, color: danger ? C.danger : C.text }}>{label}</div>
      {sub && <div style={PS.profileItemSub}>{sub}</div>}
    </div>
    <div style={PS.profileItemRight}>
      {right}
      {onPress && !right && (
        <Icon name="chevron-right" size={16} color={C.textLight} strokeWidth={1.5} style={{ opacity: 0.4 }} />
      )}
    </div>
  </div>
);

/** Gruppo di sezioni con label sopra */
const Group = ({ label, children }) => (
  <div>
    <div style={PS.profileGroupLabel}>{label}</div>
    <div style={PS.profileSectionCard}>{children}</div>
  </div>
);

/** Pannello espandibile (per changelog, modifica profilo, ecc.) */
const Expandable = ({ iconName, iconBg, iconColor, label, sub, children }) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div onClick={() => setOpen(v => !v)} style={PS.profileItem}>
        <div style={{ ...PS.profileItemIcon, backgroundColor: iconBg || C.surfaceContainer }}>
          <Icon name={iconName} size={16} color={iconColor || C.textLight} strokeWidth={1.75} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={PS.profileItemLabel}>{label}</div>
          {sub && <div style={PS.profileItemSub}>{sub}</div>}
        </div>
        <Icon
          name="chevron-right"
          size={16}
          color={C.textLight}
          strokeWidth={1.5}
          style={{ opacity: 0.4, transform: open ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }}
        />
      </div>
      {open && (
        <div style={{
          padding: '14px',
          borderTop: `0.5px solid ${C.border}`,
          backgroundColor: C.surfaceContainer,
        }}>
          {children}
        </div>
      )}
    </>
  );
};

// ─── Pagina Profilo ───────────────────────────────────────────────────────────

export const Profilo = ({ onNavigate }) => {
  const { profile, updateProfile, signOut, userCount } = useAuth();

  // ── Modifica profilo ──────────────────────────────────────────────────────
  const [editOpen, setEditOpen] = useState(false);
  const [formData, setFormData] = useState({
    grado: profile?.grado || '', nome: profile?.nome || '',
    cognome: profile?.cognome || '', forza: profile?.forza || '',
    email: profile?.email || '', telefono: profile?.telefono || '',
  });
  const [saveLoading, setSaveLoading] = useState(false);
  const { showToast } = useToast();

  const { isDarkMode, toggleTheme } = useTheme();

  const {
    isSupported: pushSupported, isSafariNotStandalone: pushSafariNotStandalone,
    isSubscribed: pushSubscribed, deviceCount: pushDeviceCount,
    permission: pushPermission, loading: pushLoading,
    subscribe: pushSubscribe, unsubscribe: pushUnsubscribe, unsubscribeAll: pushUnsubscribeAll,
  } = usePushNotifications();

  const { isInstallable, isInstalled, promptInstall } = useInstallPrompt();

  const [analyticsEnabled, setAnalyticsEnabled] = useState(() => !posthog.has_opted_out_capturing());
  const toggleAnalytics = () => {
    if (analyticsEnabled) { posthog.opt_out_capturing(); setAnalyticsEnabled(false); }
    else { posthog.opt_in_capturing(); setAnalyticsEnabled(true); }
  };

  // ── Statistiche utilizzo ──────────────────────────────────────────────────
  const [stats, setStats] = useState({ preferiti: 0, note: 0, segnalazioni: 0 });
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase || !profile?.id) return;
    const uid = profile.id;
    Promise.all([
      supabase.from('preferiti').select('id', { count: 'exact', head: true }).eq('user_id', uid),
      supabase.from('note').select('id', { count: 'exact', head: true }).eq('user_id', uid),
      supabase.from('segnalazioni').select('id', { count: 'exact', head: true }).eq('email', profile.email || ''),
    ]).then(([pref, note, segn]) => {
      setStats({
        preferiti:    pref.count  ?? 0,
        note:         note.count  ?? 0,
        segnalazioni: segn.count  ?? 0,
      });
    }).catch(() => {});
  }, [profile?.id, profile?.email]);

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
    const err =
      validators.required(formData.nome, 'Nome') ||
      validators.required(formData.cognome, 'Cognome') ||
      validators.required(formData.grado, 'Grado') ||
      validators.required(formData.forza, 'Forza di Polizia') ||
      (formData.email ? validators.email(formData.email.trim()) : null) ||
      validators.maxLength(formData.nome, 80, 'Nome') ||
      validators.maxLength(formData.cognome, 80, 'Cognome') ||
      validators.maxLength(formData.grado, 80, 'Grado') ||
      validators.maxLength(formData.forza, 120, 'Forza') ||
      validators.maxLength(formData.telefono || '', 30, 'Telefono');
    if (err) { showToast(err, 'error'); return; }
    setSaveLoading(true);
    const { error } = await updateProfile({
      grado: sanitizers.text(formData.grado), nome: sanitizers.text(formData.nome),
      cognome: sanitizers.text(formData.cognome), forza: sanitizers.text(formData.forza),
      email: formData.email.trim().toLowerCase(),
      telefono: sanitizers.text(formData.telefono || ''),
    });
    if (error) showToast('Errore: ' + error.message, 'error');
    else { showToast('Profilo aggiornato!', 'success'); setEditOpen(false); }
    setSaveLoading(false);
  };

  const handleSendReport = async (e) => {
    e.preventDefault();
    const err = validators.required(reportDetails, 'Dettagli') || validators.maxLength(reportDetails, 1000, 'Dettagli');
    if (err) { showToast(err, 'error'); return; }
    setReportSending(true);
    const data = {
      tipo: sanitizers.text(reportType),
      dettagli: sanitizers.text(reportDetails),
      email: profile?.email ? sanitizers.text(profile.email) : 'Nessuna',
      operatore: sanitizers.text(`${profile?.grado || ''} ${profile?.nome || ''} ${profile?.cognome || ''}`).trim() || 'Operatore',
      created_at: new Date().toISOString(),
      risolto: false,
    };
    try {
      if (isSupabaseConfigured && supabase) await supabase.from('segnalazioni').insert([data]);
    } catch (err) { logger.warn('Supabase insert report failed:', err); }
    setReportSending(false);
    showToast('Segnalazione inviata!', 'success');
    setReportDetails('');
    setTimeout(() => {
      const subject = encodeURIComponent(`[PolisRoad] ${data.tipo}`);
      const body = encodeURIComponent(`--- SEGNALAZIONE POLISROAD ---\nTipo: ${data.tipo}\nData: ${new Date().toLocaleString()}\nVersione: ${APP_VERSION}\nOperatore: ${data.operatore}\nEmail: ${data.email}\n\n${data.dettagli}`);
      window.location.href = `mailto:admin@polisroad.it?subject=${subject}&body=${body}`;
    }, 800);
  };

  const handleExportData = async () => {
    try {
      const uid = profile?.id;
      if (!uid) return;
      showToast('Esportazione in corso...', 'info');
      const [profileRes, noteRes, preferitiRes, pushRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', uid),
        supabase.from('note').select('*').eq('user_id', uid),
        supabase.from('preferiti').select('*').eq('user_id', uid),
        supabase.from('push_subscriptions').select('endpoint, updated_at').eq('user_id', uid),
      ]);
      const blob = new Blob([JSON.stringify({
        esportato_il: new Date().toISOString(),
        profile: profileRes.data || [],
        note: noteRes.data || [],
        preferiti: preferitiRes.data || [],
        push_subscriptions: pushRes.data || [],
      }, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `polisroad_export_${new Date().toISOString().slice(0,10)}.json`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('Dati esportati!', 'success');
    } catch (err) { showToast("Errore: " + err.message, 'error'); }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'ELIMINA') return;
    setDeleteLoading(true);
    try {
      const { error: fnError } = await supabase.functions.invoke('delete-user', { body: { uid: profile.id } });
      if (fnError) throw new Error(fnError.message);
      for (const table of ['note', 'preferiti', 'push_subscriptions']) {
        await supabase.from(table).delete().eq('user_id', profile.id).catch(() => {});
      }
      await supabase.from('profiles').delete().eq('id', profile.id).catch(() => {});
      await signOut();
      showToast('Account eliminato.', 'success');
    } catch (err) {
      logger.error('handleDeleteAccount error:', err);
      showToast('Errore: ' + err.message, 'error');
      setDeleteLoading(false); setDeleteModal(false); setDeleteConfirmText('');
    }
  };

  const initials = `${(profile?.nome || '')[0] || ''}${(profile?.cognome || '')[0] || ''}`.toUpperCase() || '?';

  return (
    <PageWrapper
      title="Profilo"
      subtitle="Account e impostazioni"
      onNavigate={onNavigate}
      headerRightAction={
        <button onClick={signOut} style={PS.profileExitBtn}>
          <Icon name="log-out" size={14} color="#fff" strokeWidth={2} />
          Esci
        </button>
      }
    >

      {/* ── HEADER IDENTITÀ ── */}
      <div style={{
        ...PS.profileHeaderBg,
        marginLeft: '-16px', marginRight: '-16px', marginTop: '-16px',
        marginBottom: '20px',
      }}>
        <div style={PS.profileAvatar}>
          <span style={{ fontSize: '1.25rem', fontWeight: '700', color: '#fff' }}>{initials}</span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={PS.profileHeaderName}>{profile?.nome} {profile?.cognome}</div>
          <div style={PS.profileHeaderGrado}>{profile?.grado || 'Operatore'} · {profile?.forza || '—'}</div>
          <div style={PS.profileHeaderPills}>
            <span style={PS.profileHeaderPill}>✓ Approvato</span>
            {profile?.email && <span style={PS.profileHeaderPill}>{profile.email}</span>}
          </div>
        </div>
      </div>

      {/* ── STATISTICHE ── */}
      <div style={PS.profileGroupLabel}>Attività</div>
      <div style={PS.profileStatsGrid}>
        <div style={PS.profileStatCard}>
          <div style={{ ...PS.profileStatLabel }}>Preferiti</div>
          <div style={PS.profileStatValue}>{stats.preferiti}</div>
          <div style={PS.profileStatSub}>Voci salvate</div>
        </div>
        <div style={PS.profileStatCard}>
          <div style={PS.profileStatLabel}>Note</div>
          <div style={PS.profileStatValue}>{stats.note}</div>
          <div style={PS.profileStatSub}>Annotazioni</div>
        </div>
        <div style={{ ...PS.profileStatCard, ...{ gridColumn: '1 / -1' } }}>
          <div style={PS.profileStatLabel}>Segnalazioni inviate</div>
          <div style={{ ...PS.profileStatValue, fontSize: '1.2rem' }}>{stats.segnalazioni}</div>
          <div style={PS.profileStatSub}>Totale dalla registrazione</div>
        </div>
      </div>

      {/* ── ACCOUNT ── */}
      <Group label="Account">
        <Expandable
          iconName="pen-line" iconBg="#dbeafe" iconColor="#1e40af"
          label="Modifica profilo"
          sub="Nome, grado, ente, contatti"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <TextInput label="Grado" value={formData.grado} onChange={e => setFormData({ ...formData, grado: e.target.value })} />
            <TextInput label="Nome" value={formData.nome} onChange={e => setFormData({ ...formData, nome: e.target.value })} />
            <TextInput label="Cognome" value={formData.cognome} onChange={e => setFormData({ ...formData, cognome: e.target.value })} />
            <TextInput label="Forza di Polizia" value={formData.forza} onChange={e => setFormData({ ...formData, forza: e.target.value })} />
            <TextInput label="Email" type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
            <TextInput label="Telefono" type="tel" value={formData.telefono} onChange={e => setFormData({ ...formData, telefono: e.target.value })} />
            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button onClick={() => setEditOpen(false)} style={{ ...S.btnSecondary, flex: 1 }}>Annulla</button>
              <button onClick={handleSave} disabled={saveLoading} style={{ ...S.btnPrimary, flex: 2, border: 'none' }}>
                {saveLoading ? 'Salvataggio...' : 'Salva modifiche'}
              </button>
            </div>
          </div>
        </Expandable>
        <ProfileItem
          iconName="file-down" iconBg="#dcfce7" iconColor="#15803d"
          label="Esporta dati (GDPR)"
          sub="Scarica tutti i tuoi dati in JSON"
          onPress={handleExportData}
          isLast
        />
      </Group>

      {/* ── PREFERENZE ── */}
      <Group label="Preferenze">
        <ProfileItem
          iconName={isDarkMode ? 'moon' : 'sun'} iconBg="#f3e8ff" iconColor="#6b21a8"
          label="Dark mode"
          sub={isDarkMode ? 'Modalità scura attiva' : 'Modalità chiara attiva'}
          right={<Toggle active={isDarkMode} onToggle={toggleTheme} />}
        />
        <ProfileItem
          iconName="bar-chart" iconBg="#fef3c7" iconColor="#92400e"
          label="Analytics"
          sub="Dati anonimi di utilizzo (PostHog)"
          right={<Toggle active={analyticsEnabled} onToggle={toggleAnalytics} />}
          isLast
        />
      </Group>

      {/* ── NOTIFICHE E APP ── */}
      <Group label="Notifiche e app">
        {pushSupported ? (
          <ProfileItem
            iconName="bell" iconBg="#e0f2fe" iconColor="#075985"
            label="Notifiche push"
            sub={
              pushPermission === 'denied' ? 'Permesso bloccato — sblocca nelle impostazioni browser' :
              pushSubscribed ? `Attive su ${pushDeviceCount} dispositiv${pushDeviceCount === 1 ? 'o' : 'i'}` :
              'Ricevi aggiornamenti dall\'amministratore'
            }
            right={
              pushPermission !== 'denied' ? (
                <button
                  onClick={pushSubscribed ? pushUnsubscribe : pushSubscribe}
                  disabled={pushLoading}
                  style={{
                    padding: '5px 12px', borderRadius: '999px',
                    backgroundColor: pushSubscribed ? '#dcfce7' : C.surfaceContainer,
                    color: pushSubscribed ? '#15803d' : C.textLight,
                    fontWeight: '700', fontSize: '0.75rem', border: 'none', cursor: 'pointer',
                  }}
                >
                  {pushLoading ? '...' : pushSubscribed ? 'Attive' : 'Attiva'}
                </button>
              ) : null
            }
          />
        ) : (
          <ProfileItem
            iconName="bell-off" iconBg={C.surfaceContainer} iconColor={C.textLight}
            label="Notifiche push"
            sub={pushSafariNotStandalone
              ? 'Installa l\'app per ricevere notifiche su iOS'
              : 'Non supportate da questo browser'}
          />
        )}
        {pushSubscribed && pushDeviceCount > 1 && (
          <ProfileItem
            iconName="wifi-off" iconBg="#fee2e2" iconColor="#dc2626"
            label="Disattiva su tutti i dispositivi"
            sub={`${pushDeviceCount} dispositivi registrati`}
            onPress={pushUnsubscribe}
          />
        )}
        {!isInstalled && isInstallable && (
          <ProfileItem
            iconName="smartphone" iconBg="#ccfbf1" iconColor="#0f766e"
            label="Installa l'app"
            sub="Aggiungi alla schermata Home per accesso rapido"
            onPress={promptInstall}
            isLast={!(!isInstalled && isInstallable)}
          />
        )}
        {isInstalled && (
          <ProfileItem
            iconName="check-circle" iconBg="#dcfce7" iconColor="#15803d"
            label="App installata"
            sub="PolisRoad è già installata su questo dispositivo"
            isLast
          />
        )}
      </Group>

      {/* ── INFORMAZIONI ── */}
      <Group label="Informazioni">
        <Expandable
          iconName="rocket" iconBg="#f0fdf4" iconColor="#15803d"
          label={`Novità v${APP_VERSION}`}
          sub="Cosa c'è di nuovo in questa versione"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {APP_CHANGELOG.slice(0, 3).map(release => (
              <div key={release.version}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{
                    fontSize: '0.72rem', fontWeight: '700', color: '#fff',
                    backgroundColor: release.isNew ? C.accent : C.textLight,
                    padding: '2px 8px', borderRadius: '999px',
                  }}>v{release.version}</span>
                  {release.isNew && <span style={{ fontSize: '0.68rem', fontWeight: '700', color: C.accent, backgroundColor: C.accentLight, padding: '2px 7px', borderRadius: '999px' }}>NUOVO</span>}
                  <span style={{ fontSize: '0.72rem', color: C.textLight }}>{release.date}</span>
                </div>
                <ul style={{ margin: 0, paddingLeft: '14px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  {release.items.map((item, i) => (
                    <li key={i} style={{ fontSize: '0.82rem', color: C.text, lineHeight: '1.5' }}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Expandable>
        <Expandable
          iconName="package" iconBg="#f1f5f9" iconColor="#475569"
          label="Info di sistema"
          sub={`PolisRoad v${APP_VERSION}`}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: C.textLight }}>Versione app</span><span style={{ fontWeight: '700', color: C.primary }}>v{APP_VERSION}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: C.textLight }}>Database CdS</span><span style={{ fontWeight: '600' }}>{DB_VERSION_CDS}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: C.textLight }}>Prontuario</span><span style={{ fontWeight: '600' }}>{DB_VERSION_PRONTUARIO}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: C.textLight }}>Operatori iscritti</span><span style={{ fontWeight: '700', color: C.accent }}>{userCount}</span></div>
          </div>
        </Expandable>
        <ProfileItem
          iconName="file-text" iconBg="#f8fafc" iconColor="#64748b"
          label="Privacy Policy"
          onPress={() => onNavigate('privacy')}
        />
        <ProfileItem
          iconName="scroll" iconBg="#f8fafc" iconColor="#64748b"
          label="Termini di Servizio"
          onPress={() => onNavigate('termini')}
          isLast
        />
      </Group>

      {/* ── PANNELLO ADMIN ── */}
      {profile?.ruolo === 'admin' && (
        <Group label="Amministrazione">
          <ProfileItem
            iconName="settings" iconBg="#dbeafe" iconColor="#1e40af"
            label="Pannello Amministratore"
            sub="Gestisci utenti, contenuti e notifiche"
            onPress={() => onNavigate('admin_dashboard')}
            isLast
          />
        </Group>
      )}

      {/* ── SUPPORTO ── */}
      <Group label="Supporto">
        <Expandable
          iconName="message-square" iconBg="#fee2e2" iconColor="#dc2626"
          label="Segnala un problema"
          sub="Bug, errori nei dati o suggerimenti"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: '700', color: C.textLight, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Tipo di problema</label>
              <select value={reportType} onChange={e => setReportType(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: C.radiusSm, border: `1px solid ${C.border}`, backgroundColor: C.card, color: C.text, fontSize: '0.88rem', boxSizing: 'border-box' }}>
                <option>Problema Tecnico</option>
                <option>Errore nel Prontuario</option>
                <option>Errore nella Normativa</option>
                <option>Suggerimento / Richiesta</option>
                <option>Altro</option>
              </select>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label style={{ fontSize: '0.72rem', fontWeight: '700', color: C.textLight, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Dettagli</label>
                <span style={{ fontSize: '0.7rem', color: reportDetails.length > 900 ? C.danger : C.textLight }}>{reportDetails.length}/1000</span>
              </div>
              <textarea value={reportDetails} onChange={e => setReportDetails(e.target.value.slice(0, 1000))}
                placeholder="Descrivi il problema in dettaglio..." rows={4}
                style={{ width: '100%', padding: '10px 12px', borderRadius: C.radiusSm, border: `1px solid ${C.border}`, backgroundColor: C.card, color: C.text, fontSize: '0.88rem', fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box', lineHeight: '1.5' }} />
            </div>
            <button onClick={handleSendReport} disabled={reportSending || !reportDetails.trim()}
              style={{ ...S.btnPrimary, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: !reportDetails.trim() ? 0.5 : 1 }}>
              <Icon name="message-square" size={15} color="#fff" />
              {reportSending ? 'Invio...' : 'Invia segnalazione'}
            </button>
          </div>
        </Expandable>
        <ProfileItem
          iconName="heart" iconBg="#fce7f3" iconColor="#be185d"
          label="Supporta PolisRoad"
          sub="Offri un caffè allo sviluppatore via PayPal"
          onPress={() => window.open('https://www.paypal.me/polisroad', '_blank', 'noopener')}
          isLast
        />
      </Group>

      {/* ── HELP DESK ── */}
      <div style={{ ...PS.profileGroupLabel }}>Hai bisogno di aiuto?</div>
      <div style={{
        backgroundColor: C.card, borderRadius: C.radiusMd,
        border: `1px solid ${C.border}`, overflow: 'hidden',
        boxShadow: 'var(--shadow-sm)',
      }}>
        <div style={{ padding: '16px 14px', display: 'flex', alignItems: 'flex-start', gap: '12px', borderBottom: `0.5px solid ${C.border}` }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon name="life-buoy" size={18} color="#1e40af" strokeWidth={1.75} />
          </div>
          <div>
            <div style={{ fontWeight: '700', fontSize: '0.92rem', color: C.text, marginBottom: '4px' }}>Centro assistenza</div>
            <div style={{ fontSize: '0.8rem', color: C.textLight, lineHeight: '1.5' }}>
              Consulta la documentazione, segnala problemi o contatta l'amministratore di sistema.
            </div>
          </div>
        </div>
        <div style={{ display: 'flex' }}>
          <a
            href="mailto:admin@polisroad.it?subject=Supporto%20PolisRoad"
            style={{
              flex: 1, padding: '13px 12px', display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: '6px',
              borderRight: `0.5px solid ${C.border}`,
              color: C.accent, fontSize: '0.85rem', fontWeight: '700',
              textDecoration: 'none',
            }}
          >
            <Icon name="mail" size={15} color={C.accent} strokeWidth={1.75} />
            Email admin
          </a>
          <button
            onClick={() => onNavigate('news')}
            style={{
              flex: 1, padding: '13px 12px', display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: '6px',
              color: C.accent, fontSize: '0.85rem', fontWeight: '700',
            }}
          >
            <Icon name="newspaper" size={15} color={C.accent} strokeWidth={1.75} />
            News & aggiornamenti
          </button>
        </div>
      </div>

      {/* ── ZONA PERICOLOSA ── (distanza deliberata dal blocco sopra) */}
      <div style={{ marginTop: '32px' }}>
        <div style={{ ...PS.profileGroupLabel, color: C.danger }}>Zona pericolosa</div>
        <div style={PS.profileDangerSection}>
          <div onClick={() => { setDeleteModal(true); setDeleteConfirmText(''); }}
            style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '13px 14px', cursor: 'pointer' }}
          >
            <div style={{ width: '30px', height: '30px', borderRadius: '9px', backgroundColor: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon name="trash-2" size={16} color={C.danger} strokeWidth={1.75} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.92rem', color: C.danger, fontWeight: '600' }}>Elimina account</div>
              <div style={{ fontSize: '0.75rem', color: '#fca5a5', marginTop: '2px' }}>Azione irreversibile — tutti i dati verranno rimossi</div>
            </div>
            <Icon name="chevron-right" size={16} color={C.danger} strokeWidth={1.5} style={{ opacity: 0.5 }} />
          </div>
        </div>
      </div>

      {/* ── MODALE ELIMINAZIONE ── */}
      {deleteModal && (
        <div
          onClick={() => { setDeleteModal(false); setDeleteConfirmText(''); }}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            backgroundColor: 'rgba(0,0,0,0.6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px',
          }}
          role="dialog" aria-modal="true" aria-labelledby="delete-title"
        >
          <div onClick={e => e.stopPropagation()}
            style={{
              backgroundColor: C.card, borderRadius: '20px', padding: '24px',
              width: '100%', maxWidth: '380px',
              boxShadow: 'var(--shadow-lg)', border: `1px solid ${C.border}`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <div style={{ width: '36px', height: '36px', backgroundColor: '#fee2e2', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon name="triangle-alert" size={18} color={C.danger} strokeWidth={1.75} />
              </div>
              <h3 id="delete-title" style={{ color: C.danger, fontSize: '1.05rem', fontWeight: '700', margin: 0 }}>Elimina account</h3>
            </div>
            <p style={{ fontSize: '0.85rem', color: C.text, lineHeight: '1.6', marginBottom: '16px' }}>
              Questa azione è <strong>irreversibile</strong>. Verranno eliminati: profilo, note, preferiti e l'accesso all'app.
            </p>
            <p style={{ fontSize: '0.82rem', color: C.textLight, marginBottom: '8px' }}>Digita <strong>ELIMINA</strong> per confermare:</p>
            <input
              type="text" value={deleteConfirmText}
              onChange={e => setDeleteConfirmText(e.target.value)}
              placeholder="ELIMINA" autoCapitalize="characters"
              style={{
                width: '100%', padding: '10px 12px', borderRadius: C.radiusSm,
                border: `1.5px solid ${deleteConfirmText === 'ELIMINA' ? C.danger : C.border}`,
                fontSize: '0.95rem', marginBottom: '20px', boxSizing: 'border-box',
                backgroundColor: C.surfaceContainer, color: C.text, outline: 'none',
              }}
            />
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => { setDeleteModal(false); setDeleteConfirmText(''); }}
                disabled={deleteLoading}
                style={{ flex: 1, padding: '11px', borderRadius: C.radiusSm, border: `1px solid ${C.border}`, backgroundColor: 'transparent', color: C.text, fontWeight: '600', cursor: 'pointer' }}>
                Annulla
              </button>
              <button onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== 'ELIMINA' || deleteLoading}
                style={{
                  flex: 1, padding: '11px', borderRadius: C.radiusSm, border: 'none',
                  backgroundColor: deleteConfirmText === 'ELIMINA' && !deleteLoading ? C.danger : '#e5e7eb',
                  color: deleteConfirmText === 'ELIMINA' && !deleteLoading ? '#fff' : '#9ca3af',
                  fontWeight: '700', cursor: deleteConfirmText === 'ELIMINA' ? 'pointer' : 'not-allowed',
                }}>
                {deleteLoading ? 'Eliminazione...' : 'Elimina'}
              </button>
            </div>
          </div>
        </div>
      )}
    </PageWrapper>
  );
};
