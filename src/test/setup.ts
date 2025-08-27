import '@testing-library/jest-dom';
import { vi } from 'vitest';
import React from 'react';

// Mock idb module first
vi.mock('idb', () => ({
  openDB: vi.fn(() => Promise.resolve({
    transaction: vi.fn(() => ({
      objectStore: vi.fn(() => ({
        add: vi.fn(),
        put: vi.fn(),
        get: vi.fn(),
        delete: vi.fn(),
        getAll: vi.fn(() => Promise.resolve([])),
      })),
      done: Promise.resolve(),
    })),
    close: vi.fn(),
  })),
}));

// Mock IndexedDB for logistics tests
const mockIndexedDB = {
  open: vi.fn(() => {
    const mockRequest = {
      result: {
        objectStoreNames: { contains: vi.fn(() => false) },
        createObjectStore: vi.fn(() => ({
          createIndex: vi.fn(),
        })),
        transaction: vi.fn(() => ({
          objectStore: vi.fn(() => ({
            add: vi.fn(),
            get: vi.fn(),
            getAll: vi.fn(),
            put: vi.fn(),
            delete: vi.fn(),
          })),
        })),
      },
      onerror: null,
      onsuccess: null as any,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };
    
    // Simulate successful open
    setTimeout(() => {
      if (mockRequest.onsuccess) {
        mockRequest.onsuccess({ target: mockRequest } as any);
      }
    }, 0);
    
    return mockRequest;
  }),
  deleteDatabase: vi.fn(),
};

(global as any).indexedDB = mockIndexedDB;
(global as any).IDBRequest = vi.fn();
(global as any).IDBOpenDBRequest = vi.fn();
(global as any).IDBDatabase = vi.fn();
(global as any).IDBTransaction = vi.fn();
(global as any).IDBObjectStore = vi.fn();
(global as any).IDBKeyRange = vi.fn();
(global as any).IDBCursor = vi.fn();
(global as any).IDBIndex = vi.fn();

// Mock Firebase
vi.mock('../shared/firebase/firebase', () => ({
  auth: {
    currentUser: null,
    signInWithEmailAndPassword: vi.fn(),
    signOut: vi.fn(),
    onAuthStateChanged: vi.fn(),
  },
  db: {},
  storage: {},
}));

// Mock React Router
vi.mock('react-router', () => ({
  useNavigate: () => vi.fn(),
  useLocation: () => ({ pathname: '/', search: '', state: null }),
  useParams: () => ({}),
  useMatch: vi.fn(() => null),
  Navigate: ({ to }: { to: string }) => `Navigate to ${to}`,
  Link: vi.fn(({ to, children, className, ...props }: any) => 
    React.createElement('a', { href: to, className, ...props }, children)
  ),
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

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  disconnect: vi.fn(),
  unobserve: vi.fn(),
}));

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  disconnect: vi.fn(),
  unobserve: vi.fn(),
}));

// Mock console methods to avoid noise in tests
global.console = {
  ...console,
  warn: vi.fn(),
  error: vi.fn(),
};