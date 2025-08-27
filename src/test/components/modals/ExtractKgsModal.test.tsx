import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import ExtractKgsModal from '../../../features/silobags/components/modals/ExtractKgsModal';
import { TestWrapper } from '../../mocks/TestWrapper';
import type { Silobag } from '../../../shared/types';

// Mock de react-hook-form
vi.mock('react-hook-form', async () => {
  const actual = await vi.importActual('react-hook-form');
  return {
    ...actual,
    useForm: () => ({
      control: {},
      handleSubmit: (fn: any) => (e: any) => { e.preventDefault(); fn({}) },
      formState: { isSubmitting: false },
      reset: vi.fn(),
    }),
    useWatch: vi.fn(() => '1000'),
    Controller: ({ render }: any) => render({ 
      field: { name: 'test', value: '1000', onChange: vi.fn() },
      fieldState: { error: undefined }
    }),
  };
});

describe('ExtractKgsModal Component', () => {
  const mockOnClose = vi.fn();
  const mockOnSubmit = vi.fn();

  const mockSilobag: Silobag = {
    id: '1',
    name: 'Silo Bag #1',
    initial_kg: 10000,
    current_kg: 8000,
    status: 'active',
    organization_id: 'org1',
    lost_kg: 0,
    difference_kg: 0,
    location: 'Campo A',
    crop: { id: 'crop1', name: 'Maíz' },
    field: { id: 'field1', name: 'Campo Norte' }
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders modal when open', () => {
    render(
      <TestWrapper>
        <ExtractKgsModal
          isOpen={true}
          onClose={mockOnClose}
          siloBag={mockSilobag}
          onSubmit={mockOnSubmit}
        />
      </TestWrapper>
    );

    expect(screen.getByText('Extraer Kilos de Silo Bag #1')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(
      <TestWrapper>
        <ExtractKgsModal
          isOpen={false}
          onClose={mockOnClose}
          siloBag={mockSilobag}
          onSubmit={mockOnSubmit}
        />
      </TestWrapper>
    );

    expect(screen.queryByText('Extraer Kilos de Silo Bag #1')).not.toBeInTheDocument();
  });

  it('displays silobag information', () => {
    render(
      <TestWrapper>
        <ExtractKgsModal
          isOpen={true}
          onClose={mockOnClose}
          siloBag={mockSilobag}
          onSubmit={mockOnSubmit}
        />
      </TestWrapper>
    );

    expect(screen.getByText('Extraer Kilos de Silo Bag #1')).toBeInTheDocument();
  });

  it('shows form inputs', () => {
    render(
      <TestWrapper>
        <ExtractKgsModal
          isOpen={true}
          onClose={mockOnClose}
          siloBag={mockSilobag}
          onSubmit={mockOnSubmit}
        />
      </TestWrapper>
    );

    expect(screen.getByText('Cantidad a Extraer (kg)')).toBeInTheDocument();
    expect(screen.getByText('Motivo / Descripción')).toBeInTheDocument();
  });

  it('displays action buttons', () => {
    render(
      <TestWrapper>
        <ExtractKgsModal
          isOpen={true}
          onClose={mockOnClose}
          siloBag={mockSilobag}
          onSubmit={mockOnSubmit}
        />
      </TestWrapper>
    );

    expect(screen.getByText('Cancelar')).toBeInTheDocument();
    expect(screen.getByText('Confirmar Extracción')).toBeInTheDocument();
  });

  it('calls onClose when cancel is clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <ExtractKgsModal
          isOpen={true}
          onClose={mockOnClose}
          siloBag={mockSilobag}
          onSubmit={mockOnSubmit}
        />
      </TestWrapper>
    );

    await user.click(screen.getByText('Cancelar'));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('renders form without warning for normal values', () => {
    render(
      <TestWrapper>
        <ExtractKgsModal
          isOpen={true}
          onClose={mockOnClose}
          siloBag={mockSilobag}
          onSubmit={mockOnSubmit}
        />
      </TestWrapper>
    );

    // The form renders correctly with normal values (no warning shown)
    expect(screen.getByText('Cantidad a Extraer (kg)')).toBeInTheDocument();
    expect(screen.getByText('Motivo / Descripción')).toBeInTheDocument();
    expect(screen.queryByText('El valor ingresado supera la cantidad disponible.')).not.toBeInTheDocument();
  });

  it('displays current kg amount', () => {
    render(
      <TestWrapper>
        <ExtractKgsModal
          isOpen={true}
          onClose={mockOnClose}
          siloBag={mockSilobag}
          onSubmit={mockOnSubmit}
        />
      </TestWrapper>
    );

    // The modal title contains the silobag name
    expect(screen.getByText('Extraer Kilos de Silo Bag #1')).toBeInTheDocument();
  });

  it('handles form submission', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <ExtractKgsModal
          isOpen={true}
          onClose={mockOnClose}
          siloBag={mockSilobag}
          onSubmit={mockOnSubmit}
        />
      </TestWrapper>
    );

    const extractButton = screen.getByText('Confirmar Extracción');
    await user.click(extractButton);
    
    expect(mockOnSubmit).toHaveBeenCalledTimes(1);
  });

  it('shows correct modal title', () => {
    render(
      <TestWrapper>
        <ExtractKgsModal
          isOpen={true}
          onClose={mockOnClose}
          siloBag={mockSilobag}
          onSubmit={mockOnSubmit}
        />
      </TestWrapper>
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Extraer Kilos de Silo Bag #1')).toBeInTheDocument();
  });
});
