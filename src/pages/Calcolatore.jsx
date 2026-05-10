import React, { useState } from 'react';
import { PageWrapper } from '../components/layout/PageWrapper';
import { TextInput } from '../components/ui/TextInput';
import { SelectInput } from '../components/ui/SelectInput';
import { C } from '../styles/theme';
import { useProntuario } from '../hooks/useProntuario';

export const Calcolatore = () => {
  const { list } = useProntuario();
  const [selectedId, setSelectedId] = useState('');
  
  const [min, setMin] = useState('');
  const [max, setMax] = useState('');
  const [punti, setPunti] = useState('');
  
  const handleSelect = (e) => {
    const id = e.target.value;
    setSelectedId(id);
    const item = list.find(p => p.id === id);
    if (item) {
      setMin(item.edittale_min ? item.edittale_min.toString() : '');
      setMax(item.edittale_max ? item.edittale_max.toString() : '');
      setPunti(item.punti_patente ? item.punti_patente.toString() : '');
    }
  };

  const calcDiurna = min ? parseFloat(min) : 0;
  const calcScontata = min ? (parseFloat(min) * 0.7).toFixed(2) : 0;
  const calcNotturna = min ? (parseFloat(min) * 1.3333).toFixed(2) : 0;
  const calcNotturnaScontata = min ? (parseFloat(calcNotturna) * 0.7).toFixed(2) : 0;

  return (
    <PageWrapper>
      <h2 style={{ color: C.primary, marginBottom: '16px' }}>Calcolatore Sanzioni</h2>
      
      <div style={{ backgroundColor: '#fff', padding: '16px', borderRadius: '12px', marginBottom: '16px' }}>
        <SelectInput 
          label="Pre-compila da violazione (Opzionale)" 
          value={selectedId} 
          onChange={handleSelect}
          options={list.map(item => ({ value: item.id, label: `${item.rif_normativo} - ${item.titolo.substring(0,30)}...` }))}
        />
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <TextInput label="Edittale Minimo (€)" type="number" value={min} onChange={e => setMin(e.target.value)} />
          <TextInput label="Edittale Massimo (€)" type="number" value={max} onChange={e => setMax(e.target.value)} />
        </div>
        <TextInput label="Punti Patente" type="number" value={punti} onChange={e => setPunti(e.target.value)} />
      </div>

      {min && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ backgroundColor: C.surface, padding: '16px', borderRadius: '12px', borderLeft: `4px solid ${C.primary}` }}>
            <div style={{ fontSize: '0.85rem', color: C.textLight, marginBottom: '4px' }}>Pagamento in Misura Ridotta (Entro 60gg)</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 'bold', color: C.primary }}>€ {calcDiurna}</div>
          </div>
          
          <div style={{ backgroundColor: C.successLight, padding: '16px', borderRadius: '12px', borderLeft: `4px solid ${C.success}` }}>
            <div style={{ fontSize: '0.85rem', color: C.textLight, marginBottom: '4px' }}>Scontata del 30% (Entro 5gg)</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 'bold', color: C.success }}>€ {calcScontata}</div>
          </div>
          
          <div style={{ backgroundColor: C.dangerLight, padding: '16px', borderRadius: '12px', borderLeft: `4px solid ${C.danger}` }}>
            <div style={{ fontSize: '0.85rem', color: C.textLight, marginBottom: '4px' }}>Notturna (22:00 - 07:00, +33.3%)</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: C.danger }}>€ {calcNotturna}</div>
            <div style={{ fontSize: '0.85rem', marginTop: '8px' }}>Scontata 30%: <strong>€ {calcNotturnaScontata}</strong></div>
          </div>
        </div>
      )}
    </PageWrapper>
  );
};
