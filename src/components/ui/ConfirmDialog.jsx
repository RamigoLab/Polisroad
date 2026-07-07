import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { Icon } from './Icon';
import { C } from '../../styles/theme';

const ConfirmContext = createContext(null);

/**
 * ConfirmProvider — sostituisce window.confirm() con un dialog in stile app.
 *
 * Prima ogni pannello Admin (Sinonimi, Segnalazioni, Prontuario, News,
 * Normativa) usava il window.confirm() nativo del browser — spartano,
 * incoerente con lo stile dell'app, e diverso dalla card di conferma
 * personalizzata già usata in AdminUtenti.jsx e nell'eliminazione account.
 * Questo componente unifica tutti i punti di conferma in un solo posto.
 *
 * Uso:
 *   const confirm = useConfirm();
 *   const ok = await confirm({ title: '...', message: '...', danger: true });
 *   if (!ok) return;
 */
export const ConfirmProvider = ({ children }) => {
  const [state, setState] = useState(null); // { title, message, confirmLabel, cancelLabel, danger }
  const resolveRef = useRef(null);

  const confirm = useCallback((options) => {
    return new Promise((resolve) => {
      resolveRef.current = resolve;
      setState({
        title: options?.title || 'Conferma azione',
        message: options?.message || 'Sei sicuro di voler procedere?',
        confirmLabel: options?.confirmLabel || 'Conferma',
        cancelLabel: options?.cancelLabel || 'Annulla',
        danger: options?.danger !== false, // default true: la maggior parte delle conferme è per azioni distruttive
      });
    });
  }, []);

  const close = (result) => {
    setState(null);
    resolveRef.current?.(result);
    resolveRef.current = null;
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {state && (
        <div
          onClick={() => close(false)}
          role="presentation"
          style={{
            position: 'fixed', inset: 0, zIndex: 9500,
            backgroundColor: 'rgba(0,0,0,0.55)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-dialog-title"
            aria-describedby="confirm-dialog-message"
            style={{
              width: '100%', maxWidth: '380px',
              backgroundColor: C.card,
              borderRadius: '16px',
              padding: '22px',
              boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <Icon
                name={state.danger ? 'triangle-alert' : 'circle-check'}
                size={22}
                color={state.danger ? C.danger : C.accent}
              />
              <h3 id="confirm-dialog-title" style={{ fontSize: '1.05rem', fontWeight: '800', color: C.text, margin: 0 }}>
                {state.title}
              </h3>
            </div>
            <p id="confirm-dialog-message" style={{ fontSize: '0.9rem', color: C.textLight, lineHeight: 1.4, marginBottom: '20px' }}>
              {state.message}
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => close(false)}
                style={{
                  flex: 1, padding: '11px', borderRadius: '10px',
                  border: `1px solid ${C.border}`, backgroundColor: 'transparent',
                  color: C.text, fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer',
                }}
              >
                {state.cancelLabel}
              </button>
              <button
                onClick={() => close(true)}
                autoFocus
                style={{
                  flex: 1, padding: '11px', borderRadius: '10px',
                  border: 'none', backgroundColor: state.danger ? C.danger : C.accent,
                  color: '#fff', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer',
                }}
              >
                {state.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
};

export const useConfirm = () => {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm deve essere usato dentro <ConfirmProvider>');
  return ctx;
};
