import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import MovementTypeBadge from '../../features/silobags/components/MovementTypeBadge';

describe('MovementTypeBadge Component', () => {
  it('renders creation type badge correctly', () => {
    render(<MovementTypeBadge type="creation" />);
    
    const badge = screen.getByText('Creación');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-blue-100', 'text-blue-800');
  });

  it('renders harvest_entry type badge correctly', () => {
    render(<MovementTypeBadge type="harvest_entry" />);
    
    const badge = screen.getByText('Entrada Cosecha');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-green-100', 'text-green-800');
  });

  it('renders substract type badge correctly', () => {
    render(<MovementTypeBadge type="substract" />);
    
    const badge = screen.getByText('Salida');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-red-100', 'text-red-800');
  });

  it('renders loss type badge correctly', () => {
    render(<MovementTypeBadge type="loss" />);
    
    const badge = screen.getByText('Ajuste/Pérdida');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-yellow-100', 'text-yellow-800');
  });

  it('renders close type badge correctly', () => {
    render(<MovementTypeBadge type="close" />);
    
    const badge = screen.getByText('Cierre');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-gray-200', 'text-gray-800');
  });

  it('handles unknown type with fallback styling', () => {
    render(<MovementTypeBadge type="unknown_type" />);
    
    const badge = screen.getByText('unknown_type');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-gray-100', 'text-gray-800');
  });

  it('applies base badge styling correctly', () => {
    render(<MovementTypeBadge type="creation" />);
    
    const badge = screen.getByText('Creación');
    expect(badge).toHaveClass(
      'px-2.5',
      'py-1',
      'text-xs',
      'font-semibold',
      'rounded-full'
    );
  });

  it('renders as span element', () => {
    const { container } = render(<MovementTypeBadge type="creation" />);
    
    const badge = container.querySelector('span');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent('Creación');
  });
});
