import React from 'react';
import { C } from '../../styles/theme';

export const TextInput = ({ label, value, onChange, type = 'text', placeholder = '', style = {}, disabled = false }) => {
  return (
    <div style={{ marginBottom: '16px', display: 'flex', flexDirection: 'column', ...style }}>
      {label && <label style={{ marginBottom: '6px', fontSize: '0.85rem', fontWeight: '600', color: C.text }}>{label}</label>}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        style={{
          padding: '12px 14px',
          borderRadius: '8px',
          border: `1px solid ${C.border}`,
          fontSize: '1rem',
          outline: 'none',
          backgroundColor: disabled ? '#f0f0f0' : '#fff',
          color: C.text,
          transition: 'border-color 0.2s',
        }}
        onFocus={(e) => e.target.style.borderColor = C.accent}
        onBlur={(e) => e.target.style.borderColor = C.border}
      />
    </div>
  );
};
