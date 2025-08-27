import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import StatusColumn from '../../../features/logistics/components/StatusColumn';
import TestWrapper from '../../mocks/TestWrapper';

// Mock TruckCard component
vi.mock('../../../features/logistics/components/TruckCard', () => ({
  default: ({ truck, openUpdateModal }: any) => (
    <div data-testid={`truck-card-${truck.id}`} onClick={() => openUpdateModal(truck)}>
      {truck.name}
    </div>
  ),
}));

const mockStatus = {
  shortLabel: 'En Tránsito',
  color: 'bg-blue-100 text-blue-800',
};

const mockTrucks = [
  { id: '1', name: 'Truck 001' },
  { id: '2', name: 'Truck 002' },
];

const mockOpenUpdateModal = vi.fn();

describe('StatusColumn Component', () => {
  it('renders status header with label and count', () => {
    render(
      <TestWrapper>
        <StatusColumn 
          status={mockStatus} 
          trucks={mockTrucks} 
          openUpdateModal={mockOpenUpdateModal} 
        />
      </TestWrapper>
    );

    expect(screen.getByText('En Tránsito')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('renders truck cards when trucks are available', () => {
    render(
      <TestWrapper>
        <StatusColumn 
          status={mockStatus} 
          trucks={mockTrucks} 
          openUpdateModal={mockOpenUpdateModal} 
        />
      </TestWrapper>
    );

    expect(screen.getByTestId('truck-card-1')).toBeInTheDocument();
    expect(screen.getByTestId('truck-card-2')).toBeInTheDocument();
  });

  it('renders empty state when no trucks are available', () => {
    render(
      <TestWrapper>
        <StatusColumn 
          status={mockStatus} 
          trucks={[]} 
          openUpdateModal={mockOpenUpdateModal} 
        />
      </TestWrapper>
    );

    expect(screen.getByText('No hay camiones')).toBeInTheDocument();
    expect(screen.queryByTestId('truck-card-1')).not.toBeInTheDocument();
  });

  it('applies correct CSS classes for status badge', () => {
    const { container } = render(
      <TestWrapper>
        <StatusColumn 
          status={mockStatus} 
          trucks={mockTrucks} 
          openUpdateModal={mockOpenUpdateModal} 
        />
      </TestWrapper>
    );

    const badge = container.querySelector('.bg-blue-100');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('text-blue-800');
  });

  it('applies responsive classes to main container', () => {
    const { container } = render(
      <TestWrapper>
        <StatusColumn 
          status={mockStatus} 
          trucks={mockTrucks} 
          openUpdateModal={mockOpenUpdateModal} 
        />
      </TestWrapper>
    );

    const mainContainer = container.querySelector('.flex-shrink-0');
    expect(mainContainer).toBeInTheDocument();
    expect(mainContainer).toHaveClass('w-72');
  });

  it('applies scroll classes to trucks container', () => {
    const { container } = render(
      <TestWrapper>
        <StatusColumn 
          status={mockStatus} 
          trucks={mockTrucks} 
          openUpdateModal={mockOpenUpdateModal} 
        />
      </TestWrapper>
    );

    const trucksContainer = container.querySelector('.overflow-y-auto');
    expect(trucksContainer).toBeInTheDocument();
    expect(trucksContainer).toHaveClass('md:max-h-none', 'md:overflow-y-visible');
  });

  it('displays correct truck count in badge', () => {
    const threeTrucks = [...mockTrucks, { id: '3', name: 'Truck 003' }];
    
    render(
      <TestWrapper>
        <StatusColumn 
          status={mockStatus} 
          trucks={threeTrucks} 
          openUpdateModal={mockOpenUpdateModal} 
        />
      </TestWrapper>
    );

    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('renders different status colors correctly', () => {
    const redStatus = {
      shortLabel: 'Detenido',
      color: 'bg-red-100 text-red-800',
    };

    const { container } = render(
      <TestWrapper>
        <StatusColumn 
          status={redStatus} 
          trucks={mockTrucks} 
          openUpdateModal={mockOpenUpdateModal} 
        />
      </TestWrapper>
    );

    expect(screen.getByText('Detenido')).toBeInTheDocument();
    const badge = container.querySelector('.bg-red-100');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('text-red-800');
  });
});
