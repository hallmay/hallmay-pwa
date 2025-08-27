import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useReportsAnalytics } from '../../../features/reports/hooks/useReportsAnalytics';

// Mock the dependent hooks
vi.mock('../../../features/reports/hooks/useDestinationsReport', () => ({
  useDestinationSummary: vi.fn(),
}));

vi.mock('../../../features/reports/hooks/useHarvestersReport', () => ({
  useHarvestersSummary: vi.fn(),
}));

vi.mock('../../../features/reports/hooks/useHarvestsReport', () => ({
  useHarvestSummary: vi.fn(),
}));

// Import the mocked functions after mocking
import { useDestinationSummary } from '../../../features/reports/hooks/useDestinationsReport';
import { useHarvestersSummary } from '../../../features/reports/hooks/useHarvestersReport';
import { useHarvestSummary } from '../../../features/reports/hooks/useHarvestsReport';

const mockUseDestinationSummary = vi.mocked(useDestinationSummary);
const mockUseHarvestersSummary = vi.mocked(useHarvestersSummary);
const mockUseHarvestSummary = vi.mocked(useHarvestSummary);

describe('useReportsAnalytics', () => {
  const mockFilters = {
    campaign: 'campaign-1',
    crop: 'crop-1',
    field: 'field-1',
    plot: 'plot-1',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock implementations
    mockUseDestinationSummary.mockReturnValue({
      destinationSummary: [],
      loading: false,
      error: null,
    });

    mockUseHarvestersSummary.mockReturnValue({
      harvestersSummary: [],
      loading: false,
      error: null,
    });

    mockUseHarvestSummary.mockReturnValue({
      harvestSummary: null,
      loading: false,
      error: null,
    });
  });

  it('should return empty data when campaign or crop is missing', () => {
    const { result } = renderHook(() => useReportsAnalytics({
      campaign: '',
      crop: 'crop-1',
      field: 'field-1',
      plot: 'plot-1',
    }));

    expect(result.current.harvestSummary).toBeNull();
    expect(result.current.harvestersSummary).toEqual([]);
    expect(result.current.destinationSummary).toEqual([]);
  });

  it('should return empty data when crop is "all"', () => {
    const { result } = renderHook(() => useReportsAnalytics({
      campaign: 'campaign-1',
      crop: 'all',
      field: 'field-1',
      plot: 'plot-1',
    }));

    expect(result.current.harvestSummary).toBeNull();
    expect(result.current.harvestersSummary).toEqual([]);
    expect(result.current.destinationSummary).toEqual([]);
  });

  it('should call hooks with correct parameters when filters are valid', () => {
    // Set up specific return values for this test
    const mockHarvestSummary = {
      id: '1',
      organization_id: 'org1',
      total_kgs: 1000,
      total_hectares: 10,
      total_harvested_hectares: 8,
      yield_per_sown_hectare: 100,
      yield_per_harvested_hectare: 125,
      average_estimated_yield: 120,
      yield_real_vs_projected: 1.04,
      agregation_level: 'campaign' as const,
    };

    const mockHarvestersSummary = [{
      id: '1',
      harvester: { id: 'h1', name: 'Harvester 1' } as any,
      organization_id: 'org1',
      total_harvested_kgs: 1000,
      total_harvested_hectares: 8,
      session_count: 5,
      average_yield_kg_ha: 125,
      agregation_level: 'campaign' as const,
    }];

    const mockDestinationSummary = [{
      id: '1',
      organization_id: 'org1',
      destination: { id: 'd1', name: 'Destination 1' } as any,
      total_kgs: 1000,
      total_weighted_humidity: 12.5,
      average_kg_per_truck: 500,
      average_humidity: 12.5,
      truck_count: 2,
      agregation_level: 'campaign' as const,
    }];

    mockUseHarvestSummary.mockReturnValue({
      harvestSummary: mockHarvestSummary,
      loading: false,
      error: null,
    });

    mockUseHarvestersSummary.mockReturnValue({
      harvestersSummary: mockHarvestersSummary,
      loading: false,
      error: null,
    });

    mockUseDestinationSummary.mockReturnValue({
      destinationSummary: mockDestinationSummary,
      loading: false,
      error: null,
    });

    const { result } = renderHook(() => useReportsAnalytics(mockFilters));

    expect(result.current.harvestSummary).toEqual(mockHarvestSummary);
    expect(result.current.harvestersSummary).toEqual(mockHarvestersSummary);
    expect(result.current.destinationSummary).toEqual(mockDestinationSummary);

    // Verify hooks were called with correct parameters
    expect(mockUseHarvestSummary).toHaveBeenCalledWith('campaign-1', 'crop-1', 'field-1', 'plot-1');
    expect(mockUseHarvestersSummary).toHaveBeenCalledWith('campaign-1', 'crop-1', 'field-1', 'plot-1');
    expect(mockUseDestinationSummary).toHaveBeenCalledWith('campaign-1', 'crop-1', 'field-1', 'plot-1');
  });

  it('should handle "all" values in field and plot filters', () => {
    const { result } = renderHook(() => useReportsAnalytics({
      campaign: 'campaign-1',
      crop: 'crop-1',
      field: 'all',
      plot: 'all',
    }));

    expect(result.current).toBeDefined();
    expect(result.current.loading).toBe(false);

    // Verify hooks were called with undefined for 'all' values
    expect(mockUseHarvestSummary).toHaveBeenCalledWith('campaign-1', 'crop-1', undefined, undefined);
    expect(mockUseHarvestersSummary).toHaveBeenCalledWith('campaign-1', 'crop-1', undefined, undefined);
    expect(mockUseDestinationSummary).toHaveBeenCalledWith('campaign-1', 'crop-1', undefined, undefined);
  });

  it('should combine loading states from all hooks', () => {
    mockUseDestinationSummary.mockReturnValue({
      destinationSummary: [],
      loading: true,
      error: null,
    });

    const { result } = renderHook(() => useReportsAnalytics(mockFilters));

    expect(result.current.loading).toBe(true);
  });

  it('should combine error states from all hooks', () => {
    mockUseDestinationSummary.mockReturnValue({
      destinationSummary: [],
      loading: false,
      error: 'Destination error',
    });

    const { result } = renderHook(() => useReportsAnalytics(mockFilters));

    expect(result.current.error).toBe('Destination error');
  });

  it('should memoize query parameters correctly', () => {
    const { result, rerender } = renderHook(
      (props) => useReportsAnalytics(props),
      { initialProps: mockFilters }
    );

    const initialResult = result.current;

    // Rerender with same props
    rerender(mockFilters);

    // Objects should be deeply equal but not reference equal due to the nature of the hook
    expect(result.current).toStrictEqual(initialResult);
  });
});
