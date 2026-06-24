/**
 * SearchBar.jsx — Barra di ricerca con dropdown autocomplete.
 *
 * Props:
 *  - value, onChange     — controllato dall'esterno
 *  - placeholder
 *  - suggestions         — array di stringhe da mostrare nel dropdown
 *  - onSuggestionClick   — callback quando l'utente seleziona un suggerimento
 *  - id
 */
import React, { useState, useRef, useEffect } from 'react';
import { UIS } from '../../styles/ui';
import { C } from '../../styles/theme';
import { Icon } from './Icon';

export const SearchBar = ({
  value,
  onChange,
  placeholder = 'Cerca...',
  id = 'search-input',
  suggestions = [],
  onSuggestionClick,
}) => {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  const showDropdown = open && suggestions.length > 0;

  // Chiudi dropdown cliccando fuori
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (term) => {
    onSuggestionClick?.(term);
    setOpen(false);
  };

  return (
    <div ref={wrapperRef} style={{ ...UIS.searchWrapper, position: 'relative' }} role="search">
      <label
        htmlFor={id}
        style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0,0,0,0)' }}
      >
        {placeholder}
      </label>
      <span style={UIS.searchIcon} aria-hidden="true">
        <Icon name="search" size={18} />
      </span>
      <input
        id={id}
        type="search"
        value={value}
        onChange={onChange}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        style={UIS.searchInput}
        aria-label={placeholder}
        aria-autocomplete="list"
        aria-expanded={showDropdown}
        autoComplete="off"
      />
      {value && (
        <button
          onClick={() => { onChange({ target: { value: '' } }); setOpen(false); }}
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
          aria-label="Cancella ricerca"
        >
          <Icon name="close" size={16} />
        </button>
      )}

      {/* Dropdown suggerimenti */}
      {showDropdown && (
        <ul
          role="listbox"
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            backgroundColor: C.card,
            border: `1px solid ${C.border}`,
            borderRadius: '12px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            zIndex: 1000,
            listStyle: 'none',
            margin: 0,
            padding: '6px 0',
            overflow: 'hidden',
          }}
        >
          {suggestions.map((term, i) => (
            <li
              key={i}
              role="option"
              onClick={() => handleSelect(term)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 14px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                color: C.text,
                borderBottom: i < suggestions.length - 1 ? `1px solid ${C.border}` : 'none',
              }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = C.surfaceContainer}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <Icon name="clock" size={14} color={C.textLight} />
              <span>{term}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
