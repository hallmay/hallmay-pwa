import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DesktopSidebar } from '../../../shared/components/layout/desktop/Sidebar';
import { TestWrapper } from '../../mocks/TestWrapper';
import { Archive, Users, BarChart3 } from 'lucide-react';

// Mock de react-router NavLink
vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    NavLink: ({ children, to, className }: any) => {
      const appliedClassName = typeof className === 'function' 
        ? className({ isActive: false }) 
        : className;
      return <a href={to} className={appliedClassName}>{children}</a>;
    },
  };
});

// Mock de useAuth
vi.mock('../../../shared/context/auth/AuthContext', () => ({
  default: () => ({
    currentUser: {
      id: 'user1',
      email: 'test@example.com',
      role: 'admin',
      name: 'Test User'
    }
  })
}));

describe('DesktopSidebar Component', () => {
  const mockNavItems = [
    {
      name: 'Silobags',
      icon: Archive,
      path: '/silobags',
      roles: ['admin', 'user']
    },
    {
      name: 'Usuarios',
      icon: Users,
      path: '/users',
      roles: ['admin']
    },
    {
      name: 'Reportes',
      icon: BarChart3,
      path: '/reports'
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders sidebar with logo', () => {
    render(
      <TestWrapper>
        <DesktopSidebar navItems={mockNavItems} />
      </TestWrapper>
    );

    const logo = screen.getByAltText('Logo de Hallmay');
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('src');
  });

  it('renders navigation items correctly', () => {
    render(
      <TestWrapper>
        <DesktopSidebar navItems={mockNavItems} />
      </TestWrapper>
    );

    // Verificar que los tooltips estén presentes (que indican los items de navegación)
    expect(screen.getByText('Silobags')).toBeInTheDocument();
    expect(screen.getByText('Usuarios')).toBeInTheDocument();
    expect(screen.getByText('Reportes')).toBeInTheDocument();
  });

  it('displays tooltips on hover', () => {
    render(
      <TestWrapper>
        <DesktopSidebar navItems={mockNavItems} />
      </TestWrapper>
    );

    // Los tooltips deberían estar en el DOM pero ocultos (opacity-0)
    const silobagsTooltip = screen.getByText('Silobags');
    const usuariosTooltip = screen.getByText('Usuarios');
    const reportesTooltiip = screen.getByText('Reportes');
    
    expect(silobagsTooltip).toBeInTheDocument();
    expect(usuariosTooltip).toBeInTheDocument();
    expect(reportesTooltiip).toBeInTheDocument();
  });

  it('applies correct href attributes to navigation links', () => {
    render(
      <TestWrapper>
        <DesktopSidebar navItems={mockNavItems} />
      </TestWrapper>
    );

    const links = screen.getAllByRole('link');
    
    // Filtrar solo los links de navegación (excluir posibles otros links)
    const navLinks = links.filter(link => 
      link.getAttribute('href')?.includes('/silobags') ||
      link.getAttribute('href')?.includes('/users') ||
      link.getAttribute('href')?.includes('/reports')
    );

    expect(navLinks).toHaveLength(3);
    expect(navLinks[0]).toHaveAttribute('href', '/silobags');
    expect(navLinks[1]).toHaveAttribute('href', '/users');
    expect(navLinks[2]).toHaveAttribute('href', '/reports');
  });

  it('renders with empty navigation items', () => {
    render(
      <TestWrapper>
        <DesktopSidebar navItems={[]} />
      </TestWrapper>
    );

    const logo = screen.getByAltText('Logo de Hallmay');
    expect(logo).toBeInTheDocument();
    
    // No debería haber items de navegación
    const navSection = screen.getByRole('navigation');
    expect(navSection).toBeInTheDocument();
  });

  it('renders basic navigation structure', () => {
    render(
      <TestWrapper>
        <DesktopSidebar navItems={mockNavItems} />
      </TestWrapper>
    );

    // Verificar estructura básica
    expect(screen.getByText('Silobags')).toBeInTheDocument();
    expect(screen.getByText('Reportes')).toBeInTheDocument();
    
    // Verificar que hay links presentes
    const links = screen.getAllByRole('link');
    expect(links.length).toBeGreaterThan(0);
  });

  it('shows all items when user has no role restrictions', () => {
    const itemsWithoutRoles = [
      {
        name: 'Dashboard',
        icon: BarChart3,
        path: '/dashboard'
      },
      {
        name: 'Settings',
        icon: Archive,
        path: '/settings'
      }
    ];

    render(
      <TestWrapper>
        <DesktopSidebar navItems={itemsWithoutRoles} />
      </TestWrapper>
    );

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('handles basic authentication correctly', () => {
    render(
      <TestWrapper>
        <DesktopSidebar navItems={mockNavItems} />
      </TestWrapper>
    );

    // Con el mock de AuthContext configurado, debería mostrar todos los items
    expect(screen.getByText('Silobags')).toBeInTheDocument();
    expect(screen.getByText('Usuarios')).toBeInTheDocument();
    expect(screen.getByText('Reportes')).toBeInTheDocument();
  });

  it('applies correct CSS classes for layout', () => {
    const { container } = render(
      <TestWrapper>
        <DesktopSidebar navItems={mockNavItems} />
      </TestWrapper>
    );

    const sidebar = container.querySelector('aside');
    expect(sidebar).toHaveClass('hidden', 'lg:flex', 'fixed', 'left-0', 'top-0');
    expect(sidebar).toHaveClass('w-20', 'h-full', 'bg-secondary');
  });
});
