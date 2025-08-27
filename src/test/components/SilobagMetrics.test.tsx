import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import SiloBagMetrics from '../../features/silobags/components/SilobagMetrics';

// Mock de formatNumber
vi.mock('../../shared/utils', () => ({
  formatNumber: (value: number) => value.toLocaleString()
}));

describe('SiloBagMetrics Component', () => {
  const mockSilobag = {
    id: '1',
    initial_kg: 10000,
    current_kg: 7500,
    status: 'active',
    created_at: new Date(),
    updated_at: new Date(),
    field_id: 'field1',
    campaign_id: 'campaign1'
  };

  it('renders current kg with proper formatting', () => {
    render(<SiloBagMetrics siloBag={mockSilobag} />);
    
    expect(screen.getByText('Kgs Actuales')).toBeInTheDocument();
    expect(screen.getByText('7,500')).toBeInTheDocument();
  });

  it('displays initial capacity', () => {
    render(<SiloBagMetrics siloBag={mockSilobag} />);
    
    expect(screen.getByText('Capacidad Inicial: 10,000 kgs')).toBeInTheDocument();
  });

  it('calculates and displays fill percentage correctly', () => {
    render(<SiloBagMetrics siloBag={mockSilobag} />);
    
    // 7500/10000 = 75%
    const progressBar = document.querySelector('.bg-primary-darker');
    expect(progressBar).toHaveStyle('width: 75%');
  });

  it('handles zero initial kg gracefully', () => {
    const zeroInitialSilobag = {
      ...mockSilobag,
      initial_kg: 0,
      current_kg: 0
    };

    render(<SiloBagMetrics siloBag={zeroInitialSilobag} />);
    
    const progressBar = document.querySelector('.bg-primary-darker');
    expect(progressBar).toHaveStyle('width: 0%');
  });

  it('renders progress bar container with correct styling', () => {
    render(<SiloBagMetrics siloBag={mockSilobag} />);
    
    const progressContainer = document.querySelector('.bg-gray-200');
    expect(progressContainer).toHaveClass(
      'w-full',
      'bg-gray-200',
      'rounded-full',
      'h-2.5',
      'overflow-hidden'
    );
  });

  it('applies correct styling to elements', () => {
    render(<SiloBagMetrics siloBag={mockSilobag} />);
    
    expect(screen.getByText('Kgs Actuales')).toHaveClass('text-sm', 'text-text-secondary');
    expect(screen.getByText('7,500')).toHaveClass('text-4xl', 'font-bold', 'text-primary');
  });

  it('handles 100% fill correctly', () => {
    const fullSilobag = {
      ...mockSilobag,
      current_kg: 10000 // Same as initial
    };

    render(<SiloBagMetrics siloBag={fullSilobag} />);
    
    const progressBar = document.querySelector('.bg-primary-darker');
    expect(progressBar).toHaveStyle('width: 100%');
  });

  it('handles overfill (more than 100%) correctly', () => {
    const overfillSilobag = {
      ...mockSilobag,
      current_kg: 12000 // More than initial
    };

    render(<SiloBagMetrics siloBag={overfillSilobag} />);
    
    // Should still calculate percentage even if > 100%
    const progressBar = document.querySelector('.bg-primary-darker');
    expect(progressBar).toHaveStyle('width: 120%');
  });
});
