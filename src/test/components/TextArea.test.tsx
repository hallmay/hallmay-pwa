import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { TestWrapper } from '../mocks/TestWrapper';
import TextArea from '../../shared/components/form/TextArea';

describe('TextArea Component', () => {
  const defaultProps = {
    name: 'test-textarea'
  };

  it('renders with label', () => {
    render(
      <TestWrapper>
        <TextArea {...defaultProps} label="Test Label" />
      </TestWrapper>
    );

    expect(screen.getByText('Test Label')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('renders without label', () => {
    render(
      <TestWrapper>
        <TextArea {...defaultProps} />
      </TestWrapper>
    );

    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.queryByText('Test Label')).not.toBeInTheDocument();
  });

  it('shows error message', () => {
    render(
      <TestWrapper>
        <TextArea {...defaultProps} error="This field is required" />
      </TestWrapper>
    );

    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  it('applies error styling when error is present', () => {
    render(
      <TestWrapper>
        <TextArea {...defaultProps} error="Error message" />
      </TestWrapper>
    );

    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveClass('border-red-400');
  });

  it('applies normal styling when no error', () => {
    render(
      <TestWrapper>
        <TextArea {...defaultProps} />
      </TestWrapper>
    );

    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveClass('border-gray-300');
    expect(textarea).not.toHaveClass('border-red-400');
  });

  it('applies custom className to container', () => {
    render(
      <TestWrapper>
        <TextArea {...defaultProps} className="custom-class" />
      </TestWrapper>
    );

    const container = screen.getByRole('textbox').parentElement;
    expect(container).toHaveClass('custom-class');
  });

  it('handles input changes', async () => {
    const mockOnChange = vi.fn();
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <TextArea {...defaultProps} onChange={mockOnChange} />
      </TestWrapper>
    );

    const textarea = screen.getByRole('textbox');
    await user.type(textarea, 'Test input');

    expect(mockOnChange).toHaveBeenCalled();
    expect(textarea).toHaveValue('Test input');
  });

  it('forwards HTML attributes', () => {
    render(
      <TestWrapper>
        <TextArea {...defaultProps} placeholder="Enter text here" disabled />
      </TestWrapper>
    );

    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveAttribute('placeholder', 'Enter text here');
    expect(textarea).toBeDisabled();
  });

  it('associates label with textarea using htmlFor', () => {
    render(
      <TestWrapper>
        <TextArea {...defaultProps} label="Test Label" name="test-name" />
      </TestWrapper>
    );

    const label = screen.getByText('Test Label');
    const textarea = screen.getByRole('textbox');
    
    expect(label).toHaveAttribute('for', 'test-name');
    expect(textarea).toHaveAttribute('id', 'test-name');
    expect(textarea).toHaveAttribute('name', 'test-name');
  });

  it('has default rows attribute', () => {
    render(
      <TestWrapper>
        <TextArea {...defaultProps} />
      </TestWrapper>
    );

    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveAttribute('rows', '4');
  });

  it('allows custom rows attribute', () => {
    render(
      <TestWrapper>
        <TextArea {...defaultProps} rows={6} />
      </TestWrapper>
    );

    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveAttribute('rows', '6');
  });

  it('applies focus styles', () => {
    render(
      <TestWrapper>
        <TextArea {...defaultProps} />
      </TestWrapper>
    );

    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveClass('focus:ring-2', 'focus:ring-primary-dark');
  });

  it('applies error focus styles when error is present', () => {
    render(
      <TestWrapper>
        <TextArea {...defaultProps} error="Error message" />
      </TestWrapper>
    );

    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveClass('focus:ring-red-500');
  });

  it('has proper default styling', () => {
    render(
      <TestWrapper>
        <TextArea {...defaultProps} />
      </TestWrapper>
    );

    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveClass(
      'w-full', 'p-3', 'border', 'rounded-xl', 'shadow-sm',
      'focus:outline-none', 'focus:border-transparent'
    );
  });
});
