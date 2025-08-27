import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Ejecutar cleanup después de cada test
afterEach(() => {
  cleanup();
});
