import React, { useState } from 'react';
import { C } from '../../styles/theme';
import { Icon } from './Icon';

export const SearchBar = ({
  value, onChange, placeholder = 'Cerca...',
  suggestions = [], onSuggestionClick,
  loading = false,
}) => {
  const showSuggestions = suggestions.length > 0 && !value;
  const [isFocused, setIsFocused] = useState(false);
  // Il contorno era rimosso dall'input (outline:'none') senza alcun sostituto:
  // chi naviga da tastiera perdeva ogni indicazione visiva del focus. Ora lo
  // stesso "glow" già usato quando c'è del testo scatta anche solo al focus.
  const highlighted = isFocused || !!value;

  return (
    <div style={{ position: 'relative' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        backgroundColor: C.card,
        border: `1.5px solid ${highlighted ? C.accent : C.border}`,
        borderRadius: '999px',
        padding: '11px 16px',
        boxShadow: highlighted ? `0 0 0 3px ${C.accentLight}` : 'var(--shadow-sm)',
        transition: 'all 0.15s ease',
      }}>
        {loading ? (
          <Icon
            name="rotate-cw"
            size={17}
            color={C.accent}
            strokeWidth={2}
            style={{ animation: 'spin 0.8s linear infinite', flexShrink: 0 }}
          />
        ) : (
          <Icon name="search" size={17} color={value ? C.accent : C.textLight} strokeWidth={2} />
        )}
        <input
          type="text"
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          style={{
            flex: 1, border: 'none', outline: 'none',
            fontSize: '0.95rem', backgroundColor: 'transparent',
            color: C.text,
          }}
        />
        {value && (
          <button
            onClick={() => onChange({ target: { value: '' } })}
            aria-label="Cancella ricerca"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '20px', height: '20px', borderRadius: '50%',
              backgroundColor: C.surfaceContainer,
              border: 'none', cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            <Icon name="x" size={12} color={C.textLight} strokeWidth={2.5} />
          </button>
        )}
      </div>

      {showSuggestions && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)',
          left: 0, right: 0, zIndex: 50,
          backgroundColor: C.card,
          border: `1px solid ${C.border}`,
          borderRadius: '14px',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-md)',
        }}>
          {suggestions.map((s, i) => (
            <div
              key={i}
              onClick={() => onSuggestionClick?.(s)}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '11px 14px',
                borderBottom: i < suggestions.length - 1 ? `0.5px solid ${C.border}` : 'none',
                cursor: 'pointer',
                fontSize: '0.88rem', color: C.text,
              }}
            >
              <Icon name="clock" size={14} color={C.textLight} strokeWidth={1.75} />
              {s}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
