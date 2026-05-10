import React from 'react';

export const PageWrapper = ({ children, style = {} }) => {
  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      padding: '16px',
      overflowY: 'auto',
      ...style
    }}>
      {children}
    </div>
  );
};
