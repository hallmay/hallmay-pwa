import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Input from '../../shared/components/form/Input';

describe('Input Component', () => {
  it('renders with label', () => {
    render(<Input name="test" label="Test Label" />);
    
    expect(screen.getByLabelText('Test Label')).toBeInTheDocument();
    expect(screen.getByText('Test Label')).toBeInTheDocument();
  });

  it('renders without label', () => {
    render(<Input name="test" />);
    
    const input = screen.getByRole('textbox');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('name', 'test');
  });

  it('shows error message', () => {
    render(<Input name="test" error="This field is required" />);
    
    expect(screen.getByText('This field is required')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveClass('border-red-400');
  });

  it('applies custom className to container', () => {
    render(<Input name="test" className="custom-container" />);
    
    const container = screen.getByRole('textbox').closest('div');
    expect(container).toHaveClass('custom-container');
  });

  it('applies custom inputClassName to input', () => {
    render(<Input name="test" inputClassName="custom-input" />);
    
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('custom-input');
  });

  it('handles input changes', () => {
    const handleChange = vi.fn();
    render(<Input name="test" onChange={handleChange} />);
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'test value' } });
    
    expect(handleChange).toHaveBeenCalled();
    expect(input).toHaveValue('test value');
  });

  it('forwards HTML attributes', () => {
    render(<Input name="test" placeholder="Enter text" disabled />);
    
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('placeholder', 'Enter text');
    expect(input).toBeDisabled();
  });

  it('associates label with input using htmlFor', () => {
    render(<Input name="test" label="Test Label" />);
    
    const label = screen.getByText('Test Label');
    const input = screen.getByRole('textbox');
    
    expect(label).toHaveAttribute('for', 'test');
    expect(input).toHaveAttribute('id', 'test');
  });

  it('applies focus styles', () => {
    render(<Input name="test" />);
    
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('focus:outline-none', 'focus:ring-2');
  });

  it('has different focus styles for error state', () => {
    render(<Input name="test" error="Error message" />);
    
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('focus:ring-red-500');
  });
});
