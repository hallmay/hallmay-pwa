export const mockHarvestSession = {
  id: '1',
  campaign: { id: 'camp1', name: 'Campaign 2025' },
  field: { id: 'field1', name: 'Campo Norte' },
  crop: { id: 'crop1', name: 'Soja' },
  plot: { id: 'plot1', name: 'Lote A' },
  hectares: 100,
  harvested_kgs: 50000,
  harvested_hectares: 90,
  estimated_yield: 500,
  yields: {
    harvested: 600,
    seed: 500,
    real_vs_projected: 100,
  },
  status: 'in-progress',
  created_at: { toDate: () => new Date('2025-08-25') },
  updated_at: { toDate: () => new Date('2025-08-25') },
};

export const mockRegister = {
  id: 'reg1',
  type: 'truck',
  weight_kg: 10000,
  humidity: 14,
  truck: {
    license_plate: 'ABC123',
    driver: 'Juan Pérez',
  },
  destination: { id: 'dest1', name: 'Acopio Central' },
  created_at: { toDate: () => new Date('2025-08-25') },
  details: 'Carga completa',
};

export const mockUser = {
  uid: 'user123',
  email: 'test@example.com',
  displayName: 'Test User',
  role: 'admin',
};

export const mockCampaign = {
  id: 'camp1',
  name: 'Campaign 2025',
  year: 2025,
  active: true,
};

export const mockField = {
  id: 'field1',
  name: 'Campo Norte',
  location: 'Norte de la provincia',
};

export const mockCrop = {
  id: 'crop1', 
  name: 'Soja',
  variety: 'Soja RR',
};

export const mockLogistics = {
  id: 'log1',
  order: 123,
  date: { toDate: () => new Date('2025-08-25') },
  field: mockField,
  company: 'Transportes SA',
  crop: mockCrop,
  driver: 'Juan Pérez',
  status: 'pending',
  details: 'Camión en buen estado',
};
