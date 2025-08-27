import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { DesktopHeader } from '../../../shared/components/layout/desktop/Header';
import { TestWrapper } from '../../mocks/TestWrapper';

// Mock de react-router
vi.mock('react-router', () => ({
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to} role="link">{children}</a>
  ),
  useNavigate: () => vi.fn(),
  useLocation: () => ({ pathname: '/harvest' }),
}));

describe('DesktopHeader Component', () => {
  const mockSetIsUserMenuOpen = vi.fn();
  const mockMenuRef = { current: null } as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders header with title', () => {
    render(
      <TestWrapper>
        <DesktopHeader 
          isUserMenuOpen={false}
          setIsUserMenuOpen={mockSetIsUserMenuOpen}
          menuRef={mockMenuRef}
        />
      </TestWrapper>
    );

    expect(screen.getByText('Hallmay')).toBeInTheDocument();
  });

  it('renders backoffice link', () => {
    render(
      <TestWrapper>
        <DesktopHeader 
          isUserMenuOpen={false}
          setIsUserMenuOpen={mockSetIsUserMenuOpen}
          menuRef={mockMenuRef}
        />
      </TestWrapper>
    );

    const backofficeLink = screen.getByText('IR AL BACKOFFICE');
    expect(backofficeLink).toBeInTheDocument();
    expect(backofficeLink.closest('a')).toHaveAttribute('href', '/backoffice');
    expect(backofficeLink.closest('a')).toHaveAttribute('target', '_blank');
  });

  it('renders user menu button', () => {
    render(
      <TestWrapper>
        <DesktopHeader 
          isUserMenuOpen={false}
          setIsUserMenuOpen={mockSetIsUserMenuOpen}
          menuRef={mockMenuRef}
        />
      </TestWrapper>
    );

    const userButton = screen.getByRole('button');
    expect(userButton).toBeInTheDocument();
  });

  it('calls setIsUserMenuOpen when user button is clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <DesktopHeader 
          isUserMenuOpen={false}
          setIsUserMenuOpen={mockSetIsUserMenuOpen}
          menuRef={mockMenuRef}
        />
      </TestWrapper>
    );

    const userButton = screen.getByRole('button');
    await user.click(userButton);
    
    expect(mockSetIsUserMenuOpen).toHaveBeenCalledWith(true);
  });

  it('shows user menu when isUserMenuOpen is true', () => {
    render(
      <TestWrapper>
        <DesktopHeader 
          isUserMenuOpen={true}
          setIsUserMenuOpen={mockSetIsUserMenuOpen}
          menuRef={mockMenuRef}
        />
      </TestWrapper>
    );

    expect(screen.getByText('Cerrar Sesión')).toBeInTheDocument();
  });

  it('does not show user menu when isUserMenuOpen is false', () => {
    render(
      <TestWrapper>
        <DesktopHeader 
          isUserMenuOpen={false}
          setIsUserMenuOpen={mockSetIsUserMenuOpen}
          menuRef={mockMenuRef}
        />
      </TestWrapper>
    );

    expect(screen.queryByText('Cerrar Sesión')).not.toBeInTheDocument();
  });

  it('has proper structure and content', () => {
    render(
      <TestWrapper>
        <DesktopHeader 
          isUserMenuOpen={false}
          setIsUserMenuOpen={mockSetIsUserMenuOpen}
          menuRef={mockMenuRef}
        />
      </TestWrapper>
    );

    // Verify the header has the main elements
    expect(screen.getByText('Hallmay')).toBeInTheDocument();
    expect(screen.getByText('IR AL BACKOFFICE')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});
