import React from 'react';
import { PageWrapper } from '../components/layout/PageWrapper';
import { EmptyState } from '../components/ui/EmptyState';
import { SkeletonNewsCard } from '../components/ui/Skeleton';
import { Badge } from '../components/ui/Badge';
import { S } from '../styles/styles';
import { PS } from '../styles/pages';
import { useNews } from '../hooks/useNews';


export const News = ({ onNavigate }) => {
  const [activeFilter, setActiveFilter] = React.useState('tutte');
  const { list, loading, refresh } = useNews();

  // Escludi categorie interne (banner/popup gestite in Home)
  const publishedNews = list.filter(n => n.pubblicato && n.categoria !== 'banner' && n.categoria !== 'popup');

  const filteredNews = React.useMemo(() => {
    if (activeFilter === 'tutte') return publishedNews;
    return publishedNews.filter(n => n.categoria === activeFilter);
  }, [publishedNews, activeFilter]);

  const filterPills = [
    { id: 'tutte', label: 'Tutte' },
    { id: 'normativa', label: 'Normativa' },
    { id: 'sicurezza', label: 'Sicurezza' },
    { id: 'informativa', label: 'Informativa' },
  ];

  return (
    <PageWrapper title="News Normative & CdS" subtitle="Aggiornamenti e comunicazioni" onNavigate={onNavigate} onRefresh={refresh} enablePullToRefresh>
      <div style={{ marginBottom: '20px' }}>
        {/* Category Filter Pills */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
          {filterPills.map(pill => {
            const isActive = activeFilter === pill.id;
            return (
              <button
                key={pill.id}
                onClick={() => setActiveFilter(pill.id)}
                aria-pressed={isActive}
                style={{
                  padding: '8px 16px',
                  borderRadius: '20px',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  border: isActive ? 'none' : '1px solid var(--color-border)',
                  backgroundColor: isActive ? 'var(--color-primary)' : 'var(--bg-card)',
                  color: isActive ? '#fff' : 'var(--color-text-light)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap',
                }}
              >
                {pill.label}
              </button>
            );
          })}
        </div>
      </div>

      {loading ? (
        <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
          {[1,2,3].map(i => <SkeletonNewsCard key={i} />)}
        </div>
      ) : filteredNews.length === 0 ? (
        <EmptyState icon="newspaper" title="Nessuna notizia" subtitle="Non ci sono notizie disponibili per questa categoria al momento." />
      ) : (
        <div style={{ ...S.list, gap: '16px' }}>
          {filteredNews.map(item => {
            const dateVal = item.data_creazione || item.created_at;
            const date = new Date(dateVal).toLocaleDateString('it-IT');
            
            // Extract source/link dynamically if they are embedded in the content column
            let contentText = item.contenuto || '';
            let extractedSource = item.fonte || '';
            let extractedLink = item.url_fonte || '';

            if (contentText.startsWith('[Fonte:')) {
              const match = contentText.match(/^\[Fonte:\s*([^|\]]+)(?:\s*\|\s*Link:\s*([^\]]+))?\]\s*\n*\s*/);
              if (match) {
                extractedSource = match[1].trim();
                if (match[2]) {
                  extractedLink = match[2].trim();
                }
                contentText = contentText.substring(match[0].length);
              }
            }

            return (
              <div key={item.id} style={S.card}>
                <div style={PS.newsItemHeader}>
                  <Badge type={
                    item.categoria === 'normativa' ? 'danger' :
                    item.categoria === 'sicurezza' ? 'warning' : 'primary'
                  }>
                    {item.categoria === 'normativa' ? 'Normativa' :
                     item.categoria === 'sicurezza' ? 'Sicurezza' : 'Utility'}
                  </Badge>
                  <span style={PS.newsItemDate}>{date}</span>
                </div>
                <h3 style={PS.newsItemTitle}>{item.titolo}</h3>
                <p style={{ ...PS.newsItemContent, whiteSpace: 'pre-wrap' }}>{contentText}</p>
                <div style={PS.newsItemFooter}>
                  {extractedSource && <span style={PS.newsItemSource}>Fonte: {extractedSource}</span>}
                  {extractedLink && (
                    <a href={extractedLink} target="_blank" rel="noreferrer" style={PS.newsItemLink}>
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
