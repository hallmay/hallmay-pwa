import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { TestWrapper } from '../../mocks/TestWrapper';
import UpdateStatusModal from '../../../features/logistics/components/modals/UpdateStatusModal';

describe('UpdateStatusModal Component', () => {
  const mockOnClose = vi.fn();
  const mockHandleStatusChange = vi.fn();

  const mockSelectedTruck = {
    id: 'truck-1',
    status: 'pending',
    driver: 'Juan Pérez',
    plate: 'ABC-123',
  };

  const mockStatusOptions = [
    { value: 'pending', label: 'Pendiente' },
    { value: 'in-progress', label: 'En Progreso' },
    { value: 'completed', label: 'Completado' },
    { value: 'cancelled', label: 'Cancelado' },
  ];

  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    selectedTruck: mockSelectedTruck,
    statusOptions: mockStatusOptions,
    handleStatusChange: mockHandleStatusChange,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when selectedTruck is null', () => {
    render(
      <TestWrapper>
        <UpdateStatusModal
          {...defaultProps}
          selectedTruck={null}
        />
      </TestWrapper>
    );

    // Check that no modal content is displayed
    expect(screen.queryByText('Actualizar estado del camión')).not.toBeInTheDocument();
  });

  it('renders modal with correct title', () => {
    render(
      <TestWrapper>
        <UpdateStatusModal {...defaultProps} />
      </TestWrapper>
    );

    expect(screen.getByText('Actualizar Estado')).toBeInTheDocument();
  });

  it('renders all status options', () => {
    render(
      <TestWrapper>
        <UpdateStatusModal {...defaultProps} />
      </TestWrapper>
    );

    expect(screen.getByText('Pendiente')).toBeInTheDocument();
    expect(screen.getByText('En Progreso')).toBeInTheDocument();
    expect(screen.getByText('Completado')).toBeInTheDocument();
    expect(screen.getByText('Cancelado')).toBeInTheDocument();
  });

  it('highlights current status option', () => {
    render(
      <TestWrapper>
        <UpdateStatusModal {...defaultProps} />
      </TestWrapper>
    );

    const currentStatusButton = screen.getByText('Pendiente').closest('button');
    expect(currentStatusButton).toHaveClass('border-primary-darker', 'bg-blue-50');
    expect(screen.getByText('Estado actual')).toBeInTheDocument();
  });

  it('does not highlight non-current status options', () => {
    render(
      <TestWrapper>
        <UpdateStatusModal {...defaultProps} />
      </TestWrapper>
    );

    const nonCurrentStatusButton = screen.getByText('En Progreso').closest('button');
    expect(nonCurrentStatusButton).toHaveClass('border-gray-200');
    expect(nonCurrentStatusButton).not.toHaveClass('border-primary-darker', 'bg-blue-50');
  });

  it('calls handleStatusChange when status option is clicked', async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <UpdateStatusModal {...defaultProps} />
      </TestWrapper>
    );

    const statusButton = screen.getByText('En Progreso');
    await user.click(statusButton);

    expect(mockHandleStatusChange).toHaveBeenCalledWith('truck-1', 'in-progress');
  });

  it('calls onClose when cancel button is clicked', async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <UpdateStatusModal {...defaultProps} />
      </TestWrapper>
    );

    const cancelButton = screen.getByText('Cancelar');
    await user.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('renders cancel button with correct styling', () => {
    render(
      <TestWrapper>
        <UpdateStatusModal {...defaultProps} />
      </TestWrapper>
    );

    const cancelButton = screen.getByText('Cancelar');
    // Check that the button container has the correct class
    expect(cancelButton.closest('div')).toHaveClass('mt-6', 'pt-4', 'border-t', 'border-gray-200');
  });

  it('applies correct styling to status buttons', () => {
    render(
      <TestWrapper>
        <UpdateStatusModal {...defaultProps} />
      </TestWrapper>
    );

    const statusButton = screen.getByText('En Progreso').closest('button');
    expect(statusButton).toHaveClass(
      'w-full',
      'p-4',
      'text-left',
      'rounded-xl',
      'border-2',
      'transition-colors',
      'disabled:opacity-50'
    );
  });

  it('renders status labels with correct styling', () => {
    render(
      <TestWrapper>
        <UpdateStatusModal {...defaultProps} />
      </TestWrapper>
    );

    const statusLabel = screen.getByText('En Progreso').closest('div');
    expect(statusLabel).toHaveClass('font-medium', 'text-gray-900');
  });

  it('shows "Estado actual" text only for current status', () => {
    render(
      <TestWrapper>
        <UpdateStatusModal {...defaultProps} />
      </TestWrapper>
    );

    const currentStatusText = screen.getAllByText('Estado actual');
    expect(currentStatusText).toHaveLength(1);
    
    const currentStatusDiv = currentStatusText[0];
    expect(currentStatusDiv).toHaveClass('text-sm', 'text-primary-darker', 'mt-1');
  });

  it('handles empty status options array', () => {
    render(
      <TestWrapper>
        <UpdateStatusModal
          {...defaultProps}
          statusOptions={[]}
        />
      </TestWrapper>
    );

    expect(screen.getByText('Actualizar Estado')).toBeInTheDocument();
    expect(screen.getByText('Cancelar')).toBeInTheDocument();
    expect(screen.queryByText('Pendiente')).not.toBeInTheDocument();
  });

  it('works with different truck status', () => {
    const truckWithDifferentStatus = {
      ...mockSelectedTruck,
      status: 'completed',
    };

    render(
      <TestWrapper>
        <UpdateStatusModal
          {...defaultProps}
          selectedTruck={truckWithDifferentStatus}
        />
      </TestWrapper>
    );

    const currentStatusButton = screen.getByText('Completado').closest('button');
    expect(currentStatusButton).toHaveClass('border-primary-darker', 'bg-blue-50');
  });

  it('passes isOpen prop to Modal', () => {
    render(
      <TestWrapper>
        <UpdateStatusModal {...defaultProps} isOpen={false} />
      </TestWrapper>
    );

    // When modal is closed, the content should not be visible
    expect(screen.queryByText('Actualizar Estado')).not.toBeInTheDocument();
  });

  it('calls handleStatusChange with correct parameters for different statuses', async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <UpdateStatusModal {...defaultProps} />
      </TestWrapper>
    );

    const completedButton = screen.getByText('Completado');
    await user.click(completedButton);

    expect(mockHandleStatusChange).toHaveBeenCalledWith('truck-1', 'completed');
  });
});
