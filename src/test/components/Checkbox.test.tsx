import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { TestWrapper } from '../mocks/TestWrapper';
import Checkbox from '../../shared/components/form/Checkbox';

describe('Checkbox Component', () => {
  const defaultProps = {
    label: 'Test checkbox',
    name: 'test-checkbox',
    checked: false,
    value: false
  };

  it('renders with label', () => {
    render(
      <TestWrapper>
        <Checkbox {...defaultProps} />
      </TestWrapper>
    );

    expect(screen.getByText('Test checkbox')).toBeInTheDocument();
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
  });

  it('renders in checked state', () => {
    render(
      <TestWrapper>
        <Checkbox {...defaultProps} checked={true} value={true} />
      </TestWrapper>
    );

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeChecked();
  });

  it('renders in unchecked state', () => {
    render(
      <TestWrapper>
        <Checkbox {...defaultProps} checked={false} value={false} />
      </TestWrapper>
    );

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeChecked();
  });

  it('calls onChange when clicked', async () => {
    const mockOnChange = vi.fn();
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <Checkbox {...defaultProps} onChange={mockOnChange} />
      </TestWrapper>
    );

    const checkbox = screen.getByRole('checkbox');
    await user.click(checkbox);

    expect(mockOnChange).toHaveBeenCalledTimes(1);
  });

  it('can be clicked via label', async () => {
    const mockOnChange = vi.fn();
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <Checkbox {...defaultProps} onChange={mockOnChange} />
      </TestWrapper>
    );

    const label = screen.getByText('Test checkbox');
    await user.click(label);

    expect(mockOnChange).toHaveBeenCalledTimes(1);
  });

  it('has proper id and name attributes', () => {
    render(
      <TestWrapper>
        <Checkbox {...defaultProps} name="custom-name" />
      </TestWrapper>
    );

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toHaveAttribute('id', 'custom-name');
    expect(checkbox).toHaveAttribute('name', 'custom-name');
  });

  it('applies custom className', () => {
    render(
      <TestWrapper>
        <Checkbox {...defaultProps} className="custom-class" />
      </TestWrapper>
    );

    const label = screen.getByText('Test checkbox').closest('label');
    expect(label).toHaveClass('custom-class');
  });

  it('has proper accessibility attributes', () => {
    render(
      <TestWrapper>
        <Checkbox {...defaultProps} />
      </TestWrapper>
    );

    const checkbox = screen.getByRole('checkbox');
    const label = screen.getByText('Test checkbox').closest('label');
    
    expect(label).toHaveAttribute('for', 'test-checkbox');
    expect(checkbox).toHaveAttribute('id', 'test-checkbox');
  });

  it('forwards HTML attributes', () => {
    render(
      <TestWrapper>
        <Checkbox {...defaultProps} disabled />
      </TestWrapper>
    );

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeDisabled();
  });

  it('has proper styling classes', () => {
    render(
      <TestWrapper>
        <Checkbox {...defaultProps} />
      </TestWrapper>
    );

    const label = screen.getByText('Test checkbox').closest('label');
    expect(label).toHaveClass('flex', 'items-center', 'gap-2', 'cursor-pointer');
    
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toHaveClass('peer', 'relative', 'h-5', 'w-5', 'cursor-pointer');
  });

  it('shows check icon when checked', () => {
    render(
      <TestWrapper>
        <Checkbox {...defaultProps} checked={true} value={true} />
      </TestWrapper>
    );

    // Check icon is rendered via Lucide React component
    const iconContainer = document.querySelector('.peer-checked\\:opacity-100');
    expect(iconContainer).toBeInTheDocument();
  });

  it('handles keyboard interaction', async () => {
    const mockOnChange = vi.fn();
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <Checkbox {...defaultProps} onChange={mockOnChange} />
      </TestWrapper>
    );

    const checkbox = screen.getByRole('checkbox');
    checkbox.focus();
    await user.keyboard(' ');

    expect(mockOnChange).toHaveBeenCalled();
  });
});
