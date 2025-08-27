import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import withRole from '../../../features/auth/components/WithRole';
import TestWrapper from '../../mocks/TestWrapper';
import useAuth from '../../../shared/context/auth/AuthContext';

// Mock component to test HOC
const TestComponent = (props: any) => <div data-testid="test-component">Test Component Content {props.testProp}</div>;

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
  };
});

describe('withRole HOC', () => {
  const mockUseAuth = vi.mocked(useAuth);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders component when user has allowed role', () => {
    mockUseAuth.mockReturnValue({
      currentUser: mockCurrentUser,
      login: vi.fn(),
      logout: vi.fn(),
      loading: false,
    });

    const ProtectedComponent = withRole(TestComponent, ['admin', 'superadmin']);

    render(
      <TestWrapper>
        <ProtectedComponent testProp="value" />
      </TestWrapper>
    );

    expect(screen.getByTestId('test-component')).toBeInTheDocument();
    expect(screen.getByText('Test Component Content value')).toBeInTheDocument();
  });

  it('redirects when user does not have allowed role', () => {
    mockUseAuth.mockReturnValue({
      currentUser: { ...mockCurrentUser, role: 'user' },
      login: vi.fn(),
      logout: vi.fn(),
      loading: false,
    });

    const ProtectedComponent = withRole(TestComponent, ['admin', 'superadmin']);

    render(
      <TestWrapper>
        <ProtectedComponent />
      </TestWrapper>
    );

    expect(screen.getByTestId('navigate')).toBeInTheDocument();
    expect(screen.getByText('Navigate to /')).toBeInTheDocument();
    expect(screen.queryByTestId('test-component')).not.toBeInTheDocument();
  });

  it('redirects when user is not authenticated', () => {
    mockUseAuth.mockReturnValue({
      currentUser: null,
      login: vi.fn(),
      logout: vi.fn(),
      loading: false,
    });

    const ProtectedComponent = withRole(TestComponent, ['admin']);

    render(
      <TestWrapper>
        <ProtectedComponent />
      </TestWrapper>
    );

    expect(screen.getByTestId('navigate')).toBeInTheDocument();
    expect(screen.getByText('Navigate to /')).toBeInTheDocument();
  });

  it('redirects when user has no role property', () => {
    mockUseAuth.mockReturnValue({
      currentUser: { uid: 'test-user-id', organizationId: 'org-1', role: undefined } as any, // No role property
      login: vi.fn(),
      logout: vi.fn(),
      loading: false,
    });

    const ProtectedComponent = withRole(TestComponent, ['admin']);

    render(
      <TestWrapper>
        <ProtectedComponent />
      </TestWrapper>
    );

    expect(screen.getByTestId('navigate')).toBeInTheDocument();
  });

  it('handles multiple allowed roles', () => {
    mockUseAuth.mockReturnValue({
      currentUser: { ...mockCurrentUser, role: 'field-owner' },
      login: vi.fn(),
      logout: vi.fn(),
      loading: false,
    });

    const ProtectedComponent = withRole(TestComponent, ['admin', 'field-owner', 'superadmin']);

    render(
      <TestWrapper>
        <ProtectedComponent />
      </TestWrapper>
    );

    expect(screen.getByTestId('test-component')).toBeInTheDocument();
  });

  it('passes props to wrapped component', () => {
    mockUseAuth.mockReturnValue({
      currentUser: mockCurrentUser,
      login: vi.fn(),
      logout: vi.fn(),
      loading: false,
    });

    const ProtectedComponent = withRole(TestComponent, ['admin']);

    render(
      <TestWrapper>
        <ProtectedComponent testProp="test-value" anotherProp={123} />
      </TestWrapper>
    );

    expect(screen.getByText('Test Component Content test-value')).toBeInTheDocument();
  });

  it('handles empty allowed roles array', () => {
    mockUseAuth.mockReturnValue({
      currentUser: mockCurrentUser,
      login: vi.fn(),
      logout: vi.fn(),
      loading: false,
    });

    const ProtectedComponent = withRole(TestComponent, []);

    render(
      <TestWrapper>
        <ProtectedComponent />
      </TestWrapper>
    );

    expect(screen.getByTestId('navigate')).toBeInTheDocument();
  });
});
