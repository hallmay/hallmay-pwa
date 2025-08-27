import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginPage from '../../../features/auth/LoginPage';
import TestWrapper from '../../mocks/TestWrapper';

// Mock useAuth hook
const mockLogin = vi.fn();
const mockNavigate = vi.fn();

vi.mock('../../../shared/context/auth/AuthContext', () => ({
  default: () => ({
    login: mockLogin,
    currentUser: null,
  }),
}));

vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('LoginPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders login form correctly', () => {
    render(
      <TestWrapper>
        <LoginPage />
      </TestWrapper>
    );

    expect(screen.getByText('Bienvenido a Hallmay')).toBeInTheDocument();
    expect(screen.getByText('Ingresa tus credenciales para continuar')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/correo/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/contraseña/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument();
  });

  it('shows password toggle functionality', async () => {
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <LoginPage />
      </TestWrapper>
    );

    const passwordInput = screen.getByPlaceholderText(/contraseña/i);
    const toggleButton = screen.getByRole('button', { name: /mostrar contraseña/i });

    // Initially password should be hidden
    expect(passwordInput).toHaveAttribute('type', 'password');

    // Click toggle to show password
    await user.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'text');

    // Click toggle again to hide password
    await user.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('handles form submission with valid data', async () => {
    const user = userEvent.setup();
    mockLogin.mockResolvedValueOnce(undefined);

    render(
      <TestWrapper>
        <LoginPage />
      </TestWrapper>
    );

    // Fill form
    await user.type(screen.getByPlaceholderText(/correo/i), 'test@example.com');
    await user.type(screen.getByPlaceholderText(/contraseña/i), 'password123');

    // Submit form
    await user.click(screen.getByRole('button', { name: /iniciar sesión/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  it('displays error message on login failure', async () => {
    const user = userEvent.setup();
    mockLogin.mockRejectedValueOnce(new Error('Login failed'));

    render(
      <TestWrapper>
        <LoginPage />
      </TestWrapper>
    );

    // Fill and submit form
    await user.type(screen.getByPlaceholderText(/correo/i), 'test@example.com');
    await user.type(screen.getByPlaceholderText(/contraseña/i), 'wrongpassword');
    await user.click(screen.getByRole('button', { name: /iniciar sesión/i }));

    await waitFor(() => {
      expect(screen.getByText('Error al iniciar sesión. Verifica tus credenciales.')).toBeInTheDocument();
    });
  });

  it('shows loading state during submission', async () => {
    const user = userEvent.setup();
    let resolveLogin: (value: unknown) => void;
    mockLogin.mockImplementationOnce(() => new Promise(resolve => {
      resolveLogin = resolve;
    }));

    render(
      <TestWrapper>
        <LoginPage />
      </TestWrapper>
    );

    // Fill and submit form
    await user.type(screen.getByPlaceholderText(/correo/i), 'test@example.com');
    await user.type(screen.getByPlaceholderText(/contraseña/i), 'password123');
    await user.click(screen.getByRole('button', { name: /iniciar sesión/i }));

    // Check loading state
    const submitButton = screen.getByRole('button', { name: /ingresando/i });
    expect(submitButton).toBeDisabled();

    // Resolve the login promise
    resolveLogin!(undefined);
  });

  it('requires email and password fields', async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <LoginPage />
      </TestWrapper>
    );

    // Try to submit empty form
    await user.click(screen.getByRole('button', { name: /iniciar sesión/i }));

    // Check that login was not called
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('renders logo image', () => {
    render(
      <TestWrapper>
        <LoginPage />
      </TestWrapper>
    );

    const logo = screen.getByAltText('Logo de Hallmay');
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('src');
  });
});
