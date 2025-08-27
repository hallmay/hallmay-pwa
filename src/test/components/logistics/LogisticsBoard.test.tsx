import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import LogisticsBoard from '../../../features/logistics/components/LogisticsBoard';
import TestWrapper from '../../mocks/TestWrapper';

// Mock StatusColumn component
vi.mock('../../../features/logistics/components/StatusColumn', () => ({
  default: ({ status, trucks }: any) => (
    <div data-testid={`status-column-${status.value}`}>
      <h3>{status.shortLabel}</h3>
      <div>Trucks: {trucks.length}</div>
    </div>
  ),
}));

const mockStatusOptions = [
  {
    value: 'pending',
    shortLabel: 'Pendiente',
    color: 'bg-yellow-100 text-yellow-800',
  },
  {
    value: 'in_transit',
    shortLabel: 'En Tránsito',
    color: 'bg-blue-100 text-blue-800',
  },
  {
    value: 'completed',
    shortLabel: 'Completado',
    color: 'bg-green-100 text-green-800',
  },
];

const mockOrganizedTasks = {
  pending: [
    { id: '1', name: 'Truck 001' },
    { id: '2', name: 'Truck 002' },
  ],
  in_transit: [
    { id: '3', name: 'Truck 003' },
  ],
  completed: [],
};

const mockOpenUpdateModal = vi.fn();

describe('LogisticsBoard Component', () => {
  it('renders status columns for all status options', () => {
    render(
      <TestWrapper>
        <LogisticsBoard 
          organizedTasks={mockOrganizedTasks}
          statusOptions={mockStatusOptions}
          openUpdateModal={mockOpenUpdateModal}
        />
      </TestWrapper>
    );

    expect(screen.getByTestId('status-column-pending')).toBeInTheDocument();
    expect(screen.getByTestId('status-column-in_transit')).toBeInTheDocument();
    expect(screen.getByTestId('status-column-completed')).toBeInTheDocument();
  });

  it('displays correct status labels', () => {
    render(
      <TestWrapper>
        <LogisticsBoard 
          organizedTasks={mockOrganizedTasks}
          statusOptions={mockStatusOptions}
          openUpdateModal={mockOpenUpdateModal}
        />
      </TestWrapper>
    );

    expect(screen.getByText('Pendiente')).toBeInTheDocument();
    expect(screen.getByText('En Tránsito')).toBeInTheDocument();
    expect(screen.getByText('Completado')).toBeInTheDocument();
  });

  it('passes correct truck counts to status columns', () => {
    render(
      <TestWrapper>
        <LogisticsBoard 
          organizedTasks={mockOrganizedTasks}
          statusOptions={mockStatusOptions}
          openUpdateModal={mockOpenUpdateModal}
        />
      </TestWrapper>
    );

    expect(screen.getByText('Trucks: 2')).toBeInTheDocument(); // pending
    expect(screen.getByText('Trucks: 1')).toBeInTheDocument(); // in_transit
    expect(screen.getByText('Trucks: 0')).toBeInTheDocument(); // completed
  });

  it('handles empty organized tasks gracefully', () => {
    render(
      <TestWrapper>
        <LogisticsBoard 
          organizedTasks={{}}
          statusOptions={mockStatusOptions}
          openUpdateModal={mockOpenUpdateModal}
        />
      </TestWrapper>
    );

    // All columns should show 0 trucks
    const trucksElements = screen.getAllByText(/Trucks: 0/);
    expect(trucksElements).toHaveLength(3);
  });

  it('handles empty status options', () => {
    render(
      <TestWrapper>
        <LogisticsBoard 
          organizedTasks={mockOrganizedTasks}
          statusOptions={[]}
          openUpdateModal={mockOpenUpdateModal}
        />
      </TestWrapper>
    );

    // No status columns should be rendered
    expect(screen.queryByTestId(/status-column/)).not.toBeInTheDocument();
  });

  it('applies correct CSS classes for responsive behavior', () => {
    const { container } = render(
      <TestWrapper>
        <LogisticsBoard 
          organizedTasks={mockOrganizedTasks}
          statusOptions={mockStatusOptions}
          openUpdateModal={mockOpenUpdateModal}
        />
      </TestWrapper>
    );

    const boardContainer = container.querySelector('.flex');
    expect(boardContainer).toBeInTheDocument();
    expect(boardContainer).toHaveClass('gap-4', 'overflow-x-auto', 'pb-4');
  });

  it('renders columns in correct order', () => {
    const { container } = render(
      <TestWrapper>
        <LogisticsBoard 
          organizedTasks={mockOrganizedTasks}
          statusOptions={mockStatusOptions}
          openUpdateModal={mockOpenUpdateModal}
        />
      </TestWrapper>
    );

    const columns = container.querySelectorAll('[data-testid^="status-column-"]');
    expect(columns[0]).toHaveAttribute('data-testid', 'status-column-pending');
    expect(columns[1]).toHaveAttribute('data-testid', 'status-column-in_transit');
    expect(columns[2]).toHaveAttribute('data-testid', 'status-column-completed');
  });

  it('handles missing status in organized tasks', () => {
    const incompleteOrganizedTasks = {
      pending: [{ id: '1', name: 'Truck 001' }],
      // missing in_transit and completed
    };

    render(
      <TestWrapper>
        <LogisticsBoard 
          organizedTasks={incompleteOrganizedTasks}
          statusOptions={mockStatusOptions}
          openUpdateModal={mockOpenUpdateModal}
        />
      </TestWrapper>
    );

    expect(screen.getByText('Trucks: 1')).toBeInTheDocument(); // pending
    expect(screen.getAllByText('Trucks: 0')).toHaveLength(2); // in_transit and completed
  });
});
