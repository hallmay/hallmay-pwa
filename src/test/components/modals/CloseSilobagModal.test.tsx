import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import CloseSiloBagModal from '../../../features/silobags/components/modals/CloseSilobagModal';
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
      formState: { 
        isSubmitting: false,
        errors: {}
      },
      reset: vi.fn(),
    }),
    Controller: ({ render }: any) => render({ 
      field: { name: 'test', value: '', onChange: vi.fn() },
      fieldState: { error: undefined }
    }),
  };
});

describe('CloseSiloBagModal Component', () => {
  const mockOnClose = vi.fn();
  const mockOnSubmit = vi.fn();

  const mockSilobag: Silobag = {
    id: '1',
    name: 'Silo Bag #1',
    initial_kg: 10000,
    current_kg: 3000,
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
        <CloseSiloBagModal
          isOpen={true}
          onClose={mockOnClose}
          siloBag={mockSilobag}
          onSubmit={mockOnSubmit}
        />
      </TestWrapper>
    );

    expect(screen.getByText('Cerrar Silo Bag #1')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(
      <TestWrapper>
        <CloseSiloBagModal
          isOpen={false}
          onClose={mockOnClose}
          siloBag={mockSilobag}
          onSubmit={mockOnSubmit}
        />
      </TestWrapper>
    );

    expect(screen.queryByText('Cerrar Silo Bag #1')).not.toBeInTheDocument();
  });

  it('shows warning message', () => {
    render(
      <TestWrapper>
        <CloseSiloBagModal
          isOpen={true}
          onClose={mockOnClose}
          siloBag={mockSilobag}
          onSubmit={mockOnSubmit}
        />
      </TestWrapper>
    );

    expect(screen.getByText(/Esta acción no se puede deshacer/)).toBeInTheDocument();
    expect(screen.getByText(/Cerrado/)).toBeInTheDocument();
  });

  it('shows form inputs', () => {
    render(
      <TestWrapper>
        <CloseSiloBagModal
          isOpen={true}
          onClose={mockOnClose}
          siloBag={mockSilobag}
          onSubmit={mockOnSubmit}
        />
      </TestWrapper>
    );

    expect(screen.getByText('Detalle del Cierre')).toBeInTheDocument();
  });

  it('displays action buttons', () => {
    render(
      <TestWrapper>
        <CloseSiloBagModal
          isOpen={true}
          onClose={mockOnClose}
          siloBag={mockSilobag}
          onSubmit={mockOnSubmit}
        />
      </TestWrapper>
    );

    expect(screen.getByText('Cancelar')).toBeInTheDocument();
    expect(screen.getByText('Confirmar Cierre')).toBeInTheDocument();
  });

  it('calls onClose when cancel is clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <CloseSiloBagModal
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

  it('handles form submission', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <CloseSiloBagModal
          isOpen={true}
          onClose={mockOnClose}
          siloBag={mockSilobag}
          onSubmit={mockOnSubmit}
        />
      </TestWrapper>
    );

    const submitButton = screen.getByText('Confirmar Cierre');
    await user.click(submitButton);
    
    expect(mockOnSubmit).toHaveBeenCalledTimes(1);
  });

  it('shows correct modal title', () => {
    render(
      <TestWrapper>
        <CloseSiloBagModal
          isOpen={true}
          onClose={mockOnClose}
          siloBag={mockSilobag}
          onSubmit={mockOnSubmit}
        />
      </TestWrapper>
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Cerrar Silo Bag #1')).toBeInTheDocument();
  });
});
