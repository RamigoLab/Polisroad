import React, { useState } from 'react';
import { PageWrapper } from '../components/layout/PageWrapper';
import { TextInput } from '../components/ui/TextInput';
import { SelectInput } from '../components/ui/SelectInput';
import { C } from '../styles/theme';
import { S } from '../styles/styles';
import { PS } from '../styles/pages';
import { useProntuario } from '../hooks/useProntuario';
import { useGamificationContext } from '../context/GamificationContext';

export const Calcolatore = ({ onNavigate }) => {
  const { list } = useProntuario();
  const { addXP } = useGamificationContext();
  const [selectedId, setSelectedId] = useState('');
  const [min, setMin] = useState('');
  const [max, setMax] = useState('');
  const [punti, setPunti] = useState('');

  const handleSelect = async (e) => {
    const id = e.target.value;
    setSelectedId(id);
    const item = list.find(p => p.id === id);
    if (item) {
      await addXP(20, 'calculator');
      const baseValue = item.pmr || item.edittale_min;
      setMin(baseValue ? baseValue.toString() : '');
      setMax(item.edittale_max ? item.edittale_max.toString() : '');
      setPunti(item.punti_patente ? item.punti_patente.toString() : '');
    }
  };

  const calcDiurna = min ? parseFloat(min) : 0;
  const calcScontata = min ? (parseFloat(min) * 0.7).toFixed(2) : 0;
  const calcNotturna = min ? (parseFloat(min) * 1.3333).toFixed(2) : 0;
  const calcNotturnaScontata = min ? (parseFloat(calcNotturna) * 0.7).toFixed(2) : 0;

  return (
    <PageWrapper title="Calcolatore Sanzioni" subtitle="Importi, sconti e maggiorazioni" onNavigate={onNavigate}>
      <div style={{ ...S.formCard, marginBottom: '16px' }}>
        <SelectInput
          label="Pre-compila da violazione (Opzionale)"
          value={selectedId}
          onChange={handleSelect}
          options={list.map(item => ({ value: item.id, label: `${item.rif_normativo} - ${item.titolo.substring(0, 30)}...` }))}
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <TextInput 
            label="Edittale Minimo (€)" 
            type="number" 
            value={min} 
            onChange={e => {
              const val = e.target.value;
              if (val === '' || parseFloat(val) >= 0) setMin(val);
            }} 
          />
          <TextInput 
            label="Edittale Massimo (€)" 
            type="number" 
            value={max} 
            onChange={e => {
              const val = e.target.value;
              if (val === '' || parseFloat(val) >= 0) setMax(val);
            }} 
          />
        </div>
        <TextInput 
          label="Punti Patente" 
          type="number" 
          value={punti} 
          onChange={e => {
            const val = e.target.value;
            if (val === '' || parseInt(val, 10) >= 0) setPunti(val);
          }} 
        />
      </div>

      {min && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={PS.calcResultPrimary}>
            <div style={PS.calcResultLabel}>Pagamento in Misura Ridotta (Entro 60gg)</div>
            <div style={{ ...PS.calcResultValueLg, color: C.primary }}>€ {calcDiurna}</div>
          </div>

          <div style={PS.calcResultSuccess}>
            <div style={PS.calcResultLabel}>Scontata del 30% (Entro 5gg)</div>
            <div style={{ ...PS.calcResultValueLg, color: C.success }}>€ {calcScontata}</div>
          </div>

          <div style={PS.calcResultDanger}>
            <div style={PS.calcResultLabel}>Sanzione Notturna (+33.3%)</div>
            <div style={{ ...PS.calcResultValueMd, color: C.danger }}>€ {calcNotturna}</div>
            <div style={PS.calcResultSub}>Scontata 30%: <strong>€ {calcNotturnaScontata}</strong></div>
          </div>
        </div>
      )}
    </PageWrapper>
  );
};
