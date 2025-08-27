import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import SiloBagCard from '../../features/silobags/components/SilobagCard';
import { TestWrapper } from '../mocks/TestWrapper';
import type { Silobag } from '../../shared/types';

// Mock de formatNumber
vi.mock('../../shared/utils', () => ({
  formatNumber: (value: number) => value.toLocaleString()
}));

// Mock de react-router
vi.mock('react-router', () => ({
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to} role="link">{children}</a>
  ),
}));

describe('SiloBagCard Component', () => {
  const mockOnExtract = vi.fn();
  const mockOnClose = vi.fn();

  const mockActiveSilobag: Silobag = {
    id: '1',
    name: 'Silo Bag #1',
    initial_kg: 10000,
    current_kg: 7500,
    status: 'active',
    organization_id: 'org1',
    lost_kg: 0,
    difference_kg: 0,
    location: 'Campo A',
    crop: { id: 'crop1', name: 'Maíz' },
    field: { id: 'field1', name: 'Campo Norte' }
  };

  const mockClosedSilobag: Silobag = {
    ...mockActiveSilobag,
    id: '2',
    name: 'Silo Bag #2',
    status: 'closed',
    current_kg: 0,
    lost_kg: 500,
    difference_kg: -500
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });
  it('renders active silobag correctly', () => {
    render(
      <TestWrapper>
        <SiloBagCard 
          silo={mockActiveSilobag}
          onExtract={mockOnExtract}
          onClose={mockOnClose}
        />
      </TestWrapper>
    );

    expect(screen.getByText('Silo Bag #1')).toBeInTheDocument();
    expect(screen.getByText(/Maíz/)).toBeInTheDocument();
    expect(screen.getByText(/Campo Norte/)).toBeInTheDocument();
    expect(screen.getByText('7,500')).toBeInTheDocument();
    expect(screen.getByText('kgs')).toBeInTheDocument();
  });

  it('renders closed silobag correctly', () => {
    render(
      <TestWrapper>
        <SiloBagCard 
          silo={mockClosedSilobag} 
          onExtract={mockOnExtract} 
          onClose={mockOnClose} 
        />
      </TestWrapper>
    );

    expect(screen.getByText('Silo Bag #2')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText('kg')).toBeInTheDocument(); // singular for closed
  });

  it('shows progress bar for active silobag', () => {
    render(
      <TestWrapper>
        <SiloBagCard 
          silo={mockActiveSilobag} 
          onExtract={mockOnExtract} 
          onClose={mockOnClose} 
        />
      </TestWrapper>
    );

    const progressBar = document.querySelector('.bg-primary-darker');
    expect(progressBar).toBeInTheDocument();
    // 7500/10000 = 75%
    expect(progressBar).toHaveStyle('width: 75%');
  });

  it('shows difference badge for closed silobag with difference', () => {
    render(
      <TestWrapper>
        <SiloBagCard 
          silo={mockClosedSilobag} 
          onExtract={mockOnExtract} 
          onClose={mockOnClose} 
        />
      </TestWrapper>
    );

    expect(screen.getByText('500 kg de mas')).toBeInTheDocument();
    // Should show green badge for negative difference (more than expected)
    const badge = screen.getByText('500 kg de mas').closest('div');
    expect(badge).toHaveClass('bg-green-100', 'text-green-800');
  });

  it('shows loss badge correctly', () => {
    const silobagWithLoss = {
      ...mockClosedSilobag,
      difference_kg: 300 // 300kg de menos
    };

    render(
      <TestWrapper>
        <SiloBagCard 
          silo={silobagWithLoss} 
          onExtract={mockOnExtract} 
          onClose={mockOnClose} 
        />
      </TestWrapper>
    );

    expect(screen.getByText('300 kg de menos')).toBeInTheDocument();
    // Should show red badge for positive difference (less than expected)
    const badge = screen.getByText('300 kg de menos').closest('div');
    expect(badge).toHaveClass('bg-red-100', 'text-red-800');
  });

  it('renders action buttons for active silobag', () => {
    render(
      <TestWrapper>
        <SiloBagCard 
          silo={mockActiveSilobag} 
          onExtract={mockOnExtract} 
          onClose={mockOnClose} 
        />
      </TestWrapper>
    );

    expect(screen.getByText('Extraer')).toBeInTheDocument();
    expect(screen.getByText('Cerrar')).toBeInTheDocument();
  });

  it('does not render action buttons for closed silobag', () => {
    render(
      <TestWrapper>
        <SiloBagCard 
          silo={mockClosedSilobag} 
          onExtract={mockOnExtract} 
          onClose={mockOnClose} 
        />
      </TestWrapper>
    );

    expect(screen.queryByText('Extraer')).not.toBeInTheDocument();
    expect(screen.queryByText('Cerrar')).not.toBeInTheDocument();
  });

  it('calls onExtract when extract button is clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <SiloBagCard 
          silo={mockActiveSilobag} 
          onExtract={mockOnExtract} 
          onClose={mockOnClose} 
        />
      </TestWrapper>
    );

    await user.click(screen.getByText('Extraer'));
    expect(mockOnExtract).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when close button is clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <SiloBagCard 
          silo={mockActiveSilobag} 
          onExtract={mockOnExtract} 
          onClose={mockOnClose} 
        />
      </TestWrapper>
    );

    await user.click(screen.getByText('Cerrar'));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('applies different styling for closed silobag', () => {
    const { container } = render(
      <TestWrapper>
        <SiloBagCard 
          silo={mockClosedSilobag} 
          onExtract={mockOnExtract} 
          onClose={mockOnClose} 
        />
      </TestWrapper>
    );

    const card = container.querySelector('.bg-gray-100');
    expect(card).toBeInTheDocument();
    expect(card).toHaveClass('opacity-80');
  });

  it('renders link to silobag detail page', () => {
    render(
      <TestWrapper>
        <SiloBagCard 
          silo={mockActiveSilobag} 
          onExtract={mockOnExtract} 
          onClose={mockOnClose} 
        />
      </TestWrapper>
    );

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/silo-bags/1');
  });

  it('handles zero initial kg without errors', () => {
    const zeroInitialSilobag = {
      ...mockActiveSilobag,
      initial_kg: 0,
      current_kg: 0
    };

    render(
      <TestWrapper>
        <SiloBagCard 
          silo={zeroInitialSilobag} 
          onExtract={mockOnExtract} 
          onClose={mockOnClose} 
        />
      </TestWrapper>
    );

    const progressBar = document.querySelector('.bg-primary-darker');
    expect(progressBar).toHaveStyle('width: 0%');
  });

  it('does not show difference badge when difference is zero', () => {
    const noDifferenceSilobag = {
      ...mockClosedSilobag,
      difference_kg: 0
    };

    render(
      <TestWrapper>
        <SiloBagCard 
          silo={noDifferenceSilobag} 
          onExtract={mockOnExtract} 
          onClose={mockOnClose} 
        />
      </TestWrapper>
    );

    expect(screen.queryByText(/kg de/)).not.toBeInTheDocument();
  });
});
