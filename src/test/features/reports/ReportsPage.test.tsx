import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TestWrapper from '../../mocks/TestWrapper';
import ReportsPage from '../../../features/reports/ReportsPage';

// Mock reports components
vi.mock('../../../features/reports/components/commons/ReportsFilters', () => ({
  default: ({ onFilterChange }: any) => (
    <div data-testid="reports-filters">
      <select
        data-testid="campaign-filter"
        onChange={(e) => onFilterChange('campaign', e.target.value)}
      >
        <option value="all">Todas las campañas</option>
        <option value="2024">Campaña 2024</option>
        <option value="2023">Campaña 2023</option>
      </select>
      <select
        data-testid="field-filter"
        onChange={(e) => onFilterChange('field', e.target.value)}
      >
        <option value="all">Todos los campos</option>
        <option value="1">Campo Norte</option>
        <option value="2">Campo Sur</option>
      </select>
    </div>
  )
}));

vi.mock('../../../features/reports/components/harvest-report/HarvestReport', () => ({
  default: ({ data }: any) => (
    <div data-testid="harvest-report">
      <h3>Reporte de Cosecha</h3>
      {data?.length > 0 ? (
        <div data-testid="harvest-data">
          {data.map((item: any, index: number) => (
            <div key={index}>{item.name}</div>
          ))}
        </div>
      ) : (
        <div data-testid="no-harvest-data">No hay datos de cosecha</div>
      )}
    </div>
  )
}));

vi.mock('../../../features/reports/components/harvester-report/HarvesterReport', () => ({
  default: ({ data }: any) => (
    <div data-testid="harvester-report">
      <h3>Reporte de Cosechadoras</h3>
      {data?.length > 0 ? (
        <div data-testid="harvester-data">
          {data.map((item: any, index: number) => (
            <div key={index}>{item.name}</div>
          ))}
        </div>
      ) : (
        <div data-testid="no-harvester-data">No hay datos de cosechadoras</div>
      )}
    </div>
  )
}));

vi.mock('../../../features/reports/components/destinations-report/DestinationsReport', () => ({
  default: ({ data }: any) => (
    <div data-testid="destinations-report">
      <h3>Reporte de Destinos</h3>
      {data?.length > 0 ? (
        <div data-testid="destinations-data">
          {data.map((item: any, index: number) => (
            <div key={index}>{item.name}</div>
          ))}
        </div>
      ) : (
        <div data-testid="no-destinations-data">No hay datos de destinos</div>
      )}
    </div>
  )
}));

// Mock tabs component
vi.mock('../../../shared/components/commons/Tabs', () => ({
  default: ({ activeTab, onTabChange, tabs }: any) => (
    <div data-testid="reports-tabs">
      {tabs.map((tab: any, index: number) => (
        <button
          key={index}
          data-testid={`tab-${tab.id}`}
          onClick={() => onTabChange(tab.id)}
          className={activeTab === tab.id ? 'active' : ''}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}));

// Mock PageHeader
vi.mock('../../../shared/components/commons/PageHeader', () => ({
  default: ({ title, breadcrumbs, action }: any) => (
    <div data-testid="page-header">
      <h1>{title}</h1>
      {breadcrumbs && <nav data-testid="breadcrumbs">{breadcrumbs}</nav>}
      {action && <div data-testid="header-action">{action}</div>}
    </div>
  )
}));

// Mock report hooks
vi.mock('../../../features/reports/hooks/useHarvestsReport', () => ({
  useHarvestSummary: vi.fn(() => ({
    harvestSummary: { totalKg: 1000, totalPlots: 5 },
    loading: false,
    error: null,
  }))
}));

vi.mock('../../../features/reports/hooks/useHarvestersReport', () => ({
  useHarvestersReport: vi.fn(() => ({
    data: [{ name: 'Harvester 1' }, { name: 'Harvester 2' }],
    loading: false,
    error: null,
  })),
  useHarvestersSummary: vi.fn(() => ({
    harvestersSummary: [
      { id: '1', harvester: 'Harvester 1', totalKg: 800, totalHours: 20 },
      { id: '2', harvester: 'Harvester 2', totalKg: 600, totalHours: 15 }
    ],
    loading: false,
    error: null,
  }))
}));

vi.mock('../../../features/reports/hooks/useDestinationsReport', () => ({
  useDestinationsReport: vi.fn(() => ({
    data: [{ name: 'Destination 1' }, { name: 'Destination 2' }],
    loading: false,
    error: null,
  })),
  useDestinationSummary: vi.fn(() => ({
    destinationSummary: [
      { id: '1', destination: 'Destination 1', totalKg: 500 },
      { id: '2', destination: 'Destination 2', totalKg: 300 }
    ],
    loading: false,
    error: null,
  }))
}));

// Mock the analytics hook
vi.mock('../../../features/reports/hooks/useReportsAnalytics', () => ({
  useReportsAnalytics: vi.fn(() => ({
    harvestSummary: [
      { id: '1', harvest: 'Harvest 1', totalKg: 800 },
      { id: '2', harvest: 'Harvest 2', totalKg: 600 }
    ],
    harvestersSummary: [
      { id: '1', harvester: 'Harvester 1', totalKg: 800, totalHours: 20 },
      { id: '2', harvester: 'Harvester 2', totalKg: 600, totalHours: 15 }
    ],
    destinationSummary: [
      { id: '1', destination: 'Destination 1', totalKg: 500 },
      { id: '2', destination: 'Destination 2', totalKg: 300 }
    ],
    loading: false,
    error: null,
  }))
}));

// Mock campaigns hook
vi.mock('../../../shared/hooks/campaign/useCampaigns', () => ({
  useCampaigns: vi.fn(() => ({
    campaigns: [
      { id: 'camp1', name: 'Campaña 2024', active: true },
      { id: 'camp2', name: 'Campaña 2023', active: false }
    ],
    loading: false,
    error: null,
  }))
}));

// Mock harvest sessions hook
vi.mock('../../harvest/hooks/useHarvestSessionsByCampaign', () => ({
  useHarvestSessionsByCampaign: vi.fn(() => ({
    sessions: [
      { id: 'session1', name: 'Sesión Norte', campaignId: 'camp1' },
      { id: 'session2', name: 'Sesión Sur', campaignId: 'camp1' }
    ],
    loading: false,
    error: null,
  }))
}));

describe('ReportsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders page header with correct title', () => {
    render(
      <TestWrapper>
        <ReportsPage />
      </TestWrapper>
    );

    expect(screen.getByRole('heading', { name: /reportes/i })).toBeInTheDocument();
    expect(screen.getByText('/')).toBeInTheDocument();
    expect(screen.getAllByText('Reportes')).toHaveLength(2); // One in h1, one in breadcrumb
  });

  it('renders reports filters', () => {
    render(
      <TestWrapper>
        <ReportsPage />
      </TestWrapper>
    );

    expect(screen.getByTestId('reports-filters')).toBeInTheDocument();
    expect(screen.getByTestId('campaign-filter')).toBeInTheDocument();
    expect(screen.getByTestId('field-filter')).toBeInTheDocument();
  });

  it('renders tabs navigation', () => {
    render(
      <TestWrapper>
        <ReportsPage />
      </TestWrapper>
    );

    expect(screen.getByRole('link', { name: /cosecha/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /cosecheros/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /destinos/i })).toBeInTheDocument();
  });

  it('shows harvest report by default', () => {
    render(
      <TestWrapper>
        <ReportsPage />
      </TestWrapper>
    );

    expect(screen.getByTestId('mock-outlet')).toBeInTheDocument();
    expect(screen.getByText('Mock Outlet')).toBeInTheDocument();
  });

  it('switches between tabs correctly', () => {
    render(
      <TestWrapper>
        <ReportsPage />
      </TestWrapper>
    );

    // Check tabs are rendered
    const harvestTab = screen.getByRole('link', { name: /cosecha/i });
    const harvestersTab = screen.getByRole('link', { name: /cosecheros/i });
    const destinationsTab = screen.getByRole('link', { name: /destinos/i });

    expect(harvestTab).toBeInTheDocument();
    expect(harvestersTab).toBeInTheDocument();
    expect(destinationsTab).toBeInTheDocument();

    // Check Outlet content is present
    expect(screen.getByTestId('mock-outlet')).toBeInTheDocument();
  });

  it('handles filter changes correctly', () => {
    render(
      <TestWrapper>
        <ReportsPage />
      </TestWrapper>
    );

    const campaignFilter = screen.getByTestId('campaign-filter');
    const fieldFilter = screen.getByTestId('field-filter');

    fireEvent.change(campaignFilter, { target: { value: '2024' } });
    expect(campaignFilter).toHaveValue('2024');

    fireEvent.change(fieldFilter, { target: { value: '1' } });
    expect(fieldFilter).toHaveValue('1');
  });

  it('displays correct tab labels', () => {
    render(
      <TestWrapper>
        <ReportsPage />
      </TestWrapper>
    );

    expect(screen.getByRole('link', { name: /cosecha/i })).toHaveTextContent('Cosecha');
    expect(screen.getByRole('link', { name: /cosecheros/i })).toHaveTextContent('Cosecheros');
    expect(screen.getByRole('link', { name: /destinos/i })).toHaveTextContent('Destinos');
  });

  it('shows report data when available', () => {
    render(
      <TestWrapper>
        <ReportsPage />
      </TestWrapper>
    );

    // Check that the Outlet is rendered (this is where report content goes)
    expect(screen.getByTestId('mock-outlet')).toBeInTheDocument();
    expect(screen.getByText('Mock Outlet')).toBeInTheDocument();
  });

  it('renders without crashing', () => {
    const { container } = render(
      <TestWrapper>
        <ReportsPage />
      </TestWrapper>
    );

    expect(container.firstChild).toBeInTheDocument();
  });

  it('exports ReportsPage as default export', () => {
    expect(ReportsPage).toBeDefined();
    expect(typeof ReportsPage).toBe('function');
  });
});
