import { vi } from 'vitest';
import React from 'react';

export const mockAuthContext = {
  currentUser: null,
  login: vi.fn(),
  logout: vi.fn(),
  loading: false,
  user: null,
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  return <div data-testid="mock-auth-provider">{children}</div>;
};

export default () => mockAuthContext;
