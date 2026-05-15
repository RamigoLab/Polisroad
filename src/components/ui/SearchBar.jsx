import React from 'react';
import { UIS } from '../../styles/ui';

export const SearchBar = ({ value, onChange, placeholder = "Cerca..." }) => {
  return (
    <div style={UIS.searchWrapper}>
      <span style={UIS.searchIcon}>🔍</span>
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={UIS.searchInput}
      />
    </div>
  );
};
