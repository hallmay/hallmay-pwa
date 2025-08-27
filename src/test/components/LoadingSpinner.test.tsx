import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TestWrapper } from '../mocks/TestWrapper';
import LoadingSpinner from '../../shared/components/commons/LoadingSpinner';

describe('LoadingSpinner Component', () => {
  it('renders with default message', () => {
    render(
      <TestWrapper>
        <LoadingSpinner />
      </TestWrapper>
    );
    
    expect(screen.getByText('Cargando datos...')).toBeInTheDocument();
  });

  it('renders with custom message', () => {
    render(
      <TestWrapper>
        <LoadingSpinner message="Guardando información..." />
      </TestWrapper>
    );
    
    expect(screen.getByText('Guardando información...')).toBeInTheDocument();
  });

  it('has proper styling classes', () => {
    render(
      <TestWrapper>
        <LoadingSpinner />
      </TestWrapper>
    );
    
    const container = screen.getByText('Cargando datos...').parentElement;
    expect(container).toHaveClass('text-center', 'py-10');
    
    const spinner = container?.querySelector('.animate-spin');
    expect(spinner).toHaveClass('rounded-full', 'h-10', 'w-10', 'border-b-2');
  });

  it('renders spinner element', () => {
    render(
      <TestWrapper>
        <LoadingSpinner />
      </TestWrapper>
    );
    
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('has proper text styling', () => {
    render(
      <TestWrapper>
        <LoadingSpinner />
      </TestWrapper>
    );
    
    const text = screen.getByText('Cargando datos...');
    expect(text).toHaveClass('text-text-secondary');
  });
});
