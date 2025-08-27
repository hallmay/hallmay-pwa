import { describe, it, expect, vi, beforeEach } from 'vitest';
import { exportToCsv, exportToXlsx } from '../../shared/services/export';
import Papa from 'papaparse';
import * as xlsx from 'xlsx';

// Mock Papa Parse
vi.mock('papaparse', () => ({
  default: {
    unparse: vi.fn((data) => `mocked-csv-${JSON.stringify(data)}`),
  },
}));

// Mock XLSX
vi.mock('xlsx', () => ({
  utils: {
    json_to_sheet: vi.fn((data) => ({ mockSheet: data })),
    book_new: vi.fn(() => ({ mockWorkbook: true })),
    book_append_sheet: vi.fn(),
  },
  writeFile: vi.fn(),
}));

// Mock date-fns
vi.mock('date-fns', () => ({
  format: vi.fn((_date, _format) => '25/08/2025 10:30'),
}));

// Mock DOM methods
Object.defineProperty(global, 'document', {
  value: {
    createElement: vi.fn(() => ({
      href: '',
      click: vi.fn(),
      download: '',
      setAttribute: vi.fn(),
      style: {},
    })),
    body: {
      appendChild: vi.fn(),
      removeChild: vi.fn(),
    },
  },
  writable: true,
});

Object.defineProperty(window, 'URL', {
  value: {
    createObjectURL: vi.fn(() => 'blob:mock-url'),
    revokeObjectURL: vi.fn(),
  },
  writable: true,
});

describe('Export Service', () => {
  const mockSession = {
    id: 'session-1',
    campaignId: 'campaign-1',
    campaign: {
      id: 'campaign-1',
      name: 'Campaign 2025',
    },
    fieldId: 'field-1',
    field: {
      id: 'field-1',
      name: 'Campo Norte',
    },
    plotId: 'plot-1',
    plot: {
      id: 'plot-1',
      name: 'Lote A',
      hectares: 100,
    },
    crop: {
      id: 'crop-1',
      name: 'Soja',
    },
    totalKilos: 50000,
    hectares: 100,
    harvested_kgs: 50000,
    estimated_yield: 500,
    yields: {
      harvested: 550,
      seed: 500,
      real_vs_projected: 50,
    },
  } as any;

  const mockRegisters = [
    {
      id: 'register-1',
      kilos: 25000,
      weight_kg: 25000,
      type: 'truck',
      humidity: 14.5,
      details: 'truck details',
      observations: 'Buen grano',
      truck: {
        license_plate: 'ABC123',
        driver: 'Juan Pérez',
      },
      destination: {
        id: 'dest1',
        name: 'Acopio Central',
      },
    },
    {
      id: 'register-2',
      kilos: 25000,
      weight_kg: 25000,
      type: 'silo_bag',
      humidity: 13.2,
      details: 'silo bag details',
      observations: 'Almacenamiento temporal',
      silo_bag: {
        name: 'Silo Bag #1',
      },
    },
  ] as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('exportToCsv', () => {
    it('exports session and registers data to CSV', () => {
      exportToCsv(mockSession, mockRegisters);

      expect(vi.mocked(Papa.unparse)).toHaveBeenCalledTimes(2); // session + registers
      // exportToCsv doesn't return a value, it creates a download
      expect(global.document.createElement).toHaveBeenCalled();
      expect(global.URL.createObjectURL).toHaveBeenCalled();
    });

    it('handles empty registers array', () => {
      exportToCsv(mockSession, []);

      expect(vi.mocked(Papa.unparse)).toHaveBeenCalledTimes(2);
    });

    it('creates and triggers download', () => {
      exportToCsv(mockSession, []);

      expect(global.document.createElement).toHaveBeenCalled();
    });
  });

  describe('exportToXlsx', () => {
    it('creates worksheets for summary and registers', () => {
      exportToXlsx(mockSession, mockRegisters);

      expect(vi.mocked(xlsx.utils.json_to_sheet)).toHaveBeenCalledTimes(2);
      expect(vi.mocked(xlsx.utils.book_new)).toHaveBeenCalled();
      expect(vi.mocked(xlsx.utils.book_append_sheet)).toHaveBeenCalledTimes(2);
    });

    it('saves file with correct name', () => {
      exportToXlsx(mockSession, mockRegisters);

      expect(vi.mocked(xlsx.writeFile)).toHaveBeenCalledWith(
        expect.any(Object),
        expect.stringContaining('Cosecha_')
      );
    });

    it('handles empty registers array', () => {
      exportToXlsx(mockSession, []);

      expect(vi.mocked(xlsx.utils.json_to_sheet)).toHaveBeenCalledTimes(2);
      expect(vi.mocked(xlsx.writeFile)).toHaveBeenCalled();
    });
  });

  describe('Error handling', () => {
    it('handles missing session data gracefully', () => {
      const incompleteSession = {
        ...mockSession,
        campaign: undefined,
        field: undefined,
        estimated_yield: 0,
        yields: { harvested: 0, seed: 0, real_vs_projected: 0 },
      } as any;

      expect(() => exportToCsv(incompleteSession, [])).not.toThrow();
      expect(vi.mocked(Papa.unparse)).toHaveBeenCalled();
    });
  });
});
