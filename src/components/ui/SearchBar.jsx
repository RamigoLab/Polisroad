import React from 'react';
import { UIS } from '../../styles/ui';
import { Icon } from './Icon';

export const SearchBar = ({ value, onChange, placeholder = "Cerca...", id = "search-input" }) => {
  return (
    <div style={UIS.searchWrapper} role="search">
      <label htmlFor={id} style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0,0,0,0)' }}>
        {placeholder}
      </label>
      <span style={UIS.searchIcon} aria-hidden="true"><Icon name="search" size={18} /></span>
      <input
        id={id}
        type="search"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={UIS.searchInput}
        aria-label={placeholder}
        autoComplete="off"
      />
    </div>
  );
};
