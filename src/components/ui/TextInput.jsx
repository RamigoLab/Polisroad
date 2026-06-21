import React from 'react';
import { UIS } from '../../styles/ui';

export const TextInput = ({ label, type = 'text', value, onChange, placeholder = "", ...rest }) => {
  return (
    <div style={UIS.inputWrapper}>
      {label && <label style={UIS.label}>{label}</label>}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={UIS.input}
        {...rest}
      />
    </div>
  );
};
