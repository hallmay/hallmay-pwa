import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useHarvestSessionsByCampaign } from '../../../features/harvest/hooks/useHarvestSessionsByCampaign';
import useAuth from '../../../shared/context/auth/AuthContext';
import { onSnapshot } from 'firebase/firestore';
import { createSecurityQuery } from '../../../shared/firebase/queryBuilder';

// Mock Firebase
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  onSnapshot: vi.fn(),
}));

// Mock Firebase config
vi.mock('../../../shared/firebase/firebase', () => ({
  db: {},
}));

// Mock Auth context
vi.mock('../../../shared/context/auth/AuthContext');

// Mock queryBuilder
vi.mock('../../../shared/firebase/queryBuilder', () => ({
  createSecurityQuery: vi.fn(),
}));

const mockUseAuth = useAuth as ReturnType<typeof vi.fn>;
const mockOnSnapshot = onSnapshot as ReturnType<typeof vi.fn>;
const mockCreateSecurityQuery = createSecurityQuery as ReturnType<typeof vi.fn>;

describe('useHarvestSessionsByCampaign', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock the query builder chain
    const mockWithFieldAccess = vi.fn().mockReturnValue({
      build: vi.fn().mockReturnValue([]),
    });
    
    mockCreateSecurityQuery.mockReturnValue({
      withFieldAccess: mockWithFieldAccess,
    });
  });

  it('should return initial state', () => {
    mockUseAuth.mockReturnValue({
      currentUser: null,
      loading: true,
    });

    const { result } = renderHook(() => useHarvestSessionsByCampaign('campaign1'));

    expect(result.current.sessions).toEqual([]);
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('should set loading false when campaignId is not provided', () => {
    mockUseAuth.mockReturnValue({
      currentUser: { uid: 'user1', organizationId: 'org1' },
      loading: false,
    });

    const { result } = renderHook(() => useHarvestSessionsByCampaign(''));

    expect(result.current.sessions).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should set loading false when user is null', () => {
    mockUseAuth.mockReturnValue({
      currentUser: null,
      loading: false,
    });

    const { result } = renderHook(() => useHarvestSessionsByCampaign('campaign1'));

    expect(result.current.sessions).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should fetch harvest sessions when user is authenticated and campaignId is provided', async () => {
    const mockUser = {
      uid: 'user123',
      organizationId: 'org123',
      role: 'admin',
    };

    const mockSessions = [
      {
        id: 'session1',
        campaign: { id: 'campaign1', name: 'Campaign 2024' },
        field: { id: 'field1', name: 'Campo Norte' },
        plot: { id: 'plot1', name: 'Lote A1' },
        harvester: { id: 'harvester1', name: 'Juan Pérez' },
        date: new Date(),
        status: 'active',
        totalKg: 15000,
      },
      {
        id: 'session2',
        campaign: { id: 'campaign1', name: 'Campaign 2024' },
        field: { id: 'field2', name: 'Campo Sur' },
        plot: { id: 'plot2', name: 'Lote B1' },
        harvester: { id: 'harvester2', name: 'María García' },
        date: new Date(),
        status: 'completed',
        totalKg: 18000,
      },
    ];

    const mockUnsubscribe = vi.fn();

    mockUseAuth.mockReturnValue({
      currentUser: mockUser,
      loading: false,
    });

    mockOnSnapshot.mockImplementation((_query, onSuccess) => {
      setTimeout(() => {
        onSuccess({
          docs: mockSessions.map(session => ({
            id: session.id,
            data: () => ({
              campaign: session.campaign,
              field: session.field,
              plot: session.plot,
              harvester: session.harvester,
              date: session.date,
              status: session.status,
              totalKg: session.totalKg,
            }),
          })),
        });
      }, 0);
      return mockUnsubscribe;
    });

    const { result } = renderHook(() => useHarvestSessionsByCampaign('campaign1'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.sessions).toEqual([
      {
        id: 'session1',
        campaign: { id: 'campaign1', name: 'Campaign 2024' },
        field: { id: 'field1', name: 'Campo Norte' },
        plot: { id: 'plot1', name: 'Lote A1' },
        harvester: { id: 'harvester1', name: 'Juan Pérez' },
        date: expect.any(Date),
        status: 'active',
        totalKg: 15000,
      },
      {
        id: 'session2',
        campaign: { id: 'campaign1', name: 'Campaign 2024' },
        field: { id: 'field2', name: 'Campo Sur' },
        plot: { id: 'plot2', name: 'Lote B1' },
        harvester: { id: 'harvester2', name: 'María García' },
        date: expect.any(Date),
        status: 'completed',
        totalKg: 18000,
      },
    ]);
    expect(result.current.error).toBeNull();
    expect(mockCreateSecurityQuery).toHaveBeenCalledWith(mockUser);
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

    mockOnSnapshot.mockImplementation((_query, _onSuccess, onError) => {
      setTimeout(() => {
        onError(new Error('Firestore error'));
      }, 0);
      return mockUnsubscribe;
    });

    const { result } = renderHook(() => useHarvestSessionsByCampaign('campaign1'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.sessions).toEqual([]);
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

    const { unmount } = renderHook(() => useHarvestSessionsByCampaign('campaign1'));

    unmount();

    expect(mockUnsubscribe).toHaveBeenCalled();
  });

  it('should refetch when campaignId changes', async () => {
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
      ({ campaignId }) => useHarvestSessionsByCampaign(campaignId),
      { initialProps: { campaignId: 'campaign1' } }
    );

    expect(mockOnSnapshot).toHaveBeenCalledTimes(1);

    // Change campaignId
    rerender({ campaignId: 'campaign2' });

    expect(mockOnSnapshot).toHaveBeenCalledTimes(2);
    expect(mockUnsubscribe).toHaveBeenCalledTimes(1);
  });

  it('should handle empty sessions list', async () => {
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

    mockOnSnapshot.mockImplementation((_query, onSuccess) => {
      setTimeout(() => {
        onSuccess({
          docs: [],
        });
      }, 0);
      return mockUnsubscribe;
    });

    const { result } = renderHook(() => useHarvestSessionsByCampaign('campaign1'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.sessions).toEqual([]);
    expect(result.current.error).toBeNull();
  });
});
