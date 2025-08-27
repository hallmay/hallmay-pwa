import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useHarvestSessionRegisters } from '../../../features/harvest/hooks/useHarvestSessionRegisters';
import useAuth from '../../../shared/context/auth/AuthContext';
import { onSnapshot } from 'firebase/firestore';

// Mock Firebase
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  onSnapshot: vi.fn(),
  orderBy: vi.fn(),
  query: vi.fn(),
}));

// Mock Firebase config
vi.mock('../../../shared/firebase/firebase', () => ({
  db: {},
}));

// Mock AuthContext
vi.mock('../../../shared/context/auth/AuthContext');

// Mock query builder
vi.mock('../../../shared/firebase/queryBuilder', () => ({
  createSecurityQuery: vi.fn(() => ({
    withFieldAccess: vi.fn(() => ({
      build: vi.fn(() => []),
    })),
  })),
}));

const mockUseAuth = useAuth as ReturnType<typeof vi.fn>;
const mockOnSnapshot = onSnapshot as ReturnType<typeof vi.fn>;

describe('useHarvestSessionRegisters', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Set default mock for auth context
    mockUseAuth.mockReturnValue({
      currentUser: { uid: 'test-user', organizationId: 'org-1' },
      loading: false,
    });
  });

  it('should return initial loading state', () => {
    mockOnSnapshot.mockImplementation(() => vi.fn());

    const { result } = renderHook(() => useHarvestSessionRegisters('session-1'));

    expect(result.current.registers).toEqual([]);
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('should fetch registers successfully', async () => {
    const mockRegisters = [
      { 
        id: 'register-1',
        date: '2024-01-01',
        quantity: 1000,
        destination: 'Silo A'
      },
      { 
        id: 'register-2',
        date: '2024-01-02',
        quantity: 800,
        destination: 'Silo B'
      },
    ];

    mockOnSnapshot.mockImplementation((_query: any, onNext: any) => {
      setTimeout(() => {
        const snapshot = {
          docs: mockRegisters.map(register => ({
            id: register.id,
            data: () => register,
          })),
        };
        onNext(snapshot);
      }, 0);
      return vi.fn();
    });

    const { result } = renderHook(() => useHarvestSessionRegisters('session-1'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.registers).toHaveLength(2);
    expect(result.current.registers[0]).toEqual(mockRegisters[0]);
    expect(result.current.error).toBeNull();
  });

  it('should handle Firebase error', async () => {
    const mockError = new Error('Firebase error');

    mockOnSnapshot.mockImplementation((_query: any, _onNext: any, onError: any) => {
      setTimeout(() => {
        onError(mockError);
      }, 0);
      return vi.fn();
    });

    const { result } = renderHook(() => useHarvestSessionRegisters('session-1'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.registers).toEqual([]);
    expect(result.current.error).toBe(mockError.message);
  });

  it('should handle missing harvestSessionId', () => {
    const { result } = renderHook(() => useHarvestSessionRegisters(''));

    expect(result.current.registers).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should cleanup subscription on unmount', () => {
    const mockUnsubscribe = vi.fn();
    mockOnSnapshot.mockReturnValue(mockUnsubscribe);

    const { unmount } = renderHook(() => useHarvestSessionRegisters('session-1'));

    unmount();

    expect(mockUnsubscribe).toHaveBeenCalled();
  });

  it('should handle auth loading state', () => {
    mockUseAuth.mockReturnValue({
      currentUser: null,
      loading: true,
    });

    const { result } = renderHook(() => useHarvestSessionRegisters('session-1'));

    expect(result.current.registers).toEqual([]);
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('should handle user not authenticated', () => {
    mockUseAuth.mockReturnValue({
      currentUser: null,
      loading: false,
    });

    const { result } = renderHook(() => useHarvestSessionRegisters('session-1'));

    expect(result.current.registers).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should handle empty snapshot', async () => {
    mockOnSnapshot.mockImplementation((_query: any, onNext: any) => {
      setTimeout(() => {
        const snapshot = { docs: [] };
        onNext(snapshot);
      }, 0);
      return vi.fn();
    });

    const { result } = renderHook(() => useHarvestSessionRegisters('session-1'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.registers).toEqual([]);
    expect(result.current.error).toBeNull();
  });
});
