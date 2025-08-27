import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import Select, { type SelectOption } from '../../shared/components/form/Select';

const defaultOptions: SelectOption[] = [
  { id: 'option1', label: 'Option 1' },
  { id: 'option2', label: 'Option 2' },
  { id: 'option3', label: 'Option 3', disabled: true },
];

const groupedOptions: SelectOption[] = [
  { id: 'option1', label: 'Option 1', group: 'Group A' },
  { id: 'option2', label: 'Option 2', group: 'Group A' },
  { id: 'option3', label: 'Option 3', group: 'Group B' },
  { id: 'option4', label: 'Option 4' }, // ungrouped
];

describe('Select Component', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with basic props', () => {
    render(
      <Select
        name="test-select"
        items={defaultOptions}
        onChange={mockOnChange}
      />
    );

    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByText('Seleccionar...')).toBeInTheDocument();
  });

  it('renders with label', () => {
    render(
      <Select
        name="test-select"
        label="Test Label"
        items={defaultOptions}
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText('Test Label')).toBeInTheDocument();
    expect(screen.getByLabelText('Test Label')).toBeInTheDocument();
  });

  it('renders with required indicator', () => {
    render(
      <Select
        name="test-select"
        label="Test Label"
        required
        items={defaultOptions}
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('renders with custom placeholder', () => {
    render(
      <Select
        name="test-select"
        placeholder="Custom placeholder"
        items={defaultOptions}
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText('Custom placeholder')).toBeInTheDocument();
  });

  it('opens dropdown when clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <Select
        name="test-select"
        items={defaultOptions}
        onChange={mockOnChange}
      />
    );

    const button = screen.getByRole('button');
    await user.click(button);

    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(screen.getByText('Option 1')).toBeInTheDocument();
    expect(screen.getByText('Option 2')).toBeInTheDocument();
    expect(screen.getByText('Option 3')).toBeInTheDocument();
  });

  it('selects an option when clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <Select
        name="test-select"
        items={defaultOptions}
        onChange={mockOnChange}
      />
    );

    const button = screen.getByRole('button');
    await user.click(button);

    const option1 = screen.getByText('Option 1');
    await user.click(option1);

    expect(mockOnChange).toHaveBeenCalledWith('option1');
  });

  it('displays selected value', () => {
    render(
      <Select
        name="test-select"
        items={defaultOptions}
        value="option2"
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText('Option 2')).toBeInTheDocument();
  });

  it('shows check mark for selected option', async () => {
    const user = userEvent.setup();
    
    render(
      <Select
        name="test-select"
        items={defaultOptions}
        value="option1"
        onChange={mockOnChange}
      />
    );

    const button = screen.getByRole('button');
    await user.click(button);

    // Buscar dentro del listbox para evitar el elemento del botón
    const listbox = screen.getByRole('listbox');
    const selectedOption = listbox.querySelector('[aria-selected="true"]');
    expect(selectedOption).toHaveAttribute('aria-selected', 'true');
    expect(selectedOption).toHaveClass('bg-blue-50');
  });

  it('disables option when disabled prop is true', async () => {
    const user = userEvent.setup();
    
    render(
      <Select
        name="test-select"
        items={defaultOptions}
        onChange={mockOnChange}
      />
    );

    const button = screen.getByRole('button');
    await user.click(button);

    const disabledOption = screen.getByText('Option 3').closest('[role="option"]');
    expect(disabledOption).toHaveClass('opacity-50', 'cursor-not-allowed');

    await user.click(screen.getByText('Option 3'));
    expect(mockOnChange).not.toHaveBeenCalled();
  });

  it('closes dropdown when clicking outside', async () => {
    const user = userEvent.setup();
    
    render(
      <div>
        <Select
          name="test-select"
          items={defaultOptions}
          onChange={mockOnChange}
        />
        <div data-testid="outside">Outside</div>
      </div>
    );

    const button = screen.getByRole('button');
    await user.click(button);
    expect(screen.getByRole('listbox')).toBeInTheDocument();

    const outside = screen.getByTestId('outside');
    fireEvent.mouseDown(outside);
    
    await waitFor(() => {
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });
  });

  it('renders error message', () => {
    render(
      <Select
        name="test-select"
        items={defaultOptions}
        error="This field is required"
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  it('applies error styling when error prop is present', () => {
    render(
      <Select
        name="test-select"
        items={defaultOptions}
        error="Error message"
        onChange={mockOnChange}
      />
    );

    const button = screen.getByRole('button');
    expect(button).toHaveClass('border-red-400');
  });

  it('is disabled when disabled prop is true', () => {
    render(
      <Select
        name="test-select"
        items={defaultOptions}
        disabled
        onChange={mockOnChange}
      />
    );

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveClass('bg-gray-200', 'cursor-not-allowed');
  });

  it('shows loading state', () => {
    render(
      <Select
        name="test-select"
        items={defaultOptions}
        loading
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText('Cargando...')).toBeInTheDocument();
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('renders search input when searchable', async () => {
    const user = userEvent.setup();
    
    render(
      <Select
        name="test-select"
        items={defaultOptions}
        searchable
        onChange={mockOnChange}
      />
    );

    const button = screen.getByRole('button');
    await user.click(button);

    expect(screen.getByPlaceholderText('Buscar...')).toBeInTheDocument();
  });

  it('filters options when searching', async () => {
    const user = userEvent.setup();
    
    render(
      <Select
        name="test-select"
        items={defaultOptions}
        searchable
        onChange={mockOnChange}
      />
    );

    const button = screen.getByRole('button');
    await user.click(button);

    const searchInput = screen.getByPlaceholderText('Buscar...');
    await user.type(searchInput, 'Option 1');

    expect(screen.getByText('Option 1')).toBeInTheDocument();
    expect(screen.queryByText('Option 2')).not.toBeInTheDocument();
  });

  it('shows empty message when no options match search', async () => {
    const user = userEvent.setup();
    
    render(
      <Select
        name="test-select"
        items={defaultOptions}
        searchable
        emptyMessage="No results found"
        onChange={mockOnChange}
      />
    );

    const button = screen.getByRole('button');
    await user.click(button);

    const searchInput = screen.getByPlaceholderText('Buscar...');
    await user.type(searchInput, 'nonexistent');

    expect(screen.getByText('No results found')).toBeInTheDocument();
  });

  it('renders clear button when clearable and has value', async () => {
    const user = userEvent.setup();
    
    render(
      <Select
        name="test-select"
        items={defaultOptions}
        value="option1"
        clearable
        onChange={mockOnChange}
      />
    );

    const clearButton = screen.getByText('×');
    expect(clearButton).toBeInTheDocument();

    await user.click(clearButton);
    expect(mockOnChange).toHaveBeenCalledWith('');
  });

  it('does not show clear button when no value', () => {
    render(
      <Select
        name="test-select"
        items={defaultOptions}
        clearable
        onChange={mockOnChange}
      />
    );

    expect(screen.queryByText('×')).not.toBeInTheDocument();
  });

  it('renders grouped options correctly', async () => {
    const user = userEvent.setup();
    
    render(
      <Select
        name="test-select"
        items={groupedOptions}
        onChange={mockOnChange}
      />
    );

    const button = screen.getByRole('button');
    await user.click(button);

    expect(screen.getByText('Group A')).toBeInTheDocument();
    expect(screen.getByText('Group B')).toBeInTheDocument();
    expect(screen.getByText('Option 4')).toBeInTheDocument(); // ungrouped
  });

  it('normalizes different option formats', () => {
    const mixedOptions = [
      { id: 1, name: 'Name Option' },
      { value: 'value-option', label: 'Label Option' },
      { id: 'id-option', label: 'ID Label Option' },
    ];

    render(
      <Select
        name="test-select"
        items={mixedOptions}
        onChange={mockOnChange}
      />
    );

    // Should not throw any errors and render properly
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(
      <Select
        name="test-select"
        items={defaultOptions}
        className="custom-class"
        onChange={mockOnChange}
      />
    );

    const selectContainer = screen.getByRole('button').closest('.custom-class');
    expect(selectContainer).toBeInTheDocument();
  });
});
