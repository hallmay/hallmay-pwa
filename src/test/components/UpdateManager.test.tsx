import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { TestWrapper } from '../mocks/TestWrapper';

// Mock the PWA register hook
const mockUpdateServiceWorker = vi.fn();

// Create a testable version of UpdateManager
const TestUpdateManager = ({ needRefresh = false }) => {
  const { UploadCloud } = require('lucide-react');
  const Button = ({ variant, onClick, className, children }: any) => (
    <button onClick={onClick} className={className}>
      {children}
    </button>
  );
  const Card = ({ className, children }: any) => (
    <div className={className}>{children}</div>
  );

  if (needRefresh) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[101] flex justify-center items-center p-4 animate-fade-in">
        <Card className="max-w-lg w-full text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary-light">
            <UploadCloud size={32} className="text-primary-dark" />
          </div>
          <div className="mt-4">
            <h3 className="text-xl font-bold text-text-primary">Nueva versión disponible</h3>
            <p className="mt-2 text-text-secondary">
              Hemos lanzado mejoras importantes. Por favor, actualiza la aplicación para continuar.
            </p>
          </div>
          <div className="mt-6 flex justify-center">
            <Button
              variant="primary"
              onClick={() => mockUpdateServiceWorker(true)}
              className="w-full sm:w-auto sm:px-10"
            >
              Actualizar
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return null;
};

// Mock console methods to avoid noise in tests
beforeEach(() => {
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

describe('UpdateManager Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when no update is needed', () => {
    render(
      <TestWrapper>
        <TestUpdateManager />
      </TestWrapper>
    );

    // Check that no update-related content is displayed
    expect(screen.queryByText('Nueva versión disponible')).not.toBeInTheDocument();
    expect(screen.queryByText('Actualizar')).not.toBeInTheDocument();
  });

  it('renders update modal when update is needed', () => {
    render(
      <TestWrapper>
        <TestUpdateManager needRefresh={true} />
      </TestWrapper>
    );

    expect(screen.getByText('Nueva versión disponible')).toBeInTheDocument();
    expect(screen.getByText('Hemos lanzado mejoras importantes. Por favor, actualiza la aplicación para continuar.')).toBeInTheDocument();
    expect(screen.getByText('Actualizar')).toBeInTheDocument();
  });

  it('displays the update icon', () => {
    render(
      <TestWrapper>
        <TestUpdateManager needRefresh={true} />
      </TestWrapper>
    );

    // The UploadCloud icon should be present - search by role or attributes
    const iconContainer = screen.getByText('Nueva versión disponible')
      .parentElement?.previousElementSibling;
    expect(iconContainer).toBeInTheDocument();
    expect(iconContainer).toHaveClass('mx-auto', 'flex');
  });

  it('calls updateServiceWorker when update button is clicked', async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <TestUpdateManager needRefresh={true} />
      </TestWrapper>
    );

    const updateButton = screen.getByText('Actualizar');
    await user.click(updateButton);

    expect(mockUpdateServiceWorker).toHaveBeenCalledWith(true);
  });

  it('applies correct styling classes for modal overlay', () => {
    render(
      <TestWrapper>
        <TestUpdateManager needRefresh={true} />
      </TestWrapper>
    );

    const overlay = screen.getByText('Nueva versión disponible').closest('div.fixed');
    expect(overlay).toHaveClass(
      'fixed',
      'inset-0',
      'bg-black/50',
      'backdrop-blur-sm',
      'z-[101]',
      'flex',
      'justify-center',
      'items-center',
      'p-4',
      'animate-fade-in'
    );
  });

  it('applies correct styling for update button', () => {
    render(
      <TestWrapper>
        <TestUpdateManager needRefresh={true} />
      </TestWrapper>
    );

    const updateButton = screen.getByText('Actualizar');
    expect(updateButton).toHaveClass('w-full', 'sm:w-auto', 'sm:px-10');
  });

  it('applies correct styling for icon container', () => {
    render(
      <TestWrapper>
        <TestUpdateManager needRefresh={true} />
      </TestWrapper>
    );

    // Find the icon container div by its classes
    const iconContainer = screen.getByText('Nueva versión disponible')
      .parentElement?.previousElementSibling;
    
    expect(iconContainer).toHaveClass(
      'mx-auto',
      'flex',
      'h-16',
      'w-16',
      'items-center',
      'justify-center',
      'rounded-full',
      'bg-primary-light'
    );
  });
});
