import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Home, Package, TrendingUp, BarChart3 } from 'lucide-react';

// Mock react-router first
vi.mock('react-router', () => ({
  NavLink: ({ children, to, className, ...props }: any) => {
    const isActive = false;
    const resolvedClassName = typeof className === 'function' ? className({ isActive }) : className;
    return (
      <a href={to} className={resolvedClassName} {...props}>
        {typeof children === 'function' ? children({ isActive }) : children}
      </a>
    );
  },
}));

// Mock useAuth
const mockUseAuth = vi.fn();
vi.mock('../../../shared/context/auth/AuthContext', () => ({
  default: () => mockUseAuth(),
}));

import { MobileBottomNav } from '../../../shared/components/layout/mobile/BottomBar';
import TestWrapper from '../../mocks/TestWrapper';

const mockNavItems = [
  {
    name: 'Inicio',
    icon: Home,
    path: '/',
  },
  {
    name: 'Cosecha',
    icon: Package,
    path: '/harvest',
    roles: ['admin', 'harvest_manager'],
  },
  {
    name: 'Silobags',
    icon: TrendingUp,
    path: '/silobags',
  },
  {
    name: 'Reportes',
    icon: BarChart3,
    path: '/reports',
    roles: ['admin'],
  },
];

describe('MobileBottomNav Component', () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      currentUser: { role: 'admin' },
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders navigation items correctly', () => {
    render(
      <TestWrapper>
        <MobileBottomNav navItems={mockNavItems} />
      </TestWrapper>
    );

    expect(screen.getByText('Inicio')).toBeInTheDocument();
    expect(screen.getByText('Cosecha')).toBeInTheDocument();
    expect(screen.getByText('Silobags')).toBeInTheDocument();
    expect(screen.getByText('Reportes')).toBeInTheDocument();
  });

  it('filters items based on user role', () => {
    mockUseAuth.mockReturnValue({
      currentUser: { role: 'user' },
    });

    render(
      <TestWrapper>
        <MobileBottomNav navItems={mockNavItems} />
      </TestWrapper>
    );

    expect(screen.getByText('Inicio')).toBeInTheDocument();
    expect(screen.queryByText('Cosecha')).not.toBeInTheDocument();
    expect(screen.getByText('Silobags')).toBeInTheDocument();
    expect(screen.queryByText('Reportes')).not.toBeInTheDocument();
  });

  it('shows all items for harvest_manager role', () => {
    mockUseAuth.mockReturnValue({
      currentUser: { role: 'harvest_manager' },
    });

    render(
      <TestWrapper>
        <MobileBottomNav navItems={mockNavItems} />
      </TestWrapper>
    );

    expect(screen.getByText('Inicio')).toBeInTheDocument();
    expect(screen.getByText('Cosecha')).toBeInTheDocument();
    expect(screen.getByText('Silobags')).toBeInTheDocument();
    expect(screen.queryByText('Reportes')).not.toBeInTheDocument();
  });

  it('hides all role-restricted items when user is null', () => {
    mockUseAuth.mockReturnValue({
      currentUser: null,
    });

    render(
      <TestWrapper>
        <MobileBottomNav navItems={mockNavItems} />
      </TestWrapper>
    );

    expect(screen.getByText('Inicio')).toBeInTheDocument();
    expect(screen.queryByText('Cosecha')).not.toBeInTheDocument();
    expect(screen.getByText('Silobags')).toBeInTheDocument();
    expect(screen.queryByText('Reportes')).not.toBeInTheDocument();
  });

  it('renders icons for each navigation item', () => {
    render(
      <TestWrapper>
        <MobileBottomNav navItems={mockNavItems} />
      </TestWrapper>
    );

    // Check that icons are rendered (they have specific classes)
    const icons = screen.getAllByRole('link');
    expect(icons).toHaveLength(4); // All items for admin role
  });

  it('applies correct CSS classes to navigation container', () => {
    const { container } = render(
      <TestWrapper>
        <MobileBottomNav navItems={mockNavItems} />
      </TestWrapper>
    );

    const nav = container.querySelector('nav');
    expect(nav).toHaveClass('lg:hidden', 'fixed', 'bottom-0', 'bg-secondary');
  });

  it('creates correct navigation links', () => {
    render(
      <TestWrapper>
        <MobileBottomNav navItems={mockNavItems} />
      </TestWrapper>
    );

    expect(screen.getByRole('link', { name: /inicio/i })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: /cosecha/i })).toHaveAttribute('href', '/harvest');
    expect(screen.getByRole('link', { name: /silobags/i })).toHaveAttribute('href', '/silobags');
    expect(screen.getByRole('link', { name: /reportes/i })).toHaveAttribute('href', '/reports');
  });

  it('handles empty navigation items array', () => {
    const { container } = render(
      <TestWrapper>
        <MobileBottomNav navItems={[]} />
      </TestWrapper>
    );

    const nav = container.querySelector('nav');
    expect(nav).toBeInTheDocument();
    expect(nav?.children).toHaveLength(0);
  });

  it('renders items without roles restriction', () => {
    const itemsWithoutRoles = [
      {
        name: 'Dashboard',
        icon: Home,
        path: '/dashboard',
      },
    ];

    render(
      <TestWrapper>
        <MobileBottomNav navItems={itemsWithoutRoles} />
      </TestWrapper>
    );

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });
});
