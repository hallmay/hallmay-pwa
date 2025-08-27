import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import Tabs from '../../features/harvest/components/Tabs';

describe('Tabs Component', () => {
  const mockSetActiveTab = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all tab buttons', () => {
    render(
      <Tabs
        activeTab="all"
        setActiveTab={mockSetActiveTab}
      />
    );

    expect(screen.getByText('Todos')).toBeInTheDocument();
    expect(screen.getByText('En Progreso')).toBeInTheDocument();
    expect(screen.getByText('Pendientes')).toBeInTheDocument();
    expect(screen.getByText('Finalizados')).toBeInTheDocument();
  });

  it('highlights active tab correctly', () => {
    render(
      <Tabs
        activeTab="in-progress"
        setActiveTab={mockSetActiveTab}
      />
    );

    const activeTab = screen.getByText('En Progreso');
    const inactiveTab = screen.getByText('Todos');

    expect(activeTab).toHaveClass('bg-primary-light', 'text-primary-dark');
    expect(inactiveTab).toHaveClass('text-text-secondary');
  });

  it('calls setActiveTab when tab is clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <Tabs
        activeTab="all"
        setActiveTab={mockSetActiveTab}
      />
    );

    const pendingTab = screen.getByText('Pendientes');
    await user.click(pendingTab);

    expect(mockSetActiveTab).toHaveBeenCalledWith('pending');
  });

  it('applies hover styles to inactive tabs', () => {
    render(
      <Tabs
        activeTab="all"
        setActiveTab={mockSetActiveTab}
      />
    );

    const inactiveTab = screen.getByText('En Progreso');
    expect(inactiveTab).toHaveClass('hover:bg-gray-100');
  });

  it('handles all tab selections correctly', async () => {
    const user = userEvent.setup();
    
    render(
      <Tabs
        activeTab="all"
        setActiveTab={mockSetActiveTab}
      />
    );

    await user.click(screen.getByText('Todos'));
    expect(mockSetActiveTab).toHaveBeenCalledWith('all');

    await user.click(screen.getByText('En Progreso'));
    expect(mockSetActiveTab).toHaveBeenCalledWith('in-progress');

    await user.click(screen.getByText('Pendientes'));
    expect(mockSetActiveTab).toHaveBeenCalledWith('pending');

    await user.click(screen.getByText('Finalizados'));
    expect(mockSetActiveTab).toHaveBeenCalledWith('finished');
  });

  it('renders with correct container styling', () => {
    const { container } = render(
      <Tabs
        activeTab="all"
        setActiveTab={mockSetActiveTab}
      />
    );

    const tabsContainer = container.firstChild;
    expect(tabsContainer).toHaveClass(
      'flex',
      'space-x-1',
      'sm:space-x-2',
      'bg-background',
      'p-1',
      'rounded-xl'
    );
  });

  it('applies correct button styling', () => {
    render(
      <Tabs
        activeTab="all"
        setActiveTab={mockSetActiveTab}
      />
    );

    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
      expect(button).toHaveClass(
        'font-semibold',
        'text-sm',
        'rounded-lg',
        'transition-colors'
      );
    });
  });
});
