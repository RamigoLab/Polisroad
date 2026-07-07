import React from 'react';
import { Icon } from './ui/Icon';

const PendingApprovalScreen = ({
  email, profileError, profileLoading, refreshProfile, signOut,
}) => {
  if (profileLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ textAlign: 'center', color: '#fff' }}>
          <div style={{ fontSize: '2rem', marginBottom: '16px', animation: 'spin 1s linear infinite', display: 'inline-block' }}>⏳</div>
          <p style={{ opacity: 0.8, fontSize: '0.95rem' }}>Verifica profilo...</p>
        </div>
      </div>
    );
  }

  if (profileError) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px',
      }}>
        <div style={{
          backgroundColor: 'rgba(255,255,255,0.12)',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: '20px', padding: '32px 24px',
          textAlign: 'center', maxWidth: '340px', width: '100%',
        }}>
          <div style={{ width: '56px', height: '56px', backgroundColor: '#fee2e2', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <Icon name="triangle-alert" size={26} color="#dc2626" strokeWidth={1.75} />
          </div>
          <h2 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: '700', marginBottom: '10px' }}>Errore profilo</h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.88rem', lineHeight: '1.5', marginBottom: '24px' }}>
            Impossibile caricare il profilo. Riprova o contatta l'amministratore.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button onClick={refreshProfile} style={{
              padding: '12px', borderRadius: '999px', border: 'none',
              backgroundColor: '#fff', color: 'var(--color-primary)',
              fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer',
            }}>
              Riprova
            </button>
            <button onClick={signOut} style={{
              padding: '12px', borderRadius: '999px',
              backgroundColor: 'rgba(255,255,255,0.12)',
              border: '1px solid rgba(255,255,255,0.3)',
              color: '#fff', fontWeight: '600', fontSize: '0.88rem', cursor: 'pointer',
            }}>
              Esci
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px',
    }}>
      <div style={{
        backgroundColor: 'rgba(255,255,255,0.1)',
        border: '1px solid rgba(255,255,255,0.2)',
        borderRadius: '24px', padding: '36px 28px',
        textAlign: 'center', maxWidth: '360px', width: '100%',
        backdropFilter: 'blur(12px)',
      }}>
        {/* Icona animata */}
        <div style={{
          width: '72px', height: '72px',
          backgroundColor: 'rgba(255,255,255,0.15)',
          border: '2px solid rgba(255,255,255,0.3)',
          borderRadius: '20px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 24px',
        }}>
          <Icon name="clock" size={32} color="#fff" strokeWidth={1.5} />
        </div>

        <h2 style={{ color: '#fff', fontSize: '1.4rem', fontWeight: '800', marginBottom: '12px', letterSpacing: '-0.2px' }}>
          In attesa di approvazione
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '8px' }}>
          La tua registrazione è in attesa di approvazione da parte dell'amministratore.
        </p>
        {email && (
          <div style={{
            backgroundColor: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '12px', padding: '10px 16px',
            margin: '16px 0 24px',
            fontSize: '0.85rem', color: 'rgba(255,255,255,0.9)',
            fontWeight: '600',
          }}>
            {email}
          </div>
        )}
        <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.8rem', lineHeight: '1.5', marginBottom: '28px' }}>
          Riceverai una notifica quando il tuo account sarà attivato. Questo processo richiede solitamente poche ore.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {refreshProfile && (
            <button onClick={refreshProfile} style={{
              padding: '13px', borderRadius: '999px', border: 'none',
              backgroundColor: '#fff', color: 'var(--color-primary)',
              fontWeight: '700', fontSize: '0.92rem', cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            }}>
              Controlla stato
            </button>
          )}
          <button onClick={signOut} style={{
            padding: '13px', borderRadius: '999px',
            backgroundColor: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.25)',
            color: 'rgba(255,255,255,0.85)',
            fontWeight: '600', fontSize: '0.9rem', cursor: 'pointer',
          }}>
            Esci
          </button>
        </div>
      </div>
    </div>
  );
};

export default PendingApprovalScreen;
