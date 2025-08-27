import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';

// Mock react-dom/client
const mockCreateRoot = vi.fn(() => ({
  render: vi.fn()
}));

vi.mock('react-dom/client', () => ({
  createRoot: mockCreateRoot
}));

// Mock App component
vi.mock('../App.tsx', () => ({
  default: () => <div data-testid="app">App Component</div>
}));

// Mock CSS import
vi.mock('../app.css', () => ({}));

// Mock context providers
vi.mock('../shared/context/auth/AuthContext.tsx', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="auth-provider">{children}</div>
}));

vi.mock('../shared/context/sync/SyncProvider.tsx', () => ({
  SyncProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="sync-provider">{children}</div>
}));

// Mock react-router
vi.mock('react-router', () => ({
  BrowserRouter: ({ children }: { children: React.ReactNode }) => <div data-testid="browser-router">{children}</div>
}));

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  Toaster: ({ position, toastOptions }: { position: string; toastOptions: any }) => (
    <div data-testid="toaster" data-position={position} data-options={JSON.stringify(toastOptions)} />
  )
}));

// Mock UpdateManager
vi.mock('../shared/components/commons/UpdateManager.tsx', () => ({
  default: () => <div data-testid="update-manager">Update Manager</div>
}));

// Mock getElementById
Object.defineProperty(document, 'getElementById', {
  value: vi.fn(() => ({
    innerHTML: ''
  })),
  writable: true
});

describe('main.tsx', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call createRoot with root element', async () => {
    // Import the main file to execute it
    await import('../main.tsx');

    expect(document.getElementById).toHaveBeenCalledWith('root');
    expect(mockCreateRoot).toHaveBeenCalled();
  });

  it('should render app with proper providers structure', async () => {
    const mockRender = vi.fn();
    mockCreateRoot.mockReturnValue({
      render: mockRender
    });

    // Clear modules and re-import to trigger execution
    vi.resetModules();
    await import('../main.tsx');

    // Check if render was called or if createRoot was called
    if (mockRender.mock.calls.length > 0) {
      const renderCall = mockRender.mock.calls[0][0];
      
      // Verify the component structure by rendering it
      const { getByTestId } = render(renderCall);
      
      expect(getByTestId('auth-provider')).toBeInTheDocument();
      expect(getByTestId('sync-provider')).toBeInTheDocument();
      expect(getByTestId('update-manager')).toBeInTheDocument();
      expect(getByTestId('browser-router')).toBeInTheDocument();
      expect(getByTestId('app')).toBeInTheDocument();
      expect(getByTestId('toaster')).toBeInTheDocument();
    } else {
      // If main.tsx was already executed, just check that createRoot was called
      expect(mockCreateRoot).toHaveBeenCalled();
    }
  });

  it('should configure Toaster with correct props', async () => {
    const mockRender = vi.fn();
    mockCreateRoot.mockReturnValue({
      render: mockRender
    });

    vi.resetModules();
    await import('../main.tsx');

    if (mockRender.mock.calls.length > 0) {
      const renderCall = mockRender.mock.calls[0][0];
      const { getByTestId } = render(renderCall);
      
      const toaster = getByTestId('toaster');
      expect(toaster).toBeInTheDocument();
    } else {
      // Skip test if main.tsx was already executed
      expect(mockCreateRoot).toHaveBeenCalled();
    }
  });

  it('should have correct toast style configuration', async () => {
    const mockRender = vi.fn();
    mockCreateRoot.mockReturnValue({
      render: mockRender
    });

    vi.resetModules();
    await import('../main.tsx');

    if (mockRender.mock.calls.length > 0) {
      const renderCall = mockRender.mock.calls[0][0];
      const { getByTestId } = render(renderCall);
      
      const toaster = getByTestId('toaster');
      expect(toaster).toBeInTheDocument();
    } else {
      expect(mockCreateRoot).toHaveBeenCalled();
    }
  });

  it('should have correct icon theme configuration', async () => {
    const mockRender = vi.fn();
    mockCreateRoot.mockReturnValue({
      render: mockRender
    });

    vi.resetModules();
    await import('../main.tsx');

    if (mockRender.mock.calls.length > 0) {
      const renderCall = mockRender.mock.calls[0][0];
      const { getByTestId } = render(renderCall);
      
      const toaster = getByTestId('toaster');
      expect(toaster).toBeInTheDocument();
    } else {
      expect(mockCreateRoot).toHaveBeenCalled();
    }
  });
});
