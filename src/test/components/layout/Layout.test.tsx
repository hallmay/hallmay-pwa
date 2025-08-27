import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import TestWrapper from '../../mocks/TestWrapper';
import Layout from '../../../shared/components/layout/index';

// Override the react-router mock specifically for layout tests
vi.mock('react-router', () => ({
  useNavigate: () => vi.fn(),
  useLocation: () => ({ pathname: '/', search: '', state: null }),
  useParams: () => ({}),
  Navigate: ({ to }: { to: string }) => `Navigate to ${to}`,
  Routes: ({ children }: { children: React.ReactNode }) => children,
  Route: ({ element }: { element: React.ReactNode }) => element,
  BrowserRouter: vi.fn(({ children }: { children: React.ReactNode }) => 
    React.createElement('div', { 'data-testid': 'mock-router' }, children)
  ),
  MemoryRouter: vi.fn(({ children }: { children: React.ReactNode }) => 
    React.createElement('div', { 'data-testid': 'mock-memory-router' }, children)
  ),
  NavLink: vi.fn(({ children, to, className, ...props }: any) => {
    const isActive = false;
    const resolvedClassName = typeof className === 'function' ? className({ isActive }) : className;
    return React.createElement('a', { href: to, className: resolvedClassName, ...props }, children);
  }),
  Outlet: vi.fn(() => React.createElement('div', { 'data-testid': 'mock-outlet' }, 'Mock Outlet')),
}));

// Mock child components
vi.mock('../../../shared/components/layout/desktop/Sidebar', () => ({
  DesktopSidebar: ({ navItems }: { navItems: any[] }) => (
    <div data-testid="desktop-sidebar" data-nav-items={navItems.length}>
      Desktop Sidebar
    </div>
  )
}));

vi.mock('../../../shared/components/layout/mobile/Header', () => ({
  MobileHeader: ({ isUserMenuOpen, setIsUserMenuOpen, menuRef }: any) => (
    <div 
      data-testid="mobile-header" 
      data-menu-open={isUserMenuOpen}
      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
      ref={menuRef}
    >
      Mobile Header
    </div>
  )
}));

vi.mock('../../../shared/components/layout/mobile/BottomBar', () => ({
  MobileBottomNav: ({ navItems }: { navItems: any[] }) => (
    <div data-testid="mobile-bottom-nav" data-nav-items={navItems.length}>
      Mobile Bottom Nav
    </div>
  )
}));

vi.mock('../../../shared/components/layout/desktop/Header', () => ({
  DesktopHeader: ({ isUserMenuOpen, setIsUserMenuOpen, menuRef }: any) => (
    <div 
      data-testid="desktop-header" 
      data-menu-open={isUserMenuOpen}
      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
      ref={menuRef}
    >
      Desktop Header
    </div>
  )
}));

// Mock device type hook
vi.mock('../../../shared/hooks/useDeviceType', () => ({
  default: vi.fn(() => ({ isMobile: false, isTablet: false, isDesktop: true }))
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  ChartColumnIncreasing: () => <div data-testid="chart-icon">Chart</div>,
  ClipboardList: () => <div data-testid="clipboard-icon">Clipboard</div>,
  Archive: () => <div data-testid="archive-icon">Archive</div>,
  Tractor: () => <div data-testid="tractor-icon">Tractor</div>,
  Truck: () => <div data-testid="truck-icon">Truck</div>
}));

describe('Layout Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all main layout components', () => {
    render(
      <TestWrapper>
        <Layout />
      </TestWrapper>
    );

    expect(screen.getByTestId('desktop-sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('mobile-header')).toBeInTheDocument();
    expect(screen.getByTestId('desktop-header')).toBeInTheDocument();
    expect(screen.getByTestId('mobile-bottom-nav')).toBeInTheDocument();
    expect(screen.getByTestId('mock-outlet')).toBeInTheDocument();
  });

  it('has correct nav items structure', () => {
    render(
      <TestWrapper>
        <Layout />
      </TestWrapper>
    );

    // Should have 5 nav items
    expect(screen.getByTestId('desktop-sidebar')).toHaveAttribute('data-nav-items', '5');
    expect(screen.getByTestId('mobile-bottom-nav')).toHaveAttribute('data-nav-items', '5');
  });

  it('manages user menu state correctly', () => {
    render(
      <TestWrapper>
        <Layout />
      </TestWrapper>
    );

    const mobileHeader = screen.getByTestId('mobile-header');
    const desktopHeader = screen.getByTestId('desktop-header');

    // Initially menu should be closed
    expect(mobileHeader).toHaveAttribute('data-menu-open', 'false');
    expect(desktopHeader).toHaveAttribute('data-menu-open', 'false');

    // Click to open menu
    fireEvent.click(mobileHeader);

    expect(mobileHeader).toHaveAttribute('data-menu-open', 'true');
    expect(desktopHeader).toHaveAttribute('data-menu-open', 'true');
  });

  it('handles click outside to close menu', () => {
    render(
      <TestWrapper>
        <Layout />
      </TestWrapper>
    );

    const mobileHeader = screen.getByTestId('mobile-header');

    // Open menu first
    fireEvent.click(mobileHeader);
    expect(mobileHeader).toHaveAttribute('data-menu-open', 'true');

    // Click outside
    fireEvent.mouseDown(document.body);

    expect(mobileHeader).toHaveAttribute('data-menu-open', 'false');
  });

  it('has correct main layout structure', () => {
    const { container } = render(
      <TestWrapper>
        <Layout />
      </TestWrapper>
    );

    const mainContainer = container.querySelector('.flex.flex-col.lg\\:flex-row.min-h-screen.bg-background.text-text-primary');
    expect(mainContainer).toBeInTheDocument();

    const contentArea = container.querySelector('.flex-1.flex.flex-col.lg\\:ml-20');
    expect(contentArea).toBeInTheDocument();

    const mainContent = container.querySelector('main.flex-1.overflow-y-auto.p-4.lg\\:p-6.pb-24.lg\\:pb-6');
    expect(mainContent).toBeInTheDocument();
  });

  it('renders outlet for child routes', () => {
    render(
      <TestWrapper>
        <Layout />
      </TestWrapper>
    );

    expect(screen.getByTestId('mock-outlet')).toBeInTheDocument();
    expect(screen.getByText('Mock Outlet')).toBeInTheDocument();
  });

  it('has proper responsive classes', () => {
    const { container } = render(
      <TestWrapper>
        <Layout />
      </TestWrapper>
    );

    // Check for responsive classes
    expect(container.querySelector('.lg\\:flex-row')).toBeInTheDocument();
    expect(container.querySelector('.lg\\:ml-20')).toBeInTheDocument();
    expect(container.querySelector('.lg\\:p-6')).toBeInTheDocument();
    expect(container.querySelector('.lg\\:pb-6')).toBeInTheDocument();
  });

  it('configures nav items with correct structure', () => {
    render(
      <TestWrapper>
        <Layout />
      </TestWrapper>
    );

    // Verify that nav items are passed correctly
    const sidebar = screen.getByTestId('desktop-sidebar');
    const bottomNav = screen.getByTestId('mobile-bottom-nav');

    expect(sidebar).toHaveAttribute('data-nav-items', '5');
    expect(bottomNav).toHaveAttribute('data-nav-items', '5');
  });

  it('handles touch events for mobile', () => {
    render(
      <TestWrapper>
        <Layout />
      </TestWrapper>
    );

    const mobileHeader = screen.getByTestId('mobile-header');

    // Open menu
    fireEvent.click(mobileHeader);
    expect(mobileHeader).toHaveAttribute('data-menu-open', 'true');

    // Touch outside
    fireEvent.touchStart(document.body);

    expect(mobileHeader).toHaveAttribute('data-menu-open', 'false');
  });

  it('cleans up event listeners on unmount', () => {
    const addEventListenerSpy = vi.spyOn(document, 'addEventListener');
    const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');

    const { unmount } = render(
      <TestWrapper>
        <Layout />
      </TestWrapper>
    );

    const mobileHeader = screen.getByTestId('mobile-header');

    // Open menu to trigger event listeners
    fireEvent.click(mobileHeader);

    // Should add event listeners
    expect(addEventListenerSpy).toHaveBeenCalledWith('mousedown', expect.any(Function));
    expect(addEventListenerSpy).toHaveBeenCalledWith('touchstart', expect.any(Function));

    // Unmount component
    unmount();

    // Should remove event listeners
    expect(removeEventListenerSpy).toHaveBeenCalledWith('mousedown', expect.any(Function));
    expect(removeEventListenerSpy).toHaveBeenCalledWith('touchstart', expect.any(Function));
  });

  it('exports Layout as default export', () => {
    expect(Layout).toBeDefined();
    expect(typeof Layout).toBe('function');
  });
});
