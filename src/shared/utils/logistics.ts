// Shared constants and helpers for Logistics domain

export const ACTIVE_LOGISTICS_STATUSES = [
  'in-route-to-field',
  'in-field'
] as const;

export type ActiveLogisticsStatus = typeof ACTIVE_LOGISTICS_STATUSES[number];
