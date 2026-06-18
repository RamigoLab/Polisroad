import { C } from '../../styles/theme';

const VARIANTS = {
  filled:  { backgroundColor: C.primary, color: '#fff' },
  tonal:   { backgroundColor: C.accentLight, color: C.accent },
  outline: { backgroundColor: 'transparent', color: C.primary, border: `1px solid ${C.primary}` },
  text:    { backgroundColor: 'transparent', color: C.primary },
  danger:  { backgroundColor: C.dangerLight, color: C.danger },
};

export const Button = ({ variant = 'filled', icon, children, style, ...rest }) => (
  <button
    {...rest}
    style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
      padding: '12px 20px', borderRadius: C.radiusPill, fontWeight: 600,
      fontSize: '0.95rem', width: '100%', transition: 'transform 0.15s ease',
      ...VARIANTS[variant], ...style,
    }}
  >
    {icon}
    {children}
  </button>
);
