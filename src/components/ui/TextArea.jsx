import React from 'react';
import { UIS } from '../../styles/ui';

export const TextArea = ({ label, value, onChange, placeholder = "", rows = 4 }) => {
  return (
    <div style={UIS.inputWrapper}>
      {label && <label style={UIS.label}>{label}</label>}
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        style={UIS.textarea}
      />
    </div>
  );
};
