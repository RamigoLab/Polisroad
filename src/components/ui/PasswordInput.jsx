/**
 * PasswordInput.jsx
 * Campo password con:
 * - Pulsante mostra/nascondi (icona occhio)
 * - Checklist requisiti in tempo reale (opzionale, attivata con showRequirements)
 */
import React, { useState } from 'react';
import { UIS } from '../../styles/ui';
import { C } from '../../styles/theme';
import { Icon } from './Icon';

const REQUIREMENTS = [
  { key: 'length',   label: 'Almeno 8 caratteri',          test: (v) => v.length >= 8 },
  { key: 'upper',    label: 'Almeno 1 lettera maiuscola',   test: (v) => /[A-Z]/.test(v) },
  { key: 'number',   label: 'Almeno 1 numero',              test: (v) => /[0-9]/.test(v) },
  { key: 'special',  label: 'Almeno 1 carattere speciale',  test: (v) => /[^A-Za-z0-9]/.test(v) },
];

export const PasswordInput = ({
  label = 'Password',
  value = '',
  onChange,
  showRequirements = false,
  ...rest
}) => {
  const [visible, setVisible] = useState(false);

  const checks = REQUIREMENTS.map(r => ({ ...r, ok: value.length > 0 && r.test(value) }));
  const allOk = checks.every(r => r.ok);

  return (
    <div style={UIS.inputWrapper}>
      {label && <label style={UIS.label}>{label}</label>}

      {/* Campo + toggle visibilità */}
      <div style={{ position: 'relative' }}>
        <input
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          style={{
            ...UIS.input,
            paddingRight: '44px',
            ...(showRequirements && value.length > 0 && allOk ? { borderColor: C.success } : {}),
          }}
          autoComplete="new-password"
          {...rest}
        />
        <button
          type="button"
          onClick={() => setVisible(v => !v)}
          aria-label={visible ? 'Nascondi password' : 'Mostra password'}
          style={{
            position: 'absolute',
            right: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: C.textLight,
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Icon name={visible ? 'eye-off' : 'eye'} size={18} />
        </button>
      </div>

      {/* Checklist requisiti — mostrata solo se showRequirements=true e c'è testo */}
      {showRequirements && value.length > 0 && (
        <div style={{
          marginTop: '10px',
          padding: '10px 12px',
          backgroundColor: C.surfaceContainer,
          borderRadius: '10px',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
        }}>
          {checks.map(r => (
            <div key={r.key} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.8rem',
              color: r.ok ? C.success : C.textLight,
              fontWeight: r.ok ? '600' : '400',
              transition: 'color 0.2s',
            }}>
              <Icon
                name={r.ok ? 'circle-check' : 'circle'}
                size={14}
                color={r.ok ? C.success : C.textLight}
              />
              {r.label}
            </div>
          ))}
          {allOk && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: C.success, fontWeight: '700', marginTop: '2px' }}>
              <Icon name="circle-check" size={14} color={C.success} />
              Password sicura
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * Verifica se tutti i requisiti sono soddisfatti.
 * Utile per disabilitare il bottone di submit.
 */
export const isPasswordValid = (value) =>
  REQUIREMENTS.every(r => r.test(value));
