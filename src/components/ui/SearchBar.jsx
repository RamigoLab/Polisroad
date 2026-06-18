import React from 'react';
import { UIS } from '../../styles/ui';
import { Icon } from './Icon';

export const SearchBar = ({ value, onChange, placeholder = "Cerca..." }) => {
  return (
    <div style={UIS.searchWrapper}>
      <span style={UIS.searchIcon}><Icon name="search" size={18} /></span>
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
