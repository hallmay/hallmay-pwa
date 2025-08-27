import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useSiloBag } from '../../../features/silobags/hooks/useSilobag';
import { onSnapshot } from 'firebase/firestore';

// Mock Firebase
vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  onSnapshot: vi.fn(),
}));

// Mock Firebase config
vi.mock('../../../shared/firebase/firebase', () => ({
  db: {},
}));

const mockOnSnapshot = onSnapshot as ReturnType<typeof vi.fn>;

describe('useSiloBag', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return initial state', () => {
    const { result } = renderHook(() => useSiloBag());

    expect(result.current.siloBag).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should set loading false when siloBagId is not provided', () => {
    const { result } = renderHook(() => useSiloBag(''));

    expect(result.current.siloBag).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should fetch silobag when siloBagId is provided', async () => {
    const mockSiloBag = {
      id: 'silobag1',
      name: 'Silobolsa Norte',
      crop: { id: 'crop1', name: 'Soja' },
      field: { id: 'field1', name: 'Campo Norte' },
      capacity: 200,
      currentWeight: 150,
      status: 'active',
    };

    const mockUnsubscribe = vi.fn();

    mockOnSnapshot.mockImplementation((_docRef, onSuccess) => {
      setTimeout(() => {
        onSuccess({
          exists: () => true,
          id: mockSiloBag.id,
          data: () => ({
            name: mockSiloBag.name,
            crop: mockSiloBag.crop,
            field: mockSiloBag.field,
            capacity: mockSiloBag.capacity,
            currentWeight: mockSiloBag.currentWeight,
            status: mockSiloBag.status,
          }),
        });
      }, 0);
      return mockUnsubscribe;
    });

    const { result } = renderHook(() => useSiloBag('silobag1'));

    // Initially loading should be true
    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.siloBag).toEqual({
      id: 'silobag1',
      name: 'Silobolsa Norte',
      crop: { id: 'crop1', name: 'Soja' },
      field: { id: 'field1', name: 'Campo Norte' },
      capacity: 200,
      currentWeight: 150,
      status: 'active',
    });
    expect(result.current.error).toBeNull();
  });

  it('should handle silobag not found', async () => {
    const mockUnsubscribe = vi.fn();

    mockOnSnapshot.mockImplementation((_docRef, onSuccess) => {
      setTimeout(() => {
        onSuccess({
          exists: () => false,
        });
      }, 0);
      return mockUnsubscribe;
    });

    const { result } = renderHook(() => useSiloBag('nonexistent'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.siloBag).toBeNull();
    expect(result.current.error).toEqual(new Error('El silobolsa no fue encontrado.'));
  });

  it('should handle query error', async () => {
    const mockUnsubscribe = vi.fn();

    mockOnSnapshot.mockImplementation((_docRef, _onSuccess, onError) => {
      setTimeout(() => {
        onError(new Error('Firestore error'));
      }, 0);
      return mockUnsubscribe;
    });

    const { result } = renderHook(() => useSiloBag('silobag1'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.siloBag).toBeNull();
    expect(result.current.error).toEqual(new Error('Firestore error'));
  });

  it('should cleanup subscription on unmount', () => {
    const mockUnsubscribe = vi.fn();

    mockOnSnapshot.mockReturnValue(mockUnsubscribe);

    const { unmount } = renderHook(() => useSiloBag('silobag1'));

    unmount();

    expect(mockUnsubscribe).toHaveBeenCalled();
  });

  it('should refetch when siloBagId changes', async () => {
    const mockUnsubscribe = vi.fn();

    mockOnSnapshot.mockReturnValue(mockUnsubscribe);

    const { rerender } = renderHook(
      ({ siloBagId }) => useSiloBag(siloBagId),
      { initialProps: { siloBagId: 'silobag1' } }
    );

    expect(mockOnSnapshot).toHaveBeenCalledTimes(1);

    // Change siloBagId
    rerender({ siloBagId: 'silobag2' });

    expect(mockOnSnapshot).toHaveBeenCalledTimes(2);
    expect(mockUnsubscribe).toHaveBeenCalledTimes(1);
  });

  it('should clear data when siloBagId becomes empty', () => {
    const mockUnsubscribe = vi.fn();

    mockOnSnapshot.mockReturnValue(mockUnsubscribe);

    const { result, rerender } = renderHook(
      ({ siloBagId }) => useSiloBag(siloBagId),
      { initialProps: { siloBagId: 'silobag1' } }
    );

    // Change to empty siloBagId
    rerender({ siloBagId: '' });

    expect(result.current.siloBag).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(mockUnsubscribe).toHaveBeenCalled();
  });
});
