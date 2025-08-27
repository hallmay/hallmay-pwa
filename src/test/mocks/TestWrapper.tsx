import React from 'react';
import { AuthProvider } from './authMock';
import { SyncProvider } from './syncMock';

interface TestWrapperProps {
  children: React.ReactNode;
}

// Mock NavLink component
const MockNavLink: React.FC<any> = ({ children, to, className, ...props }) => {
  const isActive = false; // For testing purposes, we can set this to false
  const resolvedClassName = typeof className === 'function' ? className({ isActive }) : className;
  
  return (
    <div data-testid="mock-navlink" data-to={to} className={resolvedClassName} {...props}>
      {typeof children === 'function' ? children({ isActive }) : children}
    </div>
  );
};

// Mock MemoryRouter component
const MockMemoryRouter: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <div data-testid="mock-memory-router">{children}</div>;
};

// Mock Outlet component
const MockOutlet: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return <div data-testid="mock-outlet">{children}</div>;
};

// Mock router component for testing
const MockRouter: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <div data-testid="mock-router">{children}</div>;
};

export const TestWrapper: React.FC<TestWrapperProps> = ({ children }) => {
  return (
    <MockRouter>
      <AuthProvider>
        <SyncProvider>
          {children}
        </SyncProvider>
      </AuthProvider>
    </MockRouter>
  );
};

export default TestWrapper;

// Export the mock components for use in tests
export { MockNavLink, MockMemoryRouter, MockOutlet };
