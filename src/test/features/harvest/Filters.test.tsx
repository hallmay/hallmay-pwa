import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SessionsFilters from '../../../features/harvest/components/Filters';
import type { HarvestSession } from '../../../shared/types';

// Mock the Select component
vi.mock('../../../shared/components/form/Select', () => ({
  default: ({ name, label, items, value, onChange }: any) => (
    <div data-testid={`select-${name}`}>
      <label>{label}</label>
      <select 
        value={value} 
        onChange={(e) => onChange(e.target.value)}
        data-testid={`${name}-select`}
      >
        {items.map((item: any) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>
    </div>
  )
}));

// Mock Card component
vi.mock('../../../shared/components/commons/Card', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card">{children}</div>
  )
}));

describe('SessionsFilters Component', () => {
  const mockSessions: HarvestSession[] = [
    {
      id: '1',
      field: { id: 'field1', name: 'Campo Norte' },
      crop: { id: 'crop1', name: 'Soja' },
    },
    {
      id: '2', 
      field: { id: 'field2', name: 'Campo Sur' },
      crop: { id: 'crop2', name: 'Maíz' },
    },
    {
      id: '3',
      field: { id: 'field1', name: 'Campo Norte' }, // Duplicate field
      crop: { id: 'crop1', name: 'Soja' }, // Duplicate crop
    }
  ] as HarvestSession[];

  const defaultProps = {
    filters: { crop: 'all', field: 'all' },
    onFilterChange: vi.fn(),
    sessionsForCampaign: mockSessions,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the filters title', () => {
    render(<SessionsFilters {...defaultProps} />);
    expect(screen.getByText('Filtros')).toBeInTheDocument();
  });

  it('renders field and crop select components', () => {
    render(<SessionsFilters {...defaultProps} />);
    
    expect(screen.getByTestId('select-field')).toBeInTheDocument();
    expect(screen.getByTestId('select-crop')).toBeInTheDocument();
    expect(screen.getByText('Campo (Opcional)')).toBeInTheDocument();
    expect(screen.getByText('Cultivo (Opcional)')).toBeInTheDocument();
  });

  it('generates unique field options from sessions', () => {
    render(<SessionsFilters {...defaultProps} />);
    
    const fieldSelect = screen.getByTestId('field-select');
    const options = fieldSelect.querySelectorAll('option');
    
    // Should have "all" option + 2 unique fields
    expect(options).toHaveLength(3);
    expect(options[0]).toHaveTextContent('Todos los campos');
    expect(options[1]).toHaveTextContent('Campo Norte');
    expect(options[2]).toHaveTextContent('Campo Sur');
  });

  it('generates unique crop options from sessions', () => {
    render(<SessionsFilters {...defaultProps} />);
    
    const cropSelect = screen.getByTestId('crop-select');
    const options = cropSelect.querySelectorAll('option');
    
    // Should have "all" option + 2 unique crops
    expect(options).toHaveLength(3);
    expect(options[0]).toHaveTextContent('Todos los cultivos');
    expect(options[1]).toHaveTextContent('Soja');
    expect(options[2]).toHaveTextContent('Maíz');
  });

  it('calls onFilterChange when field filter changes', () => {
    const onFilterChange = vi.fn();
    render(<SessionsFilters {...defaultProps} onFilterChange={onFilterChange} />);
    
    const fieldSelect = screen.getByTestId('field-select');
    fireEvent.change(fieldSelect, { target: { value: 'field1' } });
    
    expect(onFilterChange).toHaveBeenCalledWith('field', 'field1');
  });

  it('calls onFilterChange when crop filter changes', () => {
    const onFilterChange = vi.fn();
    render(<SessionsFilters {...defaultProps} onFilterChange={onFilterChange} />);
    
    const cropSelect = screen.getByTestId('crop-select');
    fireEvent.change(cropSelect, { target: { value: 'crop2' } });
    
    expect(onFilterChange).toHaveBeenCalledWith('crop', 'crop2');
  });

  it('displays current filter values', () => {
    const filters = { crop: 'crop1', field: 'field2' };
    render(<SessionsFilters {...defaultProps} filters={filters} />);
    
    const fieldSelect = screen.getByTestId('field-select');
    const cropSelect = screen.getByTestId('crop-select');
    
    expect(fieldSelect).toHaveValue('field2');
    expect(cropSelect).toHaveValue('crop1');
  });

  it('handles empty sessions array', () => {
    render(<SessionsFilters {...defaultProps} sessionsForCampaign={[]} />);
    
    const fieldSelect = screen.getByTestId('field-select');
    const cropSelect = screen.getByTestId('crop-select');
    
    // Should only have the "all" option
    expect(fieldSelect.querySelectorAll('option')).toHaveLength(1);
    expect(cropSelect.querySelectorAll('option')).toHaveLength(1);
  });

  it('handles null sessions', () => {
    render(<SessionsFilters {...defaultProps} sessionsForCampaign={null as any} />);
    
    const fieldSelect = screen.getByTestId('field-select');
    const cropSelect = screen.getByTestId('crop-select');
    
    // Should only have the "all" option
    expect(fieldSelect.querySelectorAll('option')).toHaveLength(1);
    expect(cropSelect.querySelectorAll('option')).toHaveLength(1);
  });

  it('renders inside a Card component', () => {
    render(<SessionsFilters {...defaultProps} />);
    expect(screen.getByTestId('card')).toBeInTheDocument();
  });

  it('has proper grid layout classes', () => {
    render(<SessionsFilters {...defaultProps} />);
    
    const gridContainer = screen.getByTestId('select-field').parentElement;
    expect(gridContainer).toHaveClass('grid', 'grid-cols-2', 'lg:grid-cols-4', 'gap-4');
  });

  it('prevents duplicate fields and crops in options', () => {
    // This test ensures that even with duplicate data, we only show unique options
    const sessionsWithDuplicates = [
      ...mockSessions,
      {
        id: '4',
        field: { id: 'field1', name: 'Campo Norte' }, // Another duplicate
        crop: { id: 'crop1', name: 'Soja' }, // Another duplicate
      }
    ] as HarvestSession[];

    render(<SessionsFilters {...defaultProps} sessionsForCampaign={sessionsWithDuplicates} />);
    
    const fieldSelect = screen.getByTestId('field-select');
    const cropSelect = screen.getByTestId('crop-select');
    
    // Still should have only 2 unique fields + "all" option
    expect(fieldSelect.querySelectorAll('option')).toHaveLength(3);
    // Still should have only 2 unique crops + "all" option  
    expect(cropSelect.querySelectorAll('option')).toHaveLength(3);
  });
});
