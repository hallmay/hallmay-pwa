import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TestWrapper from '../../mocks/TestWrapper';
import LogisticsPage from '../../../features/logistics/LogisticsPage';

// Mock logistics components
vi.mock('../../../features/logistics/components/LogisticsBoard', () => ({
  default: ({ organizedTasks = {} }: any) => (
    <div data-testid="logistics-board">
      <div>Logistics Board</div>
      {Object.entries(organizedTasks).map(([status, trucks]) => (
        <div key={status} data-testid={`status-column-${status}`}>
          {Array.isArray(trucks) && trucks.map((truck: any) => (
            <div key={truck.id} data-testid={`truck-${truck.id}`}>
              Camión {truck.order || '001'} - {truck.status}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}));

vi.mock('../../../features/logistics/components/LogisticsFilters', () => ({
  default: ({ onFiltersChange }: any) => (
    <div data-testid="logistics-filters">
      <select
        data-testid="driver-filter"
        onChange={(e) => onFiltersChange && onFiltersChange({ driver: e.target.value })}
      >
        <option value="all">Todos los choferes</option>
        <option value="1">Juan Pérez</option>
        <option value="2">María García</option>
      </select>
      <select
        data-testid="status-filter"
        onChange={(e) => onFiltersChange && onFiltersChange({ status: e.target.value })}
      >
        <option value="all">Todos los estados</option>
        <option value="loading">Cargando</option>
        <option value="transit">En tránsito</option>
        <option value="completed">Completado</option>
      </select>
    </div>
  )
}));

// Mock useLogistics hook
vi.mock('../../../features/logistics/hooks/useLogistics', () => ({
  useLogistics: vi.fn(() => ({
    logistics: [
      { 
        id: '1', 
        order: '001',
        name: 'Camión 001', 
        driver: 'Juan Pérez', 
        status: 'in-route-to-field',
        date: { toDate: () => new Date() }
      },
      { 
        id: '2', 
        order: '002',
        name: 'Camión 002', 
        driver: 'María García', 
        status: 'in-field',
        date: { toDate: () => new Date() }
      },
    ],
    loading: false,
    error: null,
    updateTruckStatus: vi.fn(),
  }))
}));

// Mock other required hooks
vi.mock('../../../shared/hooks/field/useCampaignFields', () => ({
  useCampaignFields: vi.fn(() => ({
    campaignFields: [
      { id: '1', name: 'Campo Norte' },
      { id: '2', name: 'Campo Sur' },
    ],
    loading: false,
  }))
}));

vi.mock('../../../shared/hooks/campaign/useActiveCampaign', () => ({
  useActiveCampaign: vi.fn(() => ({
    campaign: { id: '1', name: 'Campaña 2024' },
    loading: false,
  }))
}));

vi.mock('../../../shared/hooks/crop/useCrops', () => ({
  useCrops: vi.fn(() => ({
    crops: [
      { id: '1', name: 'Soja' },
      { id: '2', name: 'Maíz' },
    ],
    loading: false,
  }))
}));

// Mock PageHeader
vi.mock('../../../shared/components/layout/PageHeader', () => ({
  default: ({ title, breadcrumbs, children }: any) => (
    <div data-testid="page-header">
      <h1>{title}</h1>
      {breadcrumbs && (
        <nav data-testid="breadcrumbs">
          {breadcrumbs.map((crumb: any, index: number) => (
            <span key={index}>{crumb.label}</span>
          ))}
        </nav>
      )}
      {children && <div data-testid="header-action">{children}</div>}
    </div>
  )
}));

describe('LogisticsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders page header with correct title', () => {
    render(
      <TestWrapper>
        <LogisticsPage />
      </TestWrapper>
    );

    expect(screen.getByTestId('page-header')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /logística/i })).toBeInTheDocument();
    expect(screen.getByTestId('breadcrumbs')).toBeInTheDocument();
  });

  it('renders logistics filters', () => {
    render(
      <TestWrapper>
        <LogisticsPage />
      </TestWrapper>
    );

    expect(screen.getByTestId('logistics-filters')).toBeInTheDocument();
    expect(screen.getByTestId('driver-filter')).toBeInTheDocument();
    expect(screen.getByTestId('status-filter')).toBeInTheDocument();
  });

  it('renders logistics board', () => {
    render(
      <TestWrapper>
        <LogisticsPage />
      </TestWrapper>
    );

    expect(screen.getByTestId('logistics-board')).toBeInTheDocument();
    expect(screen.getByText('Logistics Board')).toBeInTheDocument();
  });

  it('displays trucks in the board', () => {
    render(
      <TestWrapper>
        <LogisticsPage />
      </TestWrapper>
    );

    expect(screen.getByTestId('truck-1')).toBeInTheDocument();
    expect(screen.getByTestId('truck-2')).toBeInTheDocument();
    expect(screen.getByText('Camión 001 - in-route-to-field')).toBeInTheDocument();
    expect(screen.getByText('Camión 002 - in-field')).toBeInTheDocument();
  });

  it('handles driver filter changes', () => {
    render(
      <TestWrapper>
        <LogisticsPage />
      </TestWrapper>
    );

    const driverFilter = screen.getByTestId('driver-filter');
    fireEvent.change(driverFilter, { target: { value: '1' } });

    expect(driverFilter).toHaveValue('1');
  });

  it('handles status filter changes', () => {
    render(
      <TestWrapper>
        <LogisticsPage />
      </TestWrapper>
    );

    const statusFilter = screen.getByTestId('status-filter');
    fireEvent.change(statusFilter, { target: { value: 'loading' } });

    expect(statusFilter).toHaveValue('loading');
  });

  it('shows correct filter options', () => {
    render(
      <TestWrapper>
        <LogisticsPage />
      </TestWrapper>
    );

    // Check driver filter options
    expect(screen.getByText('Todos los choferes')).toBeInTheDocument();
    expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
    expect(screen.getByText('María García')).toBeInTheDocument();

    // Check status filter options
    expect(screen.getByText('Todos los estados')).toBeInTheDocument();
    expect(screen.getByText('Cargando')).toBeInTheDocument();
    expect(screen.getByText('En tránsito')).toBeInTheDocument();
    expect(screen.getByText('Completado')).toBeInTheDocument();
  });

  it('renders without crashing', () => {
    const { container } = render(
      <TestWrapper>
        <LogisticsPage />
      </TestWrapper>
    );

    expect(container.firstChild).toBeInTheDocument();
  });

  it('exports LogisticsPage as default export', () => {
    expect(LogisticsPage).toBeDefined();
    expect(typeof LogisticsPage).toBe('function');
  });
});
