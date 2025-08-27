import { vi } from 'vitest';
import React from 'react';

export const mockSyncContext = {
  isOnline: true,
  syncStatus: 'idle',
  pendingOperations: 0,
  sync: vi.fn(),
};

export const SyncProvider = ({ children }: { children: React.ReactNode }) => {
  return <div data-testid="mock-sync-provider">{children}</div>;
};

export default () => mockSyncContext;
