import { vi, expect } from 'vitest';

export const renderWithProviders = (ui: React.ReactElement) => {
  // Custom render function with providers if needed
  return ui;
};

export const createMockFunction = <T extends (...args: any[]) => any>(
  implementation?: T
) => {
  return vi.fn(implementation);
};

export const waitForLoadingToFinish = async () => {
  // Wait for any loading states to finish
  await new Promise(resolve => setTimeout(resolve, 0));
};

export const expectElementToBeVisible = (element: HTMLElement) => {
  expect(element).toBeInTheDocument();
  expect(element).toBeVisible();
};

export const expectElementToHaveText = (element: HTMLElement, text: string) => {
  expect(element).toBeInTheDocument();
  expect(element).toHaveTextContent(text);
};

export const mockScrollIntoView = () => {
  // Mock scrollIntoView for components that use it
  Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
    configurable: true,
    value: vi.fn(),
  });
};

export const mockBoundingClientRect = (rect: Partial<DOMRect>) => {
  const defaultRect = {
    width: 0,
    height: 0,
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    x: 0,
    y: 0,
    toJSON: vi.fn(),
  };
  
  return { ...defaultRect, ...rect };
};

export const createMockEvent = (type: string, properties: any = {}) => {
  return new Event(type, properties);
};

export const mockLocalStorage = () => {
  const storage: { [key: string]: string } = {};
  
  Object.defineProperty(window, 'localStorage', {
    value: {
      getItem: vi.fn((key: string) => storage[key] || null),
      setItem: vi.fn((key: string, value: string) => {
        storage[key] = value;
      }),
      removeItem: vi.fn((key: string) => {
        delete storage[key];
      }),
      clear: vi.fn(() => {
        Object.keys(storage).forEach(key => delete storage[key]);
      }),
    },
  });
  
  return storage;
};
