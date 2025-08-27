import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TestWrapper } from '../mocks/TestWrapper';
import StatusBadge from '../../shared/components/commons/StatusBadge';

describe('StatusBadge Component', () => {
  it('renders with status text', () => {
    render(
      <TestWrapper>
        <StatusBadge status="pending" />
      </TestWrapper>
    );

    expect(screen.getByText('Pendiente')).toBeInTheDocument();
  });

  it('normalizes status "finished" to "Finalizado"', () => {
    render(
      <TestWrapper>
        <StatusBadge status="finished" />
      </TestWrapper>
    );

    expect(screen.getByText('Finalizado')).toBeInTheDocument();
  });

  it('normalizes status "in-progress" to "En Progreso"', () => {
    render(
      <TestWrapper>
        <StatusBadge status="in-progress" />
      </TestWrapper>
    );

    expect(screen.getByText('En Progreso')).toBeInTheDocument();
  });

  it('normalizes status "pending" to "Pendiente"', () => {
    render(
      <TestWrapper>
        <StatusBadge status="pending" />
      </TestWrapper>
    );

    expect(screen.getByText('Pendiente')).toBeInTheDocument();
  });

  it('keeps already normalized status unchanged', () => {
    render(
      <TestWrapper>
        <StatusBadge status="En Progreso" />
      </TestWrapper>
    );

    expect(screen.getByText('En Progreso')).toBeInTheDocument();
  });

  it('shows unknown status as-is', () => {
    render(
      <TestWrapper>
        <StatusBadge status="unknown-status" />
      </TestWrapper>
    );

    expect(screen.getByText('unknown-status')).toBeInTheDocument();
  });

  it('applies correct CSS classes for "Pendiente" status', () => {
    render(
      <TestWrapper>
        <StatusBadge status="pending" />
      </TestWrapper>
    );

    const badge = screen.getByText('Pendiente');
    expect(badge).toHaveClass('bg-orange-100', 'text-orange-800');
  });

  it('applies correct CSS classes for "En Progreso" status', () => {
    render(
      <TestWrapper>
        <StatusBadge status="in-progress" />
      </TestWrapper>
    );

    const badge = screen.getByText('En Progreso');
    expect(badge).toHaveClass('bg-blue-100', 'text-blue-800');
  });

  it('applies correct CSS classes for "Finalizado" status', () => {
    render(
      <TestWrapper>
        <StatusBadge status="finished" />
      </TestWrapper>
    );

    const badge = screen.getByText('Finalizado');
    expect(badge).toHaveClass('bg-green-100', 'text-green-800');
  });

  it('applies default CSS classes for unknown status', () => {
    render(
      <TestWrapper>
        <StatusBadge status="unknown" />
      </TestWrapper>
    );

    const badge = screen.getByText('unknown');
    expect(badge).toHaveClass('bg-gray-100', 'text-gray-800');
  });

  it('applies base CSS classes to all badges', () => {
    render(
      <TestWrapper>
        <StatusBadge status="pending" />
      </TestWrapper>
    );

    const badge = screen.getByText('Pendiente');
    expect(badge).toHaveClass('px-2.5', 'py-1', 'text-xs', 'font-semibold', 'rounded-full', 'inline-block');
  });

  it('applies custom className when provided', () => {
    render(
      <TestWrapper>
        <StatusBadge status="pending" className="custom-class" />
      </TestWrapper>
    );

    const badge = screen.getByText('Pendiente');
    expect(badge).toHaveClass('custom-class');
  });

  it('renders as span element', () => {
    render(
      <TestWrapper>
        <StatusBadge status="pending" />
      </TestWrapper>
    );

    const badge = screen.getByText('Pendiente');
    expect(badge.tagName).toBe('SPAN');
  });
});
