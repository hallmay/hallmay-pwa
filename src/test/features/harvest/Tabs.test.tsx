import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Tabs from '../../../features/harvest/components/Tabs';

describe('Tabs Component', () => {
  const defaultProps = {
    activeTab: 'all',
    setActiveTab: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all tab buttons', () => {
    render(<Tabs {...defaultProps} />);

    expect(screen.getByText('Todos')).toBeInTheDocument();
    expect(screen.getByText('En Progreso')).toBeInTheDocument();
    expect(screen.getByText('Pendientes')).toBeInTheDocument();
    expect(screen.getByText('Finalizados')).toBeInTheDocument();
  });

  it('highlights active tab', () => {
    render(<Tabs {...defaultProps} activeTab="in-progress" />);

    const activeButton = screen.getByText('En Progreso');
    const inactiveButton = screen.getByText('Todos');

    expect(activeButton).toHaveClass('bg-primary-light', 'text-primary-dark');
    expect(inactiveButton).toHaveClass('text-text-secondary');
  });

  it('calls setActiveTab when tab is clicked', () => {
    const setActiveTab = vi.fn();
    render(<Tabs activeTab="all" setActiveTab={setActiveTab} />);

    const pendingTab = screen.getByText('Pendientes');
    fireEvent.click(pendingTab);

    expect(setActiveTab).toHaveBeenCalledWith('pending');
  });

  it('calls setActiveTab with correct values for each tab', () => {
    const setActiveTab = vi.fn();
    render(<Tabs activeTab="all" setActiveTab={setActiveTab} />);

    // Test each tab
    fireEvent.click(screen.getByText('Todos'));
    expect(setActiveTab).toHaveBeenCalledWith('all');

    fireEvent.click(screen.getByText('En Progreso'));
    expect(setActiveTab).toHaveBeenCalledWith('in-progress');

    fireEvent.click(screen.getByText('Pendientes'));
    expect(setActiveTab).toHaveBeenCalledWith('pending');

    fireEvent.click(screen.getByText('Finalizados'));
    expect(setActiveTab).toHaveBeenCalledWith('finished');
  });

  it('applies hover styles to inactive tabs', () => {
    render(<Tabs {...defaultProps} activeTab="all" />);

    const inactiveButton = screen.getByText('En Progreso');
    expect(inactiveButton).toHaveClass('hover:bg-gray-100');
  });

  it('maintains proper styling for each tab state', () => {
    const { rerender } = render(<Tabs {...defaultProps} activeTab="all" />);

    // Check 'all' tab is active
    expect(screen.getByText('Todos')).toHaveClass('bg-primary-light', 'text-primary-dark');

    // Switch to 'finished' tab
    rerender(<Tabs {...defaultProps} activeTab="finished" />);
    expect(screen.getByText('Finalizados')).toHaveClass('bg-primary-light', 'text-primary-dark');
    expect(screen.getByText('Todos')).toHaveClass('text-text-secondary');
  });

  it('has proper responsive classes', () => {
    render(<Tabs {...defaultProps} />);

    const container = screen.getByText('Todos').parentElement;
    expect(container).toHaveClass('space-x-1', 'sm:space-x-2');

    // Check button responsive classes
    expect(screen.getByText('Todos')).toHaveClass('px-3', 'py-2', 'sm:px-4');
  });

  it('renders as buttons with proper accessibility', () => {
    render(<Tabs {...defaultProps} />);

    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(4);

    buttons.forEach(button => {
      expect(button.tagName).toBe('BUTTON');
    });
  });
});
