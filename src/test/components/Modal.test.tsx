import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { TestWrapper } from '../mocks/TestWrapper';
import Modal from '../../shared/components/commons/Modal';

// Mock document.body.style
Object.defineProperty(document.body, 'style', {
  value: {
    overflow: ''
  },
  writable: true
});

describe('Modal Component', () => {
  const mockOnClose = vi.fn();
  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    title: 'Test Modal',
    children: <div>Modal content</div>
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders when isOpen is true', () => {
    render(
      <TestWrapper>
        <Modal {...defaultProps} />
      </TestWrapper>
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Test Modal')).toBeInTheDocument();
    expect(screen.getByText('Modal content')).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    render(
      <TestWrapper>
        <Modal {...defaultProps} isOpen={false} />
      </TestWrapper>
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <Modal {...defaultProps} />
      </TestWrapper>
    );

    const closeButton = screen.getByLabelText('Cerrar modal');
    await user.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when backdrop is clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <Modal {...defaultProps} />
      </TestWrapper>
    );

    const backdrop = screen.getByRole('dialog');
    await user.click(backdrop);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('does not close when modal content is clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <Modal {...defaultProps} />
      </TestWrapper>
    );

    const content = screen.getByText('Modal content');
    await user.click(content);

    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('closes when Escape key is pressed', () => {
    render(
      <TestWrapper>
        <Modal {...defaultProps} />
      </TestWrapper>
    );

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('sets body overflow to hidden when open', () => {
    render(
      <TestWrapper>
        <Modal {...defaultProps} />
      </TestWrapper>
    );

    expect(document.body.style.overflow).toBe('hidden');
  });

  it('resets body overflow when closed', () => {
    const { rerender } = render(
      <TestWrapper>
        <Modal {...defaultProps} />
      </TestWrapper>
    );

    // First render - should be hidden
    expect(document.body.style.overflow).toBe('hidden');

    // Close modal
    rerender(
      <TestWrapper>
        <Modal {...defaultProps} isOpen={false} />
      </TestWrapper>
    );

    expect(document.body.style.overflow).toBe('auto');
  });

  it('has proper accessibility attributes', () => {
    render(
      <TestWrapper>
        <Modal {...defaultProps} />
      </TestWrapper>
    );

    const modal = screen.getByRole('dialog');
    expect(modal).toHaveAttribute('aria-modal', 'true');
    expect(screen.getByLabelText('Cerrar modal')).toBeInTheDocument();
  });

  it('renders title correctly', () => {
    render(
      <TestWrapper>
        <Modal {...defaultProps} title="Custom Title" />
      </TestWrapper>
    );

    expect(screen.getByText('Custom Title')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Custom Title');
  });

  it('has proper styling classes', () => {
    render(
      <TestWrapper>
        <Modal {...defaultProps} />
      </TestWrapper>
    );

    const backdrop = screen.getByRole('dialog');
    expect(backdrop).toHaveClass('fixed', 'inset-0', 'bg-black/60', 'backdrop-blur-sm');
    
    const modalContent = backdrop.firstChild;
    expect(modalContent).toHaveClass('bg-surface', 'rounded-2xl', 'shadow-2xl');
  });
});
