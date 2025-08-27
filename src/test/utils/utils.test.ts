import { describe, it, expect } from 'vitest';
import { formatNumber, getSessionWithRecalculatedYields } from '../../shared/utils/index';
import type { HarvestSession } from '../../shared/types';

describe('Utils Functions', () => {
  describe('formatNumber', () => {
    it('formats number with default decimals (0)', () => {
      expect(formatNumber(1000)).toBe('1.000');
      expect(formatNumber(123456)).toBe('123.456');
      expect(formatNumber(0)).toBe('0');
    });

    it('formats number with specified decimals', () => {
      expect(formatNumber(1000.123, 2)).toBe('1.000,12');
      expect(formatNumber(123.456, 3)).toBe('123,456');
      expect(formatNumber(10, 1)).toBe('10,0');
    });

    it('handles decimal numbers', () => {
      expect(formatNumber(123.45, 2)).toBe('123,45');
      expect(formatNumber(0.5, 1)).toBe('0,5');
      expect(formatNumber(99.99, 0)).toBe('100');
    });

    it('handles edge cases', () => {
      expect(formatNumber(NaN)).toBe('0');
      expect(formatNumber(null as any)).toBe('0');
      expect(formatNumber(undefined as any)).toBe('0');
      expect(formatNumber('string' as any)).toBe('0');
    });

    it('handles negative numbers', () => {
      expect(formatNumber(-1000)).toBe('-1.000');
      expect(formatNumber(-123.45, 2)).toBe('-123,45');
    });

    it('handles zero', () => {
      expect(formatNumber(0)).toBe('0');
      expect(formatNumber(0, 2)).toBe('0,00');
    });

    it('handles very large numbers', () => {
      expect(formatNumber(1000000)).toBe('1.000.000');
      expect(formatNumber(999999999.99, 2)).toBe('999.999.999,99');
    });

    it('handles very small numbers', () => {
      expect(formatNumber(0.001, 3)).toBe('0,001');
      expect(formatNumber(0.0001, 4)).toBe('0,0001');
    });
  });

  describe('getSessionWithRecalculatedYields', () => {
    const baseSession: HarvestSession = {
      id: '1',
      harvested_kgs: 10000,
      harvested_hectares: 10,
      hectares: 12,
      estimated_yield: 900,
      yields: null as any,
    } as HarvestSession;

    it('calculates yields correctly with all values present', () => {
      const result = getSessionWithRecalculatedYields(baseSession);
      
      expect(result.yields.harvested).toBe(1000); // 10000 / 10
      expect(result.yields.seed).toBe(833.3333333333334); // 10000 / 12
      expect(result.yields.real_vs_projected).toBe(100); // 1000 - 900
    });

    it('handles zero harvested hectares', () => {
      const session = { ...baseSession, harvested_hectares: 0 };
      const result = getSessionWithRecalculatedYields(session);
      
      expect(result.yields.harvested).toBe(0);
      expect(result.yields.seed).toBe(833.3333333333334); // Still calculates seed yield
    });

    it('handles zero sown hectares', () => {
      const session = { ...baseSession, hectares: 0 };
      const result = getSessionWithRecalculatedYields(session);
      
      expect(result.yields.harvested).toBe(1000);
      expect(result.yields.seed).toBe(0);
    });

    it('handles missing values (undefined)', () => {
      const session: HarvestSession = {
        id: '1',
      } as HarvestSession;
      
      const result = getSessionWithRecalculatedYields(session);
      
      expect(result.yields.harvested).toBe(0);
      expect(result.yields.seed).toBe(0);
      expect(result.yields.real_vs_projected).toBe(0);
    });

    it('handles null values', () => {
      const session = {
        ...baseSession,
        harvested_kgs: null,
        harvested_hectares: null,
        hectares: null,
        estimated_yield: null,
      } as any;
      
      const result = getSessionWithRecalculatedYields(session);
      
      expect(result.yields.harvested).toBe(0);
      expect(result.yields.seed).toBe(0);
      expect(result.yields.real_vs_projected).toBe(0);
    });

    it('preserves original session data', () => {
      const result = getSessionWithRecalculatedYields(baseSession);
      
      expect(result.id).toBe(baseSession.id);
      expect(result.harvested_kgs).toBe(baseSession.harvested_kgs);
      expect(result.harvested_hectares).toBe(baseSession.harvested_hectares);
      expect(result.hectares).toBe(baseSession.hectares);
      expect(result.estimated_yield).toBe(baseSession.estimated_yield);
    });

    it('handles decimal calculations correctly', () => {
      const session = {
        ...baseSession,
        harvested_kgs: 1500,
        harvested_hectares: 1.5,
        hectares: 2.5,
        estimated_yield: 950,
      };
      
      const result = getSessionWithRecalculatedYields(session);
      
      expect(result.yields.harvested).toBe(1000); // 1500 / 1.5
      expect(result.yields.seed).toBe(600); // 1500 / 2.5
      expect(result.yields.real_vs_projected).toBe(50); // 1000 - 950
    });

    it('handles negative estimated yield difference', () => {
      const session = {
        ...baseSession,
        harvested_kgs: 8000,
        harvested_hectares: 10,
        estimated_yield: 1000,
      };
      
      const result = getSessionWithRecalculatedYields(session);
      
      expect(result.yields.real_vs_projected).toBe(-200); // 800 - 1000
    });

    it('returns new object (immutability)', () => {
      const result = getSessionWithRecalculatedYields(baseSession);
      
      expect(result).not.toBe(baseSession);
      expect(result.yields).not.toBe(baseSession.yields);
    });
  });
});
