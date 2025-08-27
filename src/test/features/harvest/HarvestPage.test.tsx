import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import TestWrapper from '../../mocks/TestWrapper';
import HarvestPage from '../../../features/harvest/HarvestPage';
import { useActiveCampaign } from '../../../shared/hooks/campaign/useActiveCampaign';

// Mock PageHeader
vi.mock('../../../shared/components/layout/PageHeader', () => ({
  default: ({ title, breadcrumbs, action }: any) => (
    <div data-testid="page-header">
      <h1>{title}</h1>
      {breadcrumbs && <nav data-testid="breadcrumbs">{breadcrumbs.map((crumb: any, i: number) => <span key={i}>{crumb.label}</span>)}</nav>}
      {action && <div data-testid="header-action">{action}</div>}
    </div>
  )
}));

// Mock PageLoader
vi.mock('../../../shared/components/layout/PageLoader', () => ({
  default: ({ title }: any) => (
    <div data-testid="page-loader">
      <h1>{title}</h1>
      <p>Cargando datos...</p>
    </div>
  )
}));

// Mock Select
vi.mock('../../../shared/components/form/Select', () => ({
  default: ({ label, items, value, onChange, disabled }: any) => (
    <div>
      <label htmlFor="field-select">{label}</label>
      <select 
        id="field-select"
        data-testid="field-select"
        value={value} 
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      >
        {items.map((item: any) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>
    </div>
  )
}));

// Mock SessionsListSection
vi.mock('../../../features/harvest/components/SessionListSection', () => ({
  default: ({ sessions, loading }: any) => (
    <div data-testid="sessions-list-section">
      {loading ? (
        <p>Cargando sesiones...</p>
      ) : (
        <div>
          {sessions.length > 0 ? (
            sessions.map((session: any, i: number) => (
              <div key={i} data-testid="harvest-session">
                {session.name}
              </div>
            ))
          ) : (
            <p>No hay sesiones de cosecha</p>
          )}
        </div>
      )}
    </div>
  )
}));

// Mock hooks
vi.mock('../../../shared/hooks/campaign/useActiveCampaign', () => ({
  useActiveCampaign: vi.fn(() => ({
    campaign: { id: '1', name: 'Campaña 2024' },
    loading: false,
    error: null
  }))
}));

vi.mock('../../../shared/hooks/field/useCampaignFields', () => ({
  useCampaignFields: vi.fn(() => ({
    campaignFields: [
      { field: { id: '1', name: 'Campo Norte' } },
      { field: { id: '2', name: 'Campo Sur' } }
    ],
    loading: false,
    error: null
  }))
}));

vi.mock('../../../features/harvest/hooks/useActiveHarvestSessions', () => ({
  useActiveHarvestSessions: vi.fn(() => ({
    sessions: [
      { id: '1', name: 'Sesión 1' },
      { id: '2', name: 'Sesión 2' }
    ],
    loading: false
  }))
}));

describe('HarvestPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders page header with correct title', () => {
    render(
      <TestWrapper>
        <HarvestPage />
      </TestWrapper>
    );

    expect(screen.getByTestId('page-header')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /cosecha actual/i })).toBeInTheDocument();
    expect(screen.getByTestId('breadcrumbs')).toBeInTheDocument();
  });

  it('renders field filter', () => {
    render(
      <TestWrapper>
        <HarvestPage />
      </TestWrapper>
    );

    expect(screen.getByTestId('field-select')).toBeInTheDocument();
    expect(screen.getByLabelText(/campo/i)).toBeInTheDocument();
  });

  it('renders sessions list section', () => {
    render(
      <TestWrapper>
        <HarvestPage />
      </TestWrapper>
    );

    expect(screen.getByTestId('sessions-list-section')).toBeInTheDocument();
    expect(screen.getAllByTestId('harvest-session')).toHaveLength(2);
  });

  it('shows loading state when data is loading', () => {
    vi.mocked(useActiveCampaign).mockReturnValue({
      campaign: null,
      loading: true,
      error: null
    });

    render(
      <TestWrapper>
        <HarvestPage />
      </TestWrapper>
    );

    expect(screen.getByTestId('page-loader')).toBeInTheDocument();
    expect(screen.getByText('Cargando datos...')).toBeInTheDocument();
  });

  it('shows error state when campaign fails to load', () => {
    vi.mocked(useActiveCampaign).mockReturnValue({
      campaign: null,
      loading: false,
      error: 'Error al cargar campaña'
    });

    render(
      <TestWrapper>
        <HarvestPage />
      </TestWrapper>
    );

    expect(screen.getByText(/error al cargar la campaña/i)).toBeInTheDocument();
  });

  it('shows no active campaign message', () => {
    vi.mocked(useActiveCampaign).mockReturnValue({
      campaign: null,
      loading: false,
      error: null
    });

    render(
      <TestWrapper>
        <HarvestPage />
      </TestWrapper>
    );

    expect(screen.getByText(/no hay una campaña activa configurada/i)).toBeInTheDocument();
  });

  it('renders without crashing', () => {
    render(
      <TestWrapper>
        <HarvestPage />
      </TestWrapper>
    );

    expect(screen.getByTestId('page-header')).toBeInTheDocument();
  });

  it('exports HarvestPage as default export', () => {
    expect(HarvestPage).toBeDefined();
    expect(typeof HarvestPage).toBe('function');
  });
});
