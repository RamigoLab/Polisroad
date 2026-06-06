import React, { useState, useEffect } from 'react';
import { PageWrapper } from '../components/layout/PageWrapper';
import { TextInput } from '../components/ui/TextInput';
import { useToast } from '../components/ui/ToastManager';
import { C } from '../styles/theme';
import { S } from '../styles/styles';
import { PS } from '../styles/pages';
import { useGamificationContext } from '../context/GamificationContext';
import { LevelProgress } from '../components/gamification/LevelProgress';
import { StreakCounter } from '../components/gamification/StreakCounter';
import { BadgeShowcase } from '../components/gamification/BadgeShowcase';

import { BADGES } from '../config/badges';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { DB_VERSION_CDS, DB_VERSION_PRONTUARIO, SYSTEM_STATUS, APP_VERSION } from '../config/constants';
import { sanitizers, validators } from '../utils/validation';
import { supabase } from '../config/supabase';

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
      showToast('Il contatore contestazioni e gia a zero.', 'success');
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

  const handleDeleteAccount = async () => {
    const confirm1 = window.confirm('Sei sicuro di voler eliminare il tuo account? Questa azione è irreversibile.');
    if (!confirm1) return;
    const confirm2 = window.confirm('Ultima conferma: tutti i tuoi dati verranno eliminati.');
    if (!confirm2) return;

    try {
      const uid = profile.id;
      // Cancella dati dalle tabelle (la RLS garantisce che puoi cancellare solo i tuoi)
      await supabase.from('xp_history').delete().eq('user_id', uid);
      await supabase.from('gamification').delete().eq('user_id', uid);
      await supabase.from('profiles').delete().eq('id', uid);
      // Logout — l'utente auth rimane ma senza dati (soluzione intermedia)
      await signOut();
      showToast('Account cancellato con successo.');
    } catch (err) {
      showToast('Errore durante la cancellazione. Contatta il supporto.', 'error');
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
            👮
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
              <DataRow label="Grado / Qualifica" value={profile?.grado} icon="🎖️" />
              <DataRow label="Nome" value={profile?.nome} icon="👤" />
              <DataRow label="Cognome" value={profile?.cognome} icon="🆔" />
              <DataRow label="Corpo / Forza" value={profile?.forza} icon="🏢" />
              <DataRow label="Email di Servizio" value={profile?.email} icon="📧" />
              <DataRow label="Contatto Telefonico" value={profile?.telefono} icon="📱" />
              <div style={{ margin: '16px 0', padding: '16px', backgroundColor: C.accentLight, borderRadius: '12px' }}>
                <DataRow label="Contestazioni Effettuate" value={stats?.total_contestazioni || 0} icon="🚨" />
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
            🎮 Progressi e Gamification
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

      {/* Sezione Documenti Legali */}
      <div style={{ marginTop: '24px', padding: '16px', backgroundColor: C.card, borderRadius: '12px', border: `1px solid ${C.border}`, marginBottom: '16px' }}>
        <h4 style={{ fontSize: '0.85rem', color: C.textLight, marginBottom: '12px', fontWeight: '600' }}>
          📄 Documenti legali
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
        <a href="https://www.paypal.me" target="_blank" rel="noreferrer" style={PS.profileDonateBtn}>
          ☕ Dona con PayPal
        </a>
      </div>

      {/* Zona Pericolosa */}
      <div style={{ marginTop: '24px', padding: '16px', borderRadius: '12px', border: `1px solid ${C.danger}` }}>
        <h4 style={{ color: C.danger, fontSize: '0.9rem', marginBottom: '8px', fontWeight: '700' }}>
          ⚠️ Zona pericolosa
        </h4>
        <p style={{ fontSize: '0.8rem', color: C.textLight, marginBottom: '12px', lineHeight: 1.5 }}>
          L'eliminazione dell'account è irreversibile. Verranno cancellati profilo, statistiche, badge e cronologia XP.
        </p>
        <button
          onClick={handleDeleteAccount}
          style={{ backgroundColor: 'transparent', border: `1px solid ${C.danger}`, color: C.danger, padding: '10px 16px', borderRadius: '8px', fontWeight: '600', fontSize: '0.85rem', cursor: 'pointer' }}
        >
          Elimina il mio account
        </button>
      </div>
    </PageWrapper>
  );
};
