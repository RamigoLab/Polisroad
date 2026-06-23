import { C } from '../theme';

export const news = {
  newsItemHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '8px',
  },
  newsItemDate: { fontSize: '0.8rem', color: C.textLight },
  newsItemTitle: { fontSize: '1.1rem', color: C.text, marginBottom: '8px', lineHeight: 1.3 },
  newsItemContent: { fontSize: '0.9rem', color: C.text, lineHeight: 1.5, marginBottom: '12px' },
  newsItemFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  newsItemSource: { fontSize: '0.8rem', color: C.textLight },
  newsItemLink: { fontSize: '0.85rem', color: C.primary, fontWeight: 'bold', textDecoration: 'none' },
};
