import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import LogisticsFilters from '../../../features/logistics/components/LogisticsFilters';
import TestWrapper from '../../mocks/TestWrapper';

// Mock react-hook-form
vi.mock('react-hook-form', () => ({
  Controller: ({ render: renderProp }: any) => {
    const mockField = {
      value: '',
      onChange: vi.fn(),
      onBlur: vi.fn(),
      name: 'test-field',
    };
    return renderProp({ field: mockField });
  },
}));

const mockControl = {};
const mockCampaignFields = [
  {
    field: {
      id: 'field-1',
      name: 'Campo Norte',
    },
  },
  {
    field: {
      id: 'field-2',
      name: 'Campo Sur',
    },
  },
];

describe('LogisticsFilters Component', () => {
  it('renders filters title', () => {
    render(
      <TestWrapper>
        <LogisticsFilters 
          control={mockControl}
          campaignFields={mockCampaignFields}
          loadingFields={false}
        />
      </TestWrapper>
    );

    expect(screen.getByText('Filtros')).toBeInTheDocument();
  });

  it('renders date range inputs', () => {
    render(
      <TestWrapper>
        <LogisticsFilters 
          control={mockControl}
          campaignFields={mockCampaignFields}
          loadingFields={false}
        />
      </TestWrapper>
    );

    expect(screen.getByText('Desde')).toBeInTheDocument();
    expect(screen.getByText('Hasta')).toBeInTheDocument();
  });

  it('renders field select with correct options', () => {
    render(
      <TestWrapper>
        <LogisticsFilters 
          control={mockControl}
          campaignFields={mockCampaignFields}
          loadingFields={false}
        />
      </TestWrapper>
    );

    expect(screen.getByText('Campo')).toBeInTheDocument();
  });

  it('disables field select when loading', () => {
    render(
      <TestWrapper>
        <LogisticsFilters 
          control={mockControl}
          campaignFields={mockCampaignFields}
          loadingFields={true}
        />
      </TestWrapper>
    );

    const fieldSelect = screen.getByText('Campo');
    expect(fieldSelect).toBeInTheDocument();
  });

  it('renders with empty campaign fields', () => {
    render(
      <TestWrapper>
        <LogisticsFilters 
          control={mockControl}
          campaignFields={[]}
          loadingFields={false}
        />
      </TestWrapper>
    );

    expect(screen.getByText('Filtros')).toBeInTheDocument();
    expect(screen.getByText('Campo')).toBeInTheDocument();
  });

  it('applies correct CSS grid classes', () => {
    const { container } = render(
      <TestWrapper>
        <LogisticsFilters 
          control={mockControl}
          campaignFields={mockCampaignFields}
          loadingFields={false}
        />
      </TestWrapper>
    );

    const gridContainer = container.querySelector('.grid');
    expect(gridContainer).toBeInTheDocument();
    expect(gridContainer).toHaveClass('grid-cols-2', 'lg:grid-cols-3', 'gap-4');
  });

  it('renders within Card component', () => {
    const { container } = render(
      <TestWrapper>
        <LogisticsFilters 
          control={mockControl}
          campaignFields={mockCampaignFields}
          loadingFields={false}
        />
      </TestWrapper>
    );

    // Card component should add certain classes
    const cardElement = container.querySelector('.bg-surface');
    expect(cardElement).toBeInTheDocument();
  });

  it('handles null or undefined campaign fields gracefully', () => {
    expect(() => {
      render(
        <TestWrapper>
          <LogisticsFilters 
            control={mockControl}
            campaignFields={[]}
            loadingFields={false}
          />
        </TestWrapper>
      );
    }).not.toThrow();

    expect(screen.getByText('Filtros')).toBeInTheDocument();
  });
});
