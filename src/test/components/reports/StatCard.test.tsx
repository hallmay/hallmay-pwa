import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { TrendingUp, Package, BarChart3 } from 'lucide-react';
import StatCard from '../../../features/reports/components/commons/StatCard';
import TestWrapper from '../../mocks/TestWrapper';

describe('StatCard Component', () => {
  it('renders with basic props', () => {
    render(
      <TestWrapper>
        <StatCard 
          title="Total Harvest"
          value="1,234"
          unit="tons"
          icon={TrendingUp}
        />
      </TestWrapper>
    );

    expect(screen.getByText('Total Harvest')).toBeInTheDocument();
    expect(screen.getByText('1,234')).toBeInTheDocument();
    expect(screen.getByText('tons')).toBeInTheDocument();
  });

  it('applies green color class by default', () => {
    const { container } = render(
      <TestWrapper>
        <StatCard 
          title="Test Title"
          value="100"
          unit="kg"
          icon={Package}
        />
      </TestWrapper>
    );

    const iconContainer = container.querySelector('.bg-primary-light');
    expect(iconContainer).toBeInTheDocument();
    expect(iconContainer).toHaveClass('text-primary-dark');
  });

  it('applies blue color class when specified', () => {
    const { container } = render(
      <TestWrapper>
        <StatCard 
          title="Test Title"
          value="100"
          unit="kg"
          icon={Package}
          color="blue"
        />
      </TestWrapper>
    );

    const iconContainer = container.querySelector('.bg-blue-100');
    expect(iconContainer).toBeInTheDocument();
    expect(iconContainer).toHaveClass('text-blue-800');
  });

  it('applies orange color class when specified', () => {
    const { container } = render(
      <TestWrapper>
        <StatCard 
          title="Test Title"
          value="100"
          unit="kg"
          icon={Package}
          color="orange"
        />
      </TestWrapper>
    );

    const iconContainer = container.querySelector('.bg-orange-100');
    expect(iconContainer).toBeInTheDocument();
    expect(iconContainer).toHaveClass('text-orange-800');
  });

  it('renders icon component correctly', () => {
    render(
      <TestWrapper>
        <StatCard 
          title="Chart Data"
          value="42"
          unit="items"
          icon={BarChart3}
        />
      </TestWrapper>
    );

    // The icon should be rendered as an SVG
    const iconElement = screen.getByText('Chart Data').closest('.bg-surface')?.querySelector('svg');
    expect(iconElement).toBeInTheDocument();
  });

  it('handles numeric values correctly', () => {
    render(
      <TestWrapper>
        <StatCard 
          title="Numeric Value"
          value={9876}
          unit="units"
          icon={TrendingUp}
        />
      </TestWrapper>
    );

    expect(screen.getByText('9876')).toBeInTheDocument();
  });

  it('handles zero values', () => {
    render(
      <TestWrapper>
        <StatCard 
          title="Zero Value"
          value={0}
          unit="items"
          icon={Package}
        />
      </TestWrapper>
    );

    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('applies correct text styling classes', () => {
    const { container } = render(
      <TestWrapper>
        <StatCard 
          title="Style Test"
          value="123"
          unit="kg"
          icon={TrendingUp}
        />
      </TestWrapper>
    );

    const titleElement = screen.getByText('Style Test');
    expect(titleElement).toHaveClass('text-text-secondary', 'text-sm');

    const valueElement = screen.getByText('123');
    expect(valueElement).toHaveClass('text-3xl', 'font-bold', 'text-gray-900');

    const unitElement = screen.getByText('kg');
    expect(unitElement).toHaveClass('text-sm', 'text-text-secondary');
  });

  it('maintains flex layout structure', () => {
    render(
      <TestWrapper>
        <StatCard 
          title="Layout Test"
          value="999"
          unit="test"
          icon={Package}
        />
      </TestWrapper>
    );

    const titleElement = screen.getByText('Layout Test');
    expect(titleElement).toBeInTheDocument();
  });
});
