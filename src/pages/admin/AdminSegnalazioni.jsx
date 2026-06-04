import React, { useState, useEffect } from 'react';
import { C } from '../../styles/theme';
import { S } from '../../styles/styles';
import { useToast } from '../../components/ui/ToastManager';
import { supabase, isSupabaseConfigured } from '../../config/supabase';

export const AdminSegnalazioni = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('tutte'); // tutte, pendenza, risolte
  const [dbError, setDbError] = useState(false);
  const { showToast } = useToast();

  const fetchSegnalazioni = async () => {
    setLoading(true);
    setDbError(false);

    let loadedData = [];
    let errorOccurred = false;

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('segnalazioni')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.warn("Supabase reports query returned error:", error);
          if (error.code === '42P01') {
            setDbError(true); // Table does not exist
          }
          errorOccurred = true;
        } else {
          loadedData = data || [];
        }
      } catch (err) {
        console.error("Failed to query Supabase reports:", err);
        errorOccurred = true;
      }
    } else {
      errorOccurred = true;
    }

    // Fallback to local storage if database failed or is not configured
    if (errorOccurred) {
      try {
        const local = localStorage.getItem('polisroad_local_segnalazioni');
        loadedData = local ? JSON.parse(local) : [];
        // Sort by created_at desc
        loadedData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      } catch (e) {
        console.error("Failed to parse local reports:", e);
      }
    }

    setList(loadedData);
    setLoading(false);
  };

  useEffect(() => {
    fetchSegnalazioni();
  }, []);

  const isLocalReport = (id) => id?.toString().startsWith('local_');

  const handleToggleRisolto = async (item) => {
    const nextRisolto = !item.risolto;
    let success = false;
    let shouldUseLocalFallback = !isSupabaseConfigured || !supabase || dbError || isLocalReport(item.id);

    if (!shouldUseLocalFallback) {
      try {
        const { error } = await supabase
          .from('segnalazioni')
          .update({ risolto: nextRisolto })
          .eq('id', item.id);

        if (!error) {
          success = true;
        } else {
          console.warn("Failed to update in Supabase:", error);
          showToast('Supabase ha rifiutato la modifica. Controlla le policy RLS.', 'error');
        }
      } catch (err) {
        console.error("Supabase toggle exception:", err);
        shouldUseLocalFallback = true;
      }
    }

    if (!success && shouldUseLocalFallback) {
      // Local or fallback update
      try {
        const local = localStorage.getItem('polisroad_local_segnalazioni');
        let localList = local ? JSON.parse(local) : [];
        localList = localList.map(x => x.id === item.id || (item.id.toString().startsWith('local_') && x.id === item.id) ? { ...x, risolto: nextRisolto } : x);
        localStorage.setItem('polisroad_local_segnalazioni', JSON.stringify(localList));
        success = true;
      } catch (e) {
        console.error("Local toggle failed:", e);
      }
    }

    if (success) {
      setList(prev => prev.map(x => x.id === item.id ? { ...x, risolto: nextRisolto } : x));
      showToast(nextRisolto ? 'Segnalazione contrassegnata come RISOLTA!' : 'Segnalazione RIAPERTA!', 'success');
    } else {
      showToast('Impossibile aggiornare lo stato.', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Sei sicuro di voler eliminare questa segnalazione?')) return;
    let success = false;
    let shouldUseLocalFallback = !isSupabaseConfigured || !supabase || dbError || isLocalReport(id);

    if (!shouldUseLocalFallback) {
      try {
        const { error } = await supabase
          .from('segnalazioni')
          .delete()
          .eq('id', id);

        if (!error) {
          success = true;
        } else {
          console.warn("Failed to delete in Supabase:", error);
          showToast('Supabase ha rifiutato l\'eliminazione. Controlla le policy RLS.', 'error');
        }
      } catch (err) {
        console.error("Supabase delete exception:", err);
        shouldUseLocalFallback = true;
      }
    }

    if (!success && shouldUseLocalFallback) {
      // Local or fallback delete
      try {
        const local = localStorage.getItem('polisroad_local_segnalazioni');
        let localList = local ? JSON.parse(local) : [];
        localList = localList.filter(x => x.id !== id);
        localStorage.setItem('polisroad_local_segnalazioni', JSON.stringify(localList));
        success = true;
      } catch (e) {
        console.error("Local delete failed:", e);
      }
    }

    if (success) {
      setList(prev => prev.filter(x => x.id !== id));
      showToast('Segnalazione eliminata con successo!', 'success');
    } else {
      showToast('Impossibile eliminare la segnalazione.', 'error');
    }
  };

  const filteredList = list.filter(item => {
    if (filter === 'tutte') return true;
    if (filter === 'pendenza') return !item.risolto;
    if (filter === 'risolte') return item.risolto;
    return true;
  });

  const sqlSnippet = `CREATE TABLE IF NOT EXISTS public.segnalazioni (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    tipo text NOT NULL,
    dettagli text NOT NULL,
    email text,
    operatore text,
    risolto boolean DEFAULT false NOT NULL
);

-- Abilita RLS
ALTER TABLE public.segnalazioni ENABLE ROW LEVEL SECURITY;

-- Helper admin: richiede tabella profiles con colonna ruolo
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND ruolo = 'admin'
  );
$$;

-- Criteri di Sicurezza (Policy)
-- 1. Consenti agli utenti autenticati di inviare segnalazioni
CREATE POLICY "Inserimento segnalazioni autenticati"
ON public.segnalazioni
FOR INSERT
TO authenticated
WITH CHECK (true);

-- 2. Consenti lettura agli admin e le proprie segnalazioni agli utenti
CREATE POLICY "Lettura segnalazioni admin e proprie"
ON public.segnalazioni
FOR SELECT
TO authenticated
USING (public.is_admin() OR email = (auth.jwt() ->> 'email'));

CREATE POLICY "Aggiornamento segnalazioni admin"
ON public.segnalazioni
FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "Eliminazione segnalazioni admin"
ON public.segnalazioni
FOR DELETE
TO authenticated
USING (public.is_admin());`;

  return (
    <div>
      <div style={S.formHeader}>
        <h2 style={S.sectionTitle}>Gestione Segnalazioni Problemi</h2>
        <button 
          onClick={fetchSegnalazioni} 
          disabled={loading} 
          style={{ ...S.btnPrimarySmall, backgroundColor: C.primary, width: 'auto', border: 'none', cursor: 'pointer' }}
        >
          {loading ? 'Aggiornamento...' : '🔄 Ricarica'}
        </button>
      </div>

      {dbError && (
        <div style={{ ...S.warningBox, marginBottom: '24px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <h4 style={{ margin: 0, color: C.warning, fontWeight: 'bold' }}>⚠️ Tabella Database Mancante in Supabase</h4>
          <p style={{ margin: 0, fontSize: '0.85rem', lineHeight: '1.4', color: C.text }}>
            L'applicazione sta usando la memoria locale (<strong>localStorage</strong>) come fallback perché la tabella <code>segnalazioni</code> non esiste nel tuo database Supabase.
          </p>
          <p style={{ margin: 0, fontSize: '0.85rem', lineHeight: '1.4', color: C.text }}>
            Per abilitare la sincronizzazione in tempo reale ed eliminare questo avviso, copia ed esegui il seguente script SQL nel pannello <strong>SQL Editor</strong> del tuo account Supabase:
          </p>
          <pre style={{
            backgroundColor: 'rgba(0,0,0,0.08)',
            padding: '12px',
            borderRadius: '6px',
            overflowX: 'auto',
            fontSize: '0.8rem',
            margin: '8px 0',
            fontFamily: 'Consolas, monospace',
            color: C.text
          }}>
            {sqlSnippet}
          </pre>
        </div>
      )}

      {/* Filtri */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {['tutte', 'pendenza', 'risolte'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '6px 12px',
              borderRadius: '20px',
              border: `1px solid ${filter === f ? C.primary : C.border}`,
              backgroundColor: filter === f ? C.primary : C.card,
              color: filter === f ? '#fff' : C.text,
              fontSize: '0.85rem',
              fontWeight: '600',
              cursor: 'pointer',
              textTransform: 'capitalize'
            }}
          >
            {f === 'tutte' ? 'Tutte' : f === 'pendenza' ? 'Da Risolvere' : 'Risolte'}
          </button>
        ))}
      </div>

      {/* Lista Segnalazioni */}
      {loading ? (
        <div style={S.emptyState}>Caricamento in corso...</div>
      ) : (
        <div style={S.list}>
          {filteredList.map(item => {
            const isLocal = item.id.toString().startsWith('local_');
            return (
              <div 
                key={item.id} 
                style={{
                  ...S.card,
                  borderLeft: `4px solid ${item.risolto ? C.success : C.danger}`,
                  opacity: item.risolto ? 0.75 : 1,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{
                    ...S.labelUppercase,
                    backgroundColor: item.tipo === 'Problema Tecnico' ? 'rgba(231, 76, 60, 0.1)' : 'rgba(52, 152, 219, 0.1)',
                    color: item.tipo === 'Problema Tecnico' ? C.danger : C.primary,
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    fontWeight: 'bold'
                  }}>
                    {item.tipo}
                  </span>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {isLocal && (
                      <span style={{ fontSize: '0.75rem', color: C.warning, fontWeight: 'bold' }}>
                        💾 Locale
                      </span>
                    )}
                    <span style={{
                      fontSize: '0.8rem',
                      fontWeight: 'bold',
                      color: item.risolto ? C.success : C.danger
                    }}>
                      {item.risolto ? '● Risolta' : '○ Da Risolvere'}
                    </span>
                  </div>
                </div>

                <div style={{ fontSize: '0.9rem', color: C.text, whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>
                  {item.dettagli}
                </div>

                <div style={{ 
                  borderTop: `1px solid ${C.border}`,
                  paddingTop: '8px',
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.8rem',
                  color: C.textLight,
                  gap: '8px'
                }}>
                  <div>
                    Segnalato da: <strong>{item.operatore}</strong> ({item.email})
                  </div>
                  <div>
                    Data: {new Date(item.created_at).toLocaleString('it-IT')}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                  <button 
                    onClick={() => handleToggleRisolto(item)}
                    style={{ 
                      ...S.btnAccent,
                      backgroundColor: item.risolto ? C.surface : C.successLight,
                      color: item.risolto ? C.text : C.success,
                      fontWeight: 'bold',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    {item.risolto ? 'Riapri Segnalazione 🔓' : 'Segna come Risolta ✓'}
                  </button>
                  <button 
                    onClick={() => handleDelete(item.id)}
                    style={{ 
                      ...S.btnDanger, 
                      fontWeight: 'bold',
                      border: 'none',
                      cursor: 'pointer' 
                    }}
                  >
                    Elimina 🗑️
                  </button>
                </div>
              </div>
            );
          })}
          
          {filteredList.length === 0 && (
            <div style={S.emptyStateBox}>
              <span style={S.emptyStateIcon}>🎉</span>
              Nessuna segnalazione trovata in questa categoria!
            </div>
          )}
        </div>
      )}
    </div>
  );
};
