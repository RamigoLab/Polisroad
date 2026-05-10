import React from 'react';
import { C } from '../../styles/theme';

export const Badge = ({ children, type = 'primary', style = {} }) => {
  let bgColor = C.primary;
  let color = '#fff';

  if (type === 'danger') { bgColor = C.dangerLight; color = C.danger; }
  else if (type === 'success') { bgColor = C.successLight; color = C.success; }
  else if (type === 'warning') { bgColor = C.warningLight; color = C.warning; }
  else if (type === 'accent') { bgColor = C.accentLight; color = C.accent; }

  return (
    <span style={{
      display: 'inline-block',
      padding: '4px 8px',
      borderRadius: '12px',
      fontSize: '0.75rem',
      fontWeight: '600',
      backgroundColor: bgColor,
      color: color,
      ...style
    }}>
      {children}
    </span>
  );
};
