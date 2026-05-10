import React from 'react';
import { PageWrapper } from '../components/layout/PageWrapper';
import { Badge } from '../components/ui/Badge';
import { C } from '../styles/theme';
import { useNews } from '../hooks/useNews';

export const News = () => {
  const { list, loading } = useNews();

  const publishedNews = list.filter(n => n.pubblicato);

  return (
    <PageWrapper>
      <h2 style={{ color: C.primary, marginBottom: '16px' }}>News Normative</h2>
      
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: C.textLight }}>Caricamento in corso...</div>
      ) : publishedNews.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '20px', color: C.textLight }}>Nessuna news disponibile.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {publishedNews.map(item => {
            const date = new Date(item.created_at).toLocaleDateString('it-IT');
            return (
              <div key={item.id} style={{ backgroundColor: '#fff', padding: '16px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <Badge type="accent">{item.categoria}</Badge>
                  <span style={{ fontSize: '0.8rem', color: C.textLight }}>{date}</span>
                </div>
                <h3 style={{ fontSize: '1.1rem', color: C.text, marginBottom: '8px', lineHeight: 1.3 }}>{item.titolo}</h3>
                <p style={{ fontSize: '0.9rem', color: C.text, lineHeight: 1.5, marginBottom: '12px' }}>{item.contenuto}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', color: C.textLight }}>Fonte: {item.fonte}</span>
                  {item.url_fonte && (
                    <a href={item.url_fonte} target="_blank" rel="noreferrer" style={{ fontSize: '0.85rem', color: C.primary, fontWeight: 'bold', textDecoration: 'none' }}>
                      Leggi di più ↗
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </PageWrapper>
  );
};
