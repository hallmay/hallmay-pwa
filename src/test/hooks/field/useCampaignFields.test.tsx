import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useCampaignFields } from '../../../shared/hooks/field/useCampaignFields';
import useAuth from '../../../shared/context/auth/AuthContext';
import { onSnapshot } from 'firebase/firestore';
import { createSecurityQuery } from '../../../shared/firebase/queryBuilder';

// Mock Firebase
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  onSnapshot: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
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

describe('useCampaignFields', () => {
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

    const { result } = renderHook(() => useCampaignFields('campaign1'));

    expect(result.current.campaignFields).toEqual([]);
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('should set loading false when campaignId is not provided', () => {
    mockUseAuth.mockReturnValue({
      currentUser: { uid: 'user1', organizationId: 'org1' },
      loading: false,
    });

    const { result } = renderHook(() => useCampaignFields(''));

    expect(result.current.campaignFields).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should set loading false when auth is not loading but user is null', () => {
    mockUseAuth.mockReturnValue({
      currentUser: null,
      loading: false,
    });

    const { result } = renderHook(() => useCampaignFields('campaign1'));

    expect(result.current.campaignFields).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should fetch campaign fields when user is authenticated and campaignId is provided', async () => {
    const mockUser = {
      uid: 'user123',
      organizationId: 'org123',
      role: 'admin',
    };

    const mockCampaignFields = [
      {
        id: 'field1',
        campaign: { id: 'campaign1', name: 'Campaign 2024' },
        field: { id: 'field1', name: 'Campo Norte' },
        area: 100,
      },
      {
        id: 'field2',
        campaign: { id: 'campaign1', name: 'Campaign 2024' },
        field: { id: 'field2', name: 'Campo Sur' },
        area: 150,
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
          docs: mockCampaignFields.map(field => ({
            id: field.id,
            data: () => ({
              campaign: field.campaign,
              field: field.field,
              area: field.area,
            }),
          })),
        });
      }, 0);
      return mockUnsubscribe;
    });

    const { result } = renderHook(() => useCampaignFields('campaign1'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.campaignFields).toEqual([
      {
        id: 'field1',
        campaign: { id: 'campaign1', name: 'Campaign 2024' },
        field: { id: 'field1', name: 'Campo Norte' },
        area: 100,
      },
      {
        id: 'field2',
        campaign: { id: 'campaign1', name: 'Campaign 2024' },
        field: { id: 'field2', name: 'Campo Sur' },
        area: 150,
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

    const { result } = renderHook(() => useCampaignFields('campaign1'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.campaignFields).toEqual([]);
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

    const { unmount } = renderHook(() => useCampaignFields('campaign1'));

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
      ({ campaignId }) => useCampaignFields(campaignId),
      { initialProps: { campaignId: 'campaign1' } }
    );

    expect(mockOnSnapshot).toHaveBeenCalledTimes(1);

    // Change campaignId
    rerender({ campaignId: 'campaign2' });

    expect(mockOnSnapshot).toHaveBeenCalledTimes(2);
    expect(mockUnsubscribe).toHaveBeenCalledTimes(1);
  });

  it('should handle empty campaign fields list', async () => {
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

    const { result } = renderHook(() => useCampaignFields('campaign1'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.campaignFields).toEqual([]);
    expect(result.current.error).toBeNull();
  });
});
