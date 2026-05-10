import React from 'react';
import { C } from '../../styles/theme';

export const TextArea = ({ label, value, onChange, placeholder = '', style = {}, rows = 4 }) => {
  return (
    <div style={{ marginBottom: '16px', display: 'flex', flexDirection: 'column', ...style }}>
      {label && <label style={{ marginBottom: '6px', fontSize: '0.85rem', fontWeight: '600', color: C.text }}>{label}</label>}
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        style={{
          padding: '12px 14px',
          borderRadius: '8px',
          border: `1px solid ${C.border}`,
          fontSize: '1rem',
          outline: 'none',
          backgroundColor: '#fff',
          color: C.text,
          resize: 'vertical',
        }}
        onFocus={(e) => e.target.style.borderColor = C.accent}
        onBlur={(e) => e.target.style.borderColor = C.border}
      />
    </div>
  );
};
