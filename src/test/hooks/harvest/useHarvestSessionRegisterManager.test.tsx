import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useRegisterManager } from '../../../features/harvest/hooks/useHarvestSessionRegisterManager';
import type { HarvestSession, HarvestSessionRegister } from '../../../shared/types';
import toast from 'react-hot-toast';
import { addRegister, updateRegister, deleteRegister } from '../../../features/harvest/services/harvestSessionRegister';

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
  },
}));

// Mock silobags hook
vi.mock('../../../features/silobags/hooks/useSilobags', () => ({
  useSiloBags: vi.fn(() => ({
    siloBags: [
      { id: 'silo-1', name: 'Silo 1' },
      { id: 'silo-2', name: 'Silo 2' },
    ],
  })),
}));

// Mock destinations hook
vi.mock('../../../shared/hooks/destination/useDestinations', () => ({
  useDestinations: vi.fn(() => ({
    destinations: [
      { id: 'dest-1', name: 'Destination 1' },
      { id: 'dest-2', name: 'Destination 2' },
    ],
  })),
}));

// Mock register services
vi.mock('../../../features/harvest/services/harvestSessionRegister', () => ({
  addRegister: vi.fn(() => Promise.resolve()),
  updateRegister: vi.fn(() => Promise.resolve()),
  deleteRegister: vi.fn(() => Promise.resolve()),
}));

const mockHarvestSession: HarvestSession = {
  id: 'session-1',
  organization_id: 'org-1',
  campaign: { id: 'campaign-1', name: 'Campaign 1' },
  crop: { id: 'crop-1', name: 'Crop 1' },
  field: { id: 'field-1', name: 'Field 1' },
  harvester: { id: 'harvester-1', name: 'Harvester 1' },
  status: 'pending',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
} as any;

const mockRegister: HarvestSessionRegister = {
  id: 'reg-1',
  organization_id: 'org-1',
  type: 'truck',
  weight_kg: 100,
  humidity: 12,
  created_at: new Date(),
} as any;

describe('useRegisterManager', () => {
  const mockAddRegister = vi.mocked(addRegister);
  const mockUpdateRegister = vi.mocked(updateRegister);
  const mockDeleteRegister = vi.mocked(deleteRegister);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return initial state correctly', () => {
    const { result } = renderHook(() => useRegisterManager(mockHarvestSession));

    expect(result.current.selectedRegister).toBeNull();
    expect(result.current.modal).toBeNull();
    expect(result.current.siloBags).toHaveLength(2);
    expect(result.current.destinations).toHaveLength(2);
    expect(result.current.handlers).toBeDefined();
    expect(result.current.ui).toBeDefined();
  });

  it('should open modal correctly', () => {
    const { result } = renderHook(() => useRegisterManager(mockHarvestSession));

    act(() => {
      result.current.ui.openModal('add');
    });

    expect(result.current.modal).toBe('add');
  });

  it('should open modal with register', () => {
    const { result } = renderHook(() => useRegisterManager(mockHarvestSession));
    const mockRegister: HarvestSessionRegister = { 
      id: 'reg-1', 
      organization_id: 'org-1',
      type: 'truck',
      weight_kg: 100,
      humidity: 14,
      created_at: { seconds: Date.now() / 1000, nanoseconds: 0 } as any,
      destination: { id: 'dest-1', name: 'Destination 1' }
    };

    act(() => {
      result.current.ui.openModal('edit', mockRegister);
    });

    expect(result.current.modal).toBe('edit');
    expect(result.current.selectedRegister).toBe(mockRegister);
  });

  it('should close modal correctly', () => {
    const { result } = renderHook(() => useRegisterManager(mockHarvestSession));

    act(() => {
      result.current.ui.openModal('add');
    });

    expect(result.current.modal).toBe('add');

    act(() => {
      result.current.ui.closeModal();
    });

    expect(result.current.modal).toBeNull();
    expect(result.current.selectedRegister).toBeNull();
  });

  it('should handle add register successfully', async () => {
    const { result } = renderHook(() => useRegisterManager(mockHarvestSession));
    const mockData = { date: '2024-01-01', quantity: 100, destination: 'silo-1' };

    await act(async () => {
      await result.current.handlers.add(mockData);
    });

    expect(mockAddRegister).toHaveBeenCalledWith({
      formData: { ...mockData, organization_id: 'org-1' },
      harvestSession: mockHarvestSession,
      siloBags: expect.any(Array),
      destinations: expect.any(Array),
    });
    expect(toast.success).toHaveBeenCalledWith('Registro creado con éxito');
    expect(result.current.modal).toBeNull();
  });

  it('should handle update register successfully', async () => {
    const { result } = renderHook(() => useRegisterManager(mockHarvestSession));
    const mockData = { date: '2024-01-02', quantity: 200, destination: 'silo-2' };

    // First set a selected register
    act(() => {
      result.current.ui.openModal('edit', mockRegister);
    });

    await act(async () => {
      await result.current.handlers.update(mockData);
    });

    expect(mockUpdateRegister).toHaveBeenCalledWith({
      formData: { ...mockData, organization_id: 'org-1' },
      originalRegister: mockRegister,
      harvestSession: mockHarvestSession,
      siloBags: expect.any(Array),
      destinations: expect.any(Array),
    });
    expect(toast.success).toHaveBeenCalledWith('Registro actualizado con éxito.');
    expect(result.current.modal).toBeNull();
  });

  it('should handle delete register successfully', async () => {
    const { result } = renderHook(() => useRegisterManager(mockHarvestSession));

    // First set a selected register
    act(() => {
      result.current.ui.openModal('delete', mockRegister);
    });

    await act(async () => {
      await result.current.handlers.delete();
    });

    expect(mockDeleteRegister).toHaveBeenCalledWith({
      registerToDelete: mockRegister,
      harvestSession: mockHarvestSession,
    });
    expect(toast.success).toHaveBeenCalledWith('Registro eliminado con éxito');
    expect(result.current.modal).toBeNull();
  });

  it('should not update register if no selectedRegister', async () => {
    const { result } = renderHook(() => useRegisterManager(mockHarvestSession));
    const mockData = { date: '2024-01-02', quantity: 200 };

    await act(async () => {
      await result.current.handlers.update(mockData);
    });

    expect(mockUpdateRegister).not.toHaveBeenCalled();
  });

  it('should not delete register if no selectedRegister', async () => {
    const { result } = renderHook(() => useRegisterManager(mockHarvestSession));

    await act(async () => {
      await result.current.handlers.delete();
    });

    expect(mockDeleteRegister).not.toHaveBeenCalled();
  });

  it('should handle add register error gracefully', async () => {
    mockAddRegister.mockRejectedValueOnce(new Error('Add error'));
    const { result } = renderHook(() => useRegisterManager(mockHarvestSession));
    const mockData = { date: '2024-01-01', quantity: 100 };

    await act(async () => {
      await result.current.handlers.add(mockData);
    });

    expect(result.current.modal).toBeNull();
    expect(toast.success).toHaveBeenCalledWith('Registro creado con éxito');
  });

  it('should handle update register error gracefully', async () => {
    mockUpdateRegister.mockRejectedValueOnce(new Error('Update error'));
    const { result } = renderHook(() => useRegisterManager(mockHarvestSession));
    const mockData = { date: '2024-01-02', quantity: 200 };

    // First set a selected register
    act(() => {
      result.current.ui.openModal('edit', mockRegister);
    });

    await act(async () => {
      await result.current.handlers.update(mockData);
    });

    expect(result.current.modal).toBeNull();
    expect(toast.success).toHaveBeenCalledWith('Registro actualizado con éxito.');
  });

  it('should handle delete register error gracefully', async () => {
    mockDeleteRegister.mockRejectedValueOnce(new Error('Delete error'));
    const { result } = renderHook(() => useRegisterManager(mockHarvestSession));

    // First set a selected register
    act(() => {
      result.current.ui.openModal('delete', mockRegister);
    });

    await act(async () => {
      await result.current.handlers.delete();
    });

    expect(result.current.modal).toBeNull();
    expect(toast.success).toHaveBeenCalledWith('Registro eliminado con éxito');
  });
});
