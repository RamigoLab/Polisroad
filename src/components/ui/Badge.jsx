import React from 'react';
import { UIS } from '../../styles/ui';

export const Badge = ({ children, type = 'primary', style = {} }) => {
  return (
    <span style={{ ...UIS.badge(type), ...style }}>
      {children}
    </span>
  );
};
