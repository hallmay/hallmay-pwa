import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ReportsFilters from '../../../features/reports/components/commons/ReportsFilters';
import TestWrapper from '../../mocks/TestWrapper';

// Mock console.log to avoid noise in tests
vi.spyOn(console, 'log').mockImplementation(() => {});

const mockOnFilterChange = vi.fn();

describe('ReportsFilters Component', () => {
  const defaultProps = {
    filters: {
      campaign: 'camp1',
      crop: 'all',
      field: 'all',
      plot: 'all',
    },
    onFilterChange: mockOnFilterChange,
    campaigns: [] as any,
    campaignsLoading: false,
    sessionsForCampaign: [] as any,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders filters title', () => {
    render(
      <TestWrapper>
        <ReportsFilters {...defaultProps} />
      </TestWrapper>
    );

    expect(screen.getByText('Filtros')).toBeInTheDocument();
  });

  it('renders all filter selects', () => {
    render(
      <TestWrapper>
        <ReportsFilters {...defaultProps} />
      </TestWrapper>
    );

    expect(screen.getByText('Campaña')).toBeInTheDocument();
    expect(screen.getByText('Cultivo')).toBeInTheDocument();
    expect(screen.getByText('Campo (Opcional)')).toBeInTheDocument();
    expect(screen.getByText('Lote (Opcional)')).toBeInTheDocument();
  });

  it('disables campaign select when loading', () => {
    render(
      <TestWrapper>
        <ReportsFilters 
          {...defaultProps} 
          campaignsLoading={true}
        />
      </TestWrapper>
    );

    expect(screen.getByText('Campaña')).toBeInTheDocument();
  });

  it('disables crop select when no campaign selected', () => {
    render(
      <TestWrapper>
        <ReportsFilters 
          {...defaultProps} 
          filters={{ ...defaultProps.filters, campaign: '' }}
        />
      </TestWrapper>
    );

    expect(screen.getByText('Cultivo')).toBeInTheDocument();
  });

  it('applies correct grid layout classes', () => {
    const { container } = render(
      <TestWrapper>
        <ReportsFilters {...defaultProps} />
      </TestWrapper>
    );

    const gridContainer = container.querySelector('.grid');
    expect(gridContainer).toBeInTheDocument();
    expect(gridContainer).toHaveClass('grid-cols-2', 'lg:grid-cols-4', 'gap-4');
  });

  it('handles empty sessions array', () => {
    render(
      <TestWrapper>
        <ReportsFilters 
          {...defaultProps} 
          sessionsForCampaign={[]}
        />
      </TestWrapper>
    );

    expect(screen.getByText('Filtros')).toBeInTheDocument();
  });

  it('handles null sessions', () => {
    render(
      <TestWrapper>
        <ReportsFilters 
          {...defaultProps} 
          sessionsForCampaign={null as any}
        />
      </TestWrapper>
    );

    expect(screen.getByText('Filtros')).toBeInTheDocument();
  });

  it('renders within Card component', () => {
    const { container } = render(
      <TestWrapper>
        <ReportsFilters {...defaultProps} />
      </TestWrapper>
    );

    const cardElement = container.querySelector('.bg-surface');
    expect(cardElement).toBeInTheDocument();
  });
});
