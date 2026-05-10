import React from 'react';
import { C } from '../../styles/theme';

export const SearchBar = ({ value, onChange, placeholder = 'Cerca...' }) => {
  return (
    <div style={{ position: 'relative', marginBottom: '16px' }}>
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{
          width: '100%',
          padding: '12px 14px 12px 40px',
          borderRadius: '24px',
          border: 'none',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          fontSize: '1rem',
          outline: 'none',
        }}
      />
      <span style={{ position: 'absolute', left: '14px', top: '12px', fontSize: '1.2rem', color: C.textLight }}>🔍</span>
    </div>
  );
};
