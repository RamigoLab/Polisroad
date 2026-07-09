import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

vi.mock('../../hooks/useSyncQueue', () => ({
  useSyncQueue: () => ({ addToQueue: vi.fn() }),
}));
vi.mock('../../styles/theme', () => ({ C: { primary: '#000', text: '#000', textLight: '#999', danger: '#c00', warning: '#f90', accent: '#00f', border: '#ccc', surface: '#eee' } }));
vi.mock('../../styles/styles', () => ({ S: { card: {}, warningBox: {}, infoBox: {}, dangerBox: {}, infoBoxTitle: {}, dangerBoxTitle: {}, btnCancel: {}, btnPrimarySmall: {}, btnPrimary: {}, valueDanger: {}, valueSuccess: {} } }));
vi.mock('../../styles/pages', () => ({ PS: { prontuarioDetailBody: {}, prontuarioSanzioniGrid: {}, prontuarioSanzioniCell: {}, prontuarioSanzioniLabel: {}, prontuarioNoteBlock: {}, prontuarioMemoBlock: {}, prontuarioMemoHeader: {} } }));
vi.mock('../ui/Badge', () => ({ Badge: ({ children }) => <span>{children}</span> }));
vi.mock('../ui/Icon', () => ({ Icon: ({ name }) => <span aria-hidden>{name}</span> }));

import { ProntuarioDetail } from '../ProntuarioDetail';

const mockItem = {
  id: 1,
  rif_normativo: 'Art. 186, comma 2',
  articolo_numero: '186',
  titolo: 'Guida in stato di ebbrezza',
  note_comuni: 'Note comuni all\'articolo 186.',
  descrizione: 'Conducente sotto l\'influenza dell\'alcool.',
  pmr: '543',
  scontato_30: '380',
  sanzione_notturna: true,
  sanzione_notturna_scontata: '506',
  punti_patente: 10,
  sanzione_accessoria: 'Sospensione patente da 3 a 6 mesi',
  note_verbale: 'Accompagnare al pronto soccorso.',
  note_operative: 'Richiedere etilometro certificato.',
};

describe('ProntuarioDetail', () => {
  const defaultProps = {
    item: mockItem,
    isFavorite: false,
    nota: '',
    onSaveNota: vi.fn(),
  };

  beforeEach(() => vi.clearAllMocks());

  it('mostra il riferimento normativo', () => {
    render(<ProntuarioDetail {...defaultProps} />);
    expect(screen.getByText('Art. 186, comma 2')).toBeTruthy();
  });

  it('mostra il titolo in grassetto', () => {
    render(<ProntuarioDetail {...defaultProps} />);
    expect(screen.getByText('Guida in stato di ebbrezza')).toBeTruthy();
  });

  it('mostra la card Note Comuni quando presenti', () => {
    render(<ProntuarioDetail {...defaultProps} />);
    expect(screen.getByText('Norme Comuni dell\'Articolo')).toBeTruthy();
    expect(screen.getByText("Note comuni all'articolo 186.")).toBeTruthy();
  });

  it('NON mostra la card Note Comuni se assenti', () => {
    const props = { ...defaultProps, item: { ...mockItem, note_comuni: null } };
    render(<ProntuarioDetail {...props} />);
    expect(screen.queryByText('Norme Comuni dell\'Articolo')).toBeNull();
  });

  it('mostra la descrizione violazione', () => {
    render(<ProntuarioDetail {...defaultProps} />);
    expect(screen.getByText("Conducente sotto l'influenza dell'alcool.")).toBeTruthy();
  });

  it('mostra le note verbale e operative', () => {
    render(<ProntuarioDetail {...defaultProps} />);
    expect(screen.getByText('Accompagnare al pronto soccorso.')).toBeTruthy();
    expect(screen.getByText('Richiedere etilometro certificato.')).toBeTruthy();
  });

  it('non mostra sanzione accessoria se assente o "Nessuna"', () => {
    const props = { ...defaultProps, item: { ...mockItem, sanzione_accessoria: 'Nessuna' } };
    render(<ProntuarioDetail {...props} />);
    expect(screen.queryByText('Sanzione Accessoria:')).toBeNull();
  });

  it('mostra sanzione accessoria quando presente', () => {
    render(<ProntuarioDetail {...defaultProps} />);
    expect(screen.getByText('Sospensione patente da 3 a 6 mesi')).toBeTruthy();
  });

  it('mostra la nota salvata', () => {
    render(<ProntuarioDetail {...defaultProps} nota="Nota di test" />);
    expect(screen.getByText('Nota di test')).toBeTruthy();
  });

  it('il bottone Modifica apre il textarea', () => {
    render(<ProntuarioDetail {...defaultProps} />);
    fireEvent.click(screen.getByText('Modifica'));
    expect(screen.getByPlaceholderText('Aggiungi una nota personale...')).toBeTruthy();
  });

  it('Annulla chiude il form nota', () => {
    render(<ProntuarioDetail {...defaultProps} />);
    fireEvent.click(screen.getByText('Modifica'));
    fireEvent.click(screen.getByText('Annulla'));
    expect(screen.queryByPlaceholderText('Aggiungi una nota personale...')).toBeNull();
  });

  it('Salva chiama onSaveNota con il testo', async () => {
    const onSaveNota = vi.fn().mockResolvedValue(undefined);
    render(<ProntuarioDetail {...defaultProps} onSaveNota={onSaveNota} />);
    fireEvent.click(screen.getByText('Modifica'));
    const textarea = screen.getByPlaceholderText('Aggiungi una nota personale...');
    fireEvent.change(textarea, { target: { value: 'Nuova nota' } });
    fireEvent.click(screen.getByText('Salva'));
    expect(onSaveNota).toHaveBeenCalledWith('Nuova nota');
  });
});
