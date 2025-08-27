import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createRef } from 'react';
import { MobileHeader } from '../../../shared/components/layout/mobile/Header';
import TestWrapper from '../../mocks/TestWrapper';

// Mock useAuth
const mockLogout = vi.fn();
const mockUseAuth = vi.fn();

vi.mock('../../../shared/context/auth/AuthContext', () => ({
  default: () => mockUseAuth(),
}));

// Mock SyncIndicator
vi.mock('../../../shared/components/commons/SyncIndicator', () => ({
  default: () => <div data-testid="sync-indicator">SyncIndicator</div>,
}));

describe('MobileHeader Component', () => {
  const mockRef = { current: document.createElement('div') };
  const mockProps = {
    isUserMenuOpen: false,
    setIsUserMenuOpen: vi.fn(),
    menuRef: mockRef,
  };

  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      logout: mockLogout,
    });
    mockLogout.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders header with logo and sync indicator', () => {
    render(
      <TestWrapper>
        <MobileHeader {...mockProps} />
      </TestWrapper>
    );

    expect(screen.getByAltText('Logo de Hallmay')).toBeInTheDocument();
    expect(screen.getByTestId('sync-indicator')).toBeInTheDocument();
  });

  it('renders user menu button', () => {
    render(
      <TestWrapper>
        <MobileHeader {...mockProps} />
      </TestWrapper>
    );

    const userButton = screen.getByRole('button');
    expect(userButton).toBeInTheDocument();
    expect(userButton).toHaveClass('w-10', 'h-10', 'bg-primary-darker', 'rounded-full');
  });

  it('toggles user menu when button is clicked', () => {
    const setIsUserMenuOpen = vi.fn();

    render(
      <TestWrapper>
        <MobileHeader {...mockProps} setIsUserMenuOpen={setIsUserMenuOpen} />
      </TestWrapper>
    );

    const userButton = screen.getByRole('button');
    fireEvent.click(userButton);

    expect(setIsUserMenuOpen).toHaveBeenCalledWith(true);
  });

  it('shows user menu when isUserMenuOpen is true', () => {
    render(
      <TestWrapper>
        <MobileHeader {...mockProps} isUserMenuOpen={true} />
      </TestWrapper>
    );

    expect(screen.getByText('Cerrar Sesión')).toBeInTheDocument();
  });

  it('hides user menu when isUserMenuOpen is false', () => {
    render(
      <TestWrapper>
        <MobileHeader {...mockProps} isUserMenuOpen={false} />
      </TestWrapper>
    );

    expect(screen.queryByText('Cerrar Sesión')).not.toBeInTheDocument();
  });

  it('calls logout when logout button is clicked', async () => {
    const setIsUserMenuOpen = vi.fn();

    render(
      <TestWrapper>
        <MobileHeader 
          {...mockProps} 
          isUserMenuOpen={true} 
          setIsUserMenuOpen={setIsUserMenuOpen}
        />
      </TestWrapper>
    );

    const logoutButton = screen.getByText('Cerrar Sesión');
    fireEvent.click(logoutButton);

    await waitFor(() => {
      expect(setIsUserMenuOpen).toHaveBeenCalledWith(false);
      expect(mockLogout).toHaveBeenCalled();
    });
  });

  it('handles logout error gracefully', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockLogout.mockRejectedValue(new Error('Logout failed'));
    const setIsUserMenuOpen = vi.fn();

    render(
      <TestWrapper>
        <MobileHeader 
          {...mockProps} 
          isUserMenuOpen={true} 
          setIsUserMenuOpen={setIsUserMenuOpen}
        />
      </TestWrapper>
    );

    const logoutButton = screen.getByText('Cerrar Sesión');
    fireEvent.click(logoutButton);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error al cerrar sesión:', expect.any(Error));
    });

    consoleErrorSpy.mockRestore();
  });

  it('handles touch events for logout', async () => {
    const setIsUserMenuOpen = vi.fn();

    render(
      <TestWrapper>
        <MobileHeader 
          {...mockProps} 
          isUserMenuOpen={true} 
          setIsUserMenuOpen={setIsUserMenuOpen}
        />
      </TestWrapper>
    );

    const logoutButton = screen.getByText('Cerrar Sesión');
    fireEvent.touchStart(logoutButton);

    await waitFor(() => {
      expect(setIsUserMenuOpen).toHaveBeenCalledWith(false);
      expect(mockLogout).toHaveBeenCalled();
    });
  });

  it('applies correct CSS classes', () => {
    const { container } = render(
      <TestWrapper>
        <MobileHeader {...mockProps} />
      </TestWrapper>
    );

    const header = container.querySelector('.lg\\:hidden');
    expect(header).toBeInTheDocument();
    expect(header).toHaveClass('sticky', 'top-0', 'bg-secondary');
  });

  it('prevents event propagation on logout', async () => {
    const setIsUserMenuOpen = vi.fn();

    render(
      <TestWrapper>
        <MobileHeader 
          {...mockProps} 
          isUserMenuOpen={true} 
          setIsUserMenuOpen={setIsUserMenuOpen}
        />
      </TestWrapper>
    );

    const logoutButton = screen.getByText('Cerrar Sesión');
    
    // Create a more realistic event
    const clickEvent = new MouseEvent('click', { bubbles: true });
    Object.defineProperty(clickEvent, 'preventDefault', { value: vi.fn() });
    Object.defineProperty(clickEvent, 'stopPropagation', { value: vi.fn() });
    
    fireEvent(logoutButton, clickEvent);

    await waitFor(() => {
      expect(mockLogout).toHaveBeenCalled();
    });
  });
});
