import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { TestWrapper } from '../mocks/TestWrapper';
import DateInput from '../../shared/components/form/DateInput';

// Mock date-fns for consistent testing
vi.mock('date-fns', () => ({
  format: vi.fn((date, formatStr) => {
    if (formatStr === 'dd/MM/yyyy') {
      return '25/12/2024';
    }
    return '25/12/2024';
  }),
}));

// Mock date-fns locale
vi.mock('date-fns/locale', () => ({
  es: {},
}));

// Mock react-day-picker
vi.mock('react-day-picker', () => ({
  DayPicker: ({ onSelect, selected }: any) => (
    <div data-testid="day-picker">
      <button 
        onClick={() => onSelect(new Date('2024-12-25'))}
        data-testid="day-picker-select"
      >
        Select Date
      </button>
      {selected && <div data-testid="selected-date">Selected: {selected.toString()}</div>}
    </div>
  ),
}));

describe('DateInput Component', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with label', () => {
    render(
      <TestWrapper>
        <DateInput name="test-date" label="Test Date" onChange={mockOnChange} />
      </TestWrapper>
    );

    expect(screen.getByText('Test Date')).toBeInTheDocument();
    expect(screen.getByRole('button')).toHaveAttribute('id', 'test-date');
  });

  it('renders without label', () => {
    render(
      <TestWrapper>
        <DateInput name="test-date" onChange={mockOnChange} />
      </TestWrapper>
    );

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(screen.queryByText('Test Date')).not.toBeInTheDocument();
  });

  it('shows placeholder text when no value is selected', () => {
    render(
      <TestWrapper>
        <DateInput name="test-date" onChange={mockOnChange} />
      </TestWrapper>
    );

    expect(screen.getByText('Seleccionar fecha...')).toBeInTheDocument();
  });

  it('shows formatted date when value is provided', () => {
    const testDate = new Date('2024-12-25');
    
    render(
      <TestWrapper>
        <DateInput name="test-date" onChange={mockOnChange} value={testDate} />
      </TestWrapper>
    );

    expect(screen.getByText('25/12/2024')).toBeInTheDocument();
  });

  it('opens calendar when button is clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <DateInput name="test-date" onChange={mockOnChange} />
      </TestWrapper>
    );

    const button = screen.getByRole('button');
    await user.click(button);

    expect(screen.getByTestId('day-picker')).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-expanded', 'true');
  });

  it('closes calendar after selecting a date', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <DateInput name="test-date" onChange={mockOnChange} />
      </TestWrapper>
    );

    // Open calendar
    const button = screen.getByRole('button');
    await user.click(button);
    expect(screen.getByTestId('day-picker')).toBeInTheDocument();

    // Select date
    const selectButton = screen.getByTestId('day-picker-select');
    await user.click(selectButton);

    expect(mockOnChange).toHaveBeenCalledWith(new Date('2024-12-25'));
    expect(screen.queryByTestId('day-picker')).not.toBeInTheDocument();
  });

  it('closes calendar when clicking outside', () => {
    render(
      <TestWrapper>
        <div>
          <DateInput name="test-date" onChange={mockOnChange} />
          <div data-testid="outside">Outside</div>
        </div>
      </TestWrapper>
    );

    // Open calendar
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(screen.getByTestId('day-picker')).toBeInTheDocument();

    // Click outside
    const outsideElement = screen.getByTestId('outside');
    fireEvent.mouseDown(outsideElement);

    expect(screen.queryByTestId('day-picker')).not.toBeInTheDocument();
  });

  it('handles disabled state', () => {
    render(
      <TestWrapper>
        <DateInput name="test-date" onChange={mockOnChange} disabled />
      </TestWrapper>
    );

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveClass('bg-gray-200', 'cursor-not-allowed');
  });

  it('does not open calendar when disabled', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <DateInput name="test-date" onChange={mockOnChange} disabled />
      </TestWrapper>
    );

    const button = screen.getByRole('button');
    await user.click(button);

    expect(screen.queryByTestId('day-picker')).not.toBeInTheDocument();
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });

  it('shows error message and styling', () => {
    render(
      <TestWrapper>
        <DateInput name="test-date" onChange={mockOnChange} error="Date is required" />
      </TestWrapper>
    );

    expect(screen.getByText('Date is required')).toBeInTheDocument();
    const button = screen.getByRole('button');
    expect(button).toHaveClass('border-red-400', 'focus:ring-red-500');
  });

  it('shows required asterisk when required', () => {
    render(
      <TestWrapper>
        <DateInput name="test-date" label="Required Date" onChange={mockOnChange} required />
      </TestWrapper>
    );

    expect(screen.getByText('*')).toBeInTheDocument();
    expect(screen.getByText('*')).toHaveClass('text-red-500');
  });

  it('applies custom className', () => {
    render(
      <TestWrapper>
        <DateInput name="test-date" onChange={mockOnChange} className="custom-class" />
      </TestWrapper>
    );

    const container = screen.getByRole('button').closest('.custom-class');
    expect(container).toBeInTheDocument();
  });

  it('renders calendar icon', () => {
    render(
      <TestWrapper>
        <DateInput name="test-date" onChange={mockOnChange} />
      </TestWrapper>
    );

    const icon = screen.getByRole('button').querySelector('svg');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveAttribute('aria-hidden', 'true');
  });

  it('handles null value correctly', () => {
    render(
      <TestWrapper>
        <DateInput name="test-date" onChange={mockOnChange} value={null} />
      </TestWrapper>
    );

    expect(screen.getByText('Seleccionar fecha...')).toBeInTheDocument();
  });

  it('handles date selection from day picker', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <DateInput name="test-date" onChange={mockOnChange} />
      </TestWrapper>
    );

    const button = screen.getByRole('button');
    await user.click(button);

    // Click the select button in day picker
    const selectButton = screen.getByTestId('day-picker-select');
    await user.click(selectButton);
    
    expect(mockOnChange).toHaveBeenCalledWith(new Date('2024-12-25'));
  });
});
