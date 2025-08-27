import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TruckCard from '../../../features/logistics/components/TruckCard';
import type { Logistics } from '../../../shared/types';

// Mock date-fns
vi.mock('date-fns', () => ({
  format: vi.fn((_date, _formatStr) => '25/08/2025'),
}));

// Mock Card component
vi.mock('../../../shared/components/commons/Card', () => ({
  default: ({ children, className, onClick }: any) => (
    <div data-testid="truck-card" className={className} onClick={onClick}>
      {children}
    </div>
  )
}));

describe('TruckCard Component', () => {
  const mockDate = {
    toDate: () => new Date('2025-08-25'),
  };

  const baseTruck: Logistics = {
    id: '1',
    order: 123,
    date: mockDate as any,
    field: { id: 'field1', name: 'Campo Norte' },
    company: 'Transportes SA',
    crop: { id: 'crop1', name: 'Soja' },
    driver: 'Juan Pérez',
    details: 'Camión en buen estado, carga completa',
  } as Logistics;

  const mockOpenUpdateModal = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders truck card with all information', () => {
    render(<TruckCard truck={baseTruck} openUpdateModal={mockOpenUpdateModal} />);

    expect(screen.getByText('Camión Nro. 123')).toBeInTheDocument();
    expect(screen.getByText('25/08/2025')).toBeInTheDocument();
    expect(screen.getByText('Campo Norte')).toBeInTheDocument();
    expect(screen.getByText('Transportes SA')).toBeInTheDocument();
    expect(screen.getByText('Soja')).toBeInTheDocument();
    expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
    expect(screen.getByText('Camión en buen estado, carga completa')).toBeInTheDocument();
  });

  it('renders without details when not provided', () => {
    const truckWithoutDetails = { ...baseTruck, details: undefined };
    render(<TruckCard truck={truckWithoutDetails} openUpdateModal={mockOpenUpdateModal} />);

    expect(screen.getByText('Camión Nro. 123')).toBeInTheDocument();
    expect(screen.queryByText('Camión en buen estado, carga completa')).not.toBeInTheDocument();
  });

  it('handles missing field information', () => {
    const truckWithoutField = { ...baseTruck, field: null };
    render(<TruckCard truck={truckWithoutField} openUpdateModal={mockOpenUpdateModal} />);

    expect(screen.getByText('No especificado')).toBeInTheDocument();
  });

  it('handles missing crop information', () => {
    const truckWithoutCrop = { ...baseTruck, crop: null };
    render(<TruckCard truck={truckWithoutCrop} openUpdateModal={mockOpenUpdateModal} />);

    // Should find "No especificado" in the crop section
    const noSpecifiedElements = screen.getAllByText('No especificado');
    expect(noSpecifiedElements.length).toBeGreaterThan(0);
  });

  it('handles missing driver information', () => {
    const truckWithoutDriver = { ...baseTruck, driver: '' };
    render(<TruckCard truck={truckWithoutDriver} openUpdateModal={mockOpenUpdateModal} />);

    expect(screen.getByText('No especificado')).toBeInTheDocument();
  });

  it('calls openUpdateModal when clicked', () => {
    render(<TruckCard truck={baseTruck} openUpdateModal={mockOpenUpdateModal} />);

    const card = screen.getByTestId('truck-card');
    fireEvent.click(card);

    expect(mockOpenUpdateModal).toHaveBeenCalledWith(baseTruck);
    expect(mockOpenUpdateModal).toHaveBeenCalledTimes(1);
  });

  it('applies compact styles when isCompact is true', () => {
    render(<TruckCard truck={baseTruck} isCompact={true} openUpdateModal={mockOpenUpdateModal} />);

    const card = screen.getByTestId('truck-card');
    expect(card).toHaveClass('p-4');
  });

  it('applies regular styles when isCompact is false', () => {
    render(<TruckCard truck={baseTruck} isCompact={false} openUpdateModal={mockOpenUpdateModal} />);

    const card = screen.getByTestId('truck-card');
    expect(card).toHaveClass('p-5');
  });

  it('applies default styles when isCompact is not provided', () => {
    render(<TruckCard truck={baseTruck} openUpdateModal={mockOpenUpdateModal} />);

    const card = screen.getByTestId('truck-card');
    expect(card).toHaveClass('p-5');
  });

  it('displays proper labels for each field', () => {
    render(<TruckCard truck={baseTruck} openUpdateModal={mockOpenUpdateModal} />);

    expect(screen.getByText('Campo')).toBeInTheDocument();
    expect(screen.getByText('Logística')).toBeInTheDocument();
    expect(screen.getByText('Cultivo')).toBeInTheDocument();
    expect(screen.getByText('Conductor')).toBeInTheDocument();
  });

  it('has proper hover and cursor styles', () => {
    render(<TruckCard truck={baseTruck} openUpdateModal={mockOpenUpdateModal} />);

    const card = screen.getByTestId('truck-card');
    expect(card).toHaveClass(
      'cursor-pointer',
      'hover:shadow-lg',
      'hover:border-primary-light',
      'transition-all',
      'duration-200',
      'group'
    );
  });

  it('handles empty details gracefully', () => {
    const truckWithEmptyDetails = { ...baseTruck, details: '' };
    render(<TruckCard truck={truckWithEmptyDetails} openUpdateModal={mockOpenUpdateModal} />);

    // Details section should not be rendered
    expect(screen.queryByTestId('details-section')).not.toBeInTheDocument();
  });

  it('displays details section when details are provided', () => {
    render(<TruckCard truck={baseTruck} openUpdateModal={mockOpenUpdateModal} />);

    expect(screen.getByText('Camión en buen estado, carga completa')).toBeInTheDocument();
  });

  it('renders all required icons', () => {
    render(<TruckCard truck={baseTruck} openUpdateModal={mockOpenUpdateModal} />);

    const card = screen.getByTestId('truck-card');
    // Check that icons are present by looking for SVG elements
    const svgElements = card.querySelectorAll('svg');
    
    // Should have at least Map, Truck, Wheat, User, MessageSquare, ChevronRight icons
    expect(svgElements.length).toBeGreaterThanOrEqual(6);
  });

  it('handles truck with minimum required fields', () => {
    const minimalTruck: Logistics = {
      id: '2',
      order: 456,
      date: mockDate as any,
    } as Logistics;

    render(<TruckCard truck={minimalTruck} openUpdateModal={mockOpenUpdateModal} />);

    expect(screen.getByText('Camión Nro. 456')).toBeInTheDocument();
    expect(screen.getByText('25/08/2025')).toBeInTheDocument();
  });
});
