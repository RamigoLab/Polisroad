import React from 'react';
import { UIS } from '../../styles/ui';

export const SelectInput = ({ label, value, onChange, options = [] }) => {
  return (
    <div style={UIS.inputWrapper}>
      {label && <label style={UIS.label}>{label}</label>}
      <select
        value={value}
        onChange={onChange}
        style={UIS.input}
      >
        <option value="">Seleziona...</option>
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};
