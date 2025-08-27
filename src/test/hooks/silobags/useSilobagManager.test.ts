import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSiloBagManager } from '../../../features/silobags/hooks/useSilobagManager';
import useAuth from '../../../shared/context/auth/AuthContext';
import { createSilobag, extractKgsSilobag, closeSilobag } from '../../../features/silobags/services/siloBags';
import toast from 'react-hot-toast';

// Mock Auth context
vi.mock('../../../shared/context/auth/AuthContext');

// Mock silobag services
vi.mock('../../../features/silobags/services/siloBags', () => ({
  createSilobag: vi.fn(),
  extractKgsSilobag: vi.fn(),
  closeSilobag: vi.fn(),
}));

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockUseAuth = useAuth as ReturnType<typeof vi.fn>;
const mockCreateSilobag = createSilobag as ReturnType<typeof vi.fn>;
const mockExtractKgsSilobag = extractKgsSilobag as ReturnType<typeof vi.fn>;
const mockCloseSilobag = closeSilobag as ReturnType<typeof vi.fn>;
const mockToast = toast as any;

describe('useSiloBagManager', () => {
  const mockFields = [
    { id: 'field1', name: 'Campo Norte' },
    { id: 'field2', name: 'Campo Sur' },
  ];

  const mockCrops = [
    { id: 'crop1', name: 'Soja' },
    { id: 'crop2', name: 'Maíz' },
  ];

  const mockUser = {
    uid: 'user123',
    organizationId: 'org123',
    role: 'admin',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({ currentUser: mockUser });
    mockCreateSilobag.mockResolvedValue(undefined);
    mockExtractKgsSilobag.mockResolvedValue(undefined);
    mockCloseSilobag.mockResolvedValue(undefined);
  });

  it('should return undefined when no currentUser', () => {
    mockUseAuth.mockReturnValue({ currentUser: null });

    const result = renderHook(() => useSiloBagManager(mockFields, mockCrops));

    expect(result.result.current).toBeUndefined();
  });

  it('should return initial state when currentUser exists', () => {
    const { result } = renderHook(() => useSiloBagManager(mockFields, mockCrops));

    expect(result.current).toBeDefined();
    expect(result.current!.modalState).toEqual({ type: null });
    expect(result.current!.openModal).toBeDefined();
    expect(result.current!.closeModal).toBeDefined();
    expect(result.current!.handlers).toBeDefined();
    expect(result.current!.handlers.create).toBeDefined();
    expect(result.current!.handlers.extract).toBeDefined();
    expect(result.current!.handlers.close).toBeDefined();
  });

  it('should open modal with correct type and data', () => {
    const { result } = renderHook(() => useSiloBagManager(mockFields, mockCrops));

    const mockSilobag = {
      id: 'silobag1',
      name: 'Silobolsa Norte',
      status: 'active',
    } as any;

    act(() => {
      result.current!.openModal('extract', mockSilobag);
    });

    expect(result.current!.modalState).toEqual({
      type: 'extract',
      data: mockSilobag,
    });
  });

  it('should close modal', () => {
    const { result } = renderHook(() => useSiloBagManager(mockFields, mockCrops));

    // First open a modal
    act(() => {
      result.current!.openModal('create');
    });

    expect(result.current!.modalState.type).toBe('create');

    // Then close it
    act(() => {
      result.current!.closeModal();
    });

    expect(result.current!.modalState).toEqual({ type: null, data: undefined });
  });

  it('should handle create silobag successfully', async () => {
    const { result } = renderHook(() => useSiloBagManager(mockFields, mockCrops));

    const mockFormData = {
      name: 'Nueva Silobolsa',
      fieldId: 'field1',
      cropId: 'crop1',
    };

    await act(async () => {
      await result.current!.handlers.create(mockFormData);
    });

    expect(mockCreateSilobag).toHaveBeenCalledWith({
      formData: mockFormData,
      currentUser: mockUser,
      fields: mockFields,
      crops: mockCrops,
    });
    expect(mockToast.success).toHaveBeenCalledWith('Se creo el silobolsa con éxito.');
    expect(result.current!.modalState.type).toBeNull();
  });

  it('should handle create silobag error', async () => {
    const { result } = renderHook(() => useSiloBagManager(mockFields, mockCrops));

    const mockFormData = { name: 'Nueva Silobolsa' };
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    mockCreateSilobag.mockRejectedValue(new Error('Create failed'));

    await act(async () => {
      await result.current!.handlers.create(mockFormData);
    });

    expect(consoleErrorSpy).toHaveBeenCalledWith('Error al crear silobolsa:', expect.any(Error));
    expect(result.current!.modalState.type).toBeNull();

    consoleErrorSpy.mockRestore();
  });

  it('should handle extract kilos successfully', async () => {
    const { result } = renderHook(() => useSiloBagManager(mockFields, mockCrops));

    const mockSilobag = {
      id: 'silobag1',
      name: 'Silobolsa Norte',
    } as any;

    const mockFormData = {
      extractedKg: 5000,
      date: new Date(),
    };

    // Set modal state with silobag data
    act(() => {
      result.current!.openModal('extract', mockSilobag);
    });

    await act(async () => {
      await result.current!.handlers.extract(mockFormData);
    });

    expect(mockExtractKgsSilobag).toHaveBeenCalledWith({
      siloBag: mockSilobag,
      formData: mockFormData,
      currentUser: mockUser,
    });
    expect(mockToast.success).toHaveBeenCalledWith('Se extrajeron los kilos con éxito.');
    expect(result.current!.modalState.type).toBeNull();
  });

  it('should handle extract kilos without silobag data', async () => {
    const { result } = renderHook(() => useSiloBagManager(mockFields, mockCrops));

    const mockFormData = { extractedKg: 5000 };

    await act(async () => {
      await result.current!.handlers.extract(mockFormData);
    });

    expect(mockExtractKgsSilobag).not.toHaveBeenCalled();
    expect(mockToast.success).not.toHaveBeenCalled();
  });

  it('should handle extract kilos error', async () => {
    const { result } = renderHook(() => useSiloBagManager(mockFields, mockCrops));

    const mockSilobag = { id: 'silobag1' } as any;
    const mockFormData = { extractedKg: 5000 };
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    mockExtractKgsSilobag.mockRejectedValue(new Error('Extract failed'));

    act(() => {
      result.current!.openModal('extract', mockSilobag);
    });

    await act(async () => {
      await result.current!.handlers.extract(mockFormData);
    });

    expect(consoleErrorSpy).toHaveBeenCalledWith('Error al extraer kilos:', expect.any(Error));

    consoleErrorSpy.mockRestore();
  });

  it('should handle close silobag successfully', async () => {
    const { result } = renderHook(() => useSiloBagManager(mockFields, mockCrops));

    const mockSilobag = {
      id: 'silobag1',
      name: 'Silobolsa Norte',
    } as any;

    const mockFormData = {
      closureDate: new Date(),
      notes: 'Closing silobag',
    };

    // Set modal state with silobag data
    act(() => {
      result.current!.openModal('close', mockSilobag);
    });

    await act(async () => {
      await result.current!.handlers.close(mockFormData);
    });

    expect(mockCloseSilobag).toHaveBeenCalledWith({
      siloBag: mockSilobag,
      formData: mockFormData,
    });
    expect(mockToast.success).toHaveBeenCalledWith('Se cerró el silobolsa con éxito.');
    expect(result.current!.modalState.type).toBeNull();
  });

  it('should handle close silobag without silobag data', async () => {
    const { result } = renderHook(() => useSiloBagManager(mockFields, mockCrops));

    const mockFormData = { notes: 'Closing' };

    await act(async () => {
      await result.current!.handlers.close(mockFormData);
    });

    expect(mockCloseSilobag).not.toHaveBeenCalled();
    expect(mockToast.success).not.toHaveBeenCalled();
  });

  it('should handle close silobag error', async () => {
    const { result } = renderHook(() => useSiloBagManager(mockFields, mockCrops));

    const mockSilobag = { id: 'silobag1' } as any;
    const mockFormData = { notes: 'Closing' };
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    mockCloseSilobag.mockRejectedValue(new Error('Close failed'));

    act(() => {
      result.current!.openModal('close', mockSilobag);
    });

    await act(async () => {
      await result.current!.handlers.close(mockFormData);
    });

    expect(consoleErrorSpy).toHaveBeenCalledWith('Error al cerrar el silo:', expect.any(Error));

    consoleErrorSpy.mockRestore();
  });
});
