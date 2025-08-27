import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useHarvestSummary } from '../../../features/reports/hooks/useHarvestsReport';
import useAuth from '../../../shared/context/auth/AuthContext';
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

// Mock Auth context
vi.mock('../../../shared/context/auth/AuthContext');

const mockUseAuth = useAuth as ReturnType<typeof vi.fn>;
const mockOnSnapshot = onSnapshot as ReturnType<typeof vi.fn>;

describe('useHarvestSummary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return initial state', () => {
    mockUseAuth.mockReturnValue({
      currentUser: null,
      loading: true,
    });

    const { result } = renderHook(() => useHarvestSummary('campaign1', 'crop1'));

    expect(result.current.harvestSummary).toBeNull();
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('should set loading false when required params are missing', () => {
    mockUseAuth.mockReturnValue({
      currentUser: { uid: 'user1', organizationId: 'org1', role: 'admin' },
      loading: false,
    });

    const { result } = renderHook(() => useHarvestSummary());

    expect(result.current.harvestSummary).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should set loading false when campaignId is missing', () => {
    mockUseAuth.mockReturnValue({
      currentUser: { uid: 'user1', organizationId: 'org1', role: 'admin' },
      loading: false,
    });

    const { result } = renderHook(() => useHarvestSummary(undefined, 'crop1'));

    expect(result.current.harvestSummary).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should set loading false when cropId is missing', () => {
    mockUseAuth.mockReturnValue({
      currentUser: { uid: 'user1', organizationId: 'org1', role: 'admin' },
      loading: false,
    });

    const { result } = renderHook(() => useHarvestSummary('campaign1'));

    expect(result.current.harvestSummary).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should handle field-owner role without specific field', () => {
    mockUseAuth.mockReturnValue({
      currentUser: { uid: 'user1', organizationId: 'org1', role: 'field-owner' },
      loading: false,
    });

    const { result } = renderHook(() => useHarvestSummary('campaign1', 'crop1', 'all'));

    expect(result.current.harvestSummary).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should fetch harvest summary when all required params are provided', async () => {
    const mockUser = {
      uid: 'user123',
      organizationId: 'org123',
      role: 'admin',
    };

    const mockHarvestSummary = {
      id: 'camp_campaign1_crop_crop1',
      campaignId: 'campaign1',
      cropId: 'crop1',
      totalHarvested: 150000,
      totalArea: 100,
      averageYield: 1500,
      completedSessions: 25,
      activeSessions: 3,
    };

    const mockUnsubscribe = vi.fn();

    mockUseAuth.mockReturnValue({
      currentUser: mockUser,
      loading: false,
    });

    mockOnSnapshot.mockImplementation((_docRef, onSuccess) => {
      setTimeout(() => {
        onSuccess({
          exists: () => true,
          id: mockHarvestSummary.id,
          data: () => ({
            campaignId: mockHarvestSummary.campaignId,
            cropId: mockHarvestSummary.cropId,
            totalHarvested: mockHarvestSummary.totalHarvested,
            totalArea: mockHarvestSummary.totalArea,
            averageYield: mockHarvestSummary.averageYield,
            completedSessions: mockHarvestSummary.completedSessions,
            activeSessions: mockHarvestSummary.activeSessions,
          }),
        });
      }, 0);
      return mockUnsubscribe;
    });

    const { result } = renderHook(() => useHarvestSummary('campaign1', 'crop1'));

    // Initially loading should be true
    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.harvestSummary).toEqual({
      id: 'camp_campaign1_crop_crop1',
      campaignId: 'campaign1',
      cropId: 'crop1',
      totalHarvested: 150000,
      totalArea: 100,
      averageYield: 1500,
      completedSessions: 25,
      activeSessions: 3,
    });
    expect(result.current.error).toBeNull();
  });

  it('should fetch harvest summary with field filter', async () => {
    const mockUser = {
      uid: 'user123',
      organizationId: 'org123',
      role: 'admin',
    };

    const mockUnsubscribe = vi.fn();

    mockUseAuth.mockReturnValue({
      currentUser: mockUser,
      loading: false,
    });

    mockOnSnapshot.mockReturnValue(mockUnsubscribe);

    renderHook(() => useHarvestSummary('campaign1', 'crop1', 'field1'));

    expect(mockOnSnapshot).toHaveBeenCalled();
  });

  it('should fetch harvest summary with field and plot filters', async () => {
    const mockUser = {
      uid: 'user123',
      organizationId: 'org123',
      role: 'admin',
    };

    const mockUnsubscribe = vi.fn();

    mockUseAuth.mockReturnValue({
      currentUser: mockUser,
      loading: false,
    });

    mockOnSnapshot.mockReturnValue(mockUnsubscribe);

    renderHook(() => useHarvestSummary('campaign1', 'crop1', 'field1', 'plot1'));

    expect(mockOnSnapshot).toHaveBeenCalled();
  });

  it('should handle harvest summary not found', async () => {
    const mockUser = {
      uid: 'user123',
      organizationId: 'org123',
      role: 'admin',
    };

    const mockUnsubscribe = vi.fn();

    mockUseAuth.mockReturnValue({
      currentUser: mockUser,
      loading: false,
    });

    mockOnSnapshot.mockImplementation((_docRef, onSuccess) => {
      setTimeout(() => {
        onSuccess({
          exists: () => false,
        });
      }, 0);
      return mockUnsubscribe;
    });

    const { result } = renderHook(() => useHarvestSummary('campaign1', 'crop1'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.harvestSummary).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('should handle query error', async () => {
    const mockUser = {
      uid: 'user123',
      organizationId: 'org123',
      role: 'admin',
    };

    const mockUnsubscribe = vi.fn();

    mockUseAuth.mockReturnValue({
      currentUser: mockUser,
      loading: false,
    });

    mockOnSnapshot.mockImplementation((_docRef, _onSuccess, onError) => {
      setTimeout(() => {
        onError(new Error('Firestore error'));
      }, 0);
      return mockUnsubscribe;
    });

    const { result } = renderHook(() => useHarvestSummary('campaign1', 'crop1'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.harvestSummary).toBeNull();
    expect(result.current.error).toBe('Firestore error');
  });

  it('should cleanup subscription on unmount', () => {
    const mockUser = {
      uid: 'user123',
      organizationId: 'org123',
      role: 'admin',
    };

    const mockUnsubscribe = vi.fn();

    mockUseAuth.mockReturnValue({
      currentUser: mockUser,
      loading: false,
    });

    mockOnSnapshot.mockReturnValue(mockUnsubscribe);

    const { unmount } = renderHook(() => useHarvestSummary('campaign1', 'crop1'));

    unmount();

    expect(mockUnsubscribe).toHaveBeenCalled();
  });

  it('should refetch when params change', async () => {
    const mockUser = {
      uid: 'user123',
      organizationId: 'org123',
      role: 'admin',
    };

    const mockUnsubscribe = vi.fn();

    mockUseAuth.mockReturnValue({
      currentUser: mockUser,
      loading: false,
    });

    mockOnSnapshot.mockReturnValue(mockUnsubscribe);

    const { rerender } = renderHook(
      ({ campaignId, cropId }) => useHarvestSummary(campaignId, cropId),
      { initialProps: { campaignId: 'campaign1', cropId: 'crop1' } }
    );

    expect(mockOnSnapshot).toHaveBeenCalledTimes(1);

    // Change params
    rerender({ campaignId: 'campaign2', cropId: 'crop2' });

    expect(mockOnSnapshot).toHaveBeenCalledTimes(2);
    expect(mockUnsubscribe).toHaveBeenCalledTimes(1);
  });
});
