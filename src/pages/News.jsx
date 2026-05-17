import React from 'react';
import { PageWrapper } from '../components/layout/PageWrapper';
import { Badge } from '../components/ui/Badge';
import { S } from '../styles/styles';
import { PS } from '../styles/pages';
import { useNews } from '../hooks/useNews';


export const News = ({ onNavigate }) => {
  const { list, loading } = useNews();
  const publishedNews = list.filter(n => n.pubblicato);

  return (
    <PageWrapper onNavigate={onNavigate}>
      <h2 style={S.sectionTitle}>News Normative</h2>

      {loading ? (
        <div style={S.emptyState}>Caricamento in corso...</div>
      ) : publishedNews.length === 0 ? (
        <div style={S.emptyState}>Nessuna news disponibile.</div>
      ) : (
        <div style={{ ...S.list, gap: '16px' }}>
          {publishedNews.map(item => {
            const date = new Date(item.created_at).toLocaleDateString('it-IT');
            return (
              <div key={item.id} style={S.card}>
                <div style={PS.newsItemHeader}>
                  <Badge type="accent">{item.categoria}</Badge>
                  <span style={PS.newsItemDate}>{date}</span>
                </div>
                <h3 style={PS.newsItemTitle}>{item.titolo}</h3>
                <p style={PS.newsItemContent}>{item.contenuto}</p>
                <div style={PS.newsItemFooter}>
                  <span style={PS.newsItemSource}>Fonte: {item.fonte}</span>
                  {item.url_fonte && (
                    <a href={item.url_fonte} target="_blank" rel="noreferrer" style={PS.newsItemLink}>
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
