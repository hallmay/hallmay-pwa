import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import ProtectedRoute from '../../../features/auth/components/ProtectedRoute';
import TestWrapper from '../../mocks/TestWrapper';
import useAuth from '../../../shared/context/auth/AuthContext';

const mockCurrentUser = { 
  uid: 'test-user-id', 
  email: 'test@example.com',
  organizationId: 'org-1',
  role: 'admin' as const
};

vi.mock('../../../shared/context/auth/AuthContext', () => ({
  default: vi.fn(),
}));

vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    Navigate: ({ to }: { to: string }) => <div data-testid="navigate">Navigate to {to}</div>,
    Outlet: () => <div data-testid="outlet">Protected Content</div>,
  };
});

describe('ProtectedRoute Component', () => {
  const mockUseAuth = vi.mocked(useAuth);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders Outlet when user is authenticated', () => {
    mockUseAuth.mockReturnValue({
      currentUser: mockCurrentUser,
      login: vi.fn(),
      logout: vi.fn(),
      loading: false,
    });

    render(
      <TestWrapper>
        <ProtectedRoute />
      </TestWrapper>
    );

    expect(screen.getByTestId('outlet')).toBeInTheDocument();
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('redirects to login when user is not authenticated', () => {
    mockUseAuth.mockReturnValue({
      currentUser: null,
      login: vi.fn(),
      logout: vi.fn(),
      loading: false,
    });

    render(
      <TestWrapper>
        <ProtectedRoute />
      </TestWrapper>
    );

    expect(screen.getByTestId('navigate')).toBeInTheDocument();
    expect(screen.getByText('Navigate to /login')).toBeInTheDocument();
    expect(screen.queryByTestId('outlet')).not.toBeInTheDocument();
  });

  it('redirects to login when currentUser is null', () => {
    mockUseAuth.mockReturnValue({
      currentUser: null,
      login: vi.fn(),
      logout: vi.fn(),
      loading: false,
    });

    render(
      <TestWrapper>
        <ProtectedRoute />
      </TestWrapper>
    );

    expect(screen.getByTestId('navigate')).toBeInTheDocument();
    expect(screen.getByText('Navigate to /login')).toBeInTheDocument();
  });

  it('handles falsy currentUser values', () => {
    mockUseAuth.mockReturnValue({
      currentUser: false as any,
      login: vi.fn(),
      logout: vi.fn(),
      loading: false,
    });

    render(
      <TestWrapper>
        <ProtectedRoute />
      </TestWrapper>
    );

    expect(screen.getByTestId('navigate')).toBeInTheDocument();
  });
});
