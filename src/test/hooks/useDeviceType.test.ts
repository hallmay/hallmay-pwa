import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useDeviceType } from '../../shared/hooks/useDeviceType';

describe('useDeviceType Hook', () => {
  let originalNavigator: Navigator;
  let originalWindow: Window & typeof globalThis;

  beforeEach(() => {
    // Store original values
    originalNavigator = global.navigator;
    originalWindow = global.window;

    // Mock window and navigator
    Object.defineProperty(global, 'navigator', {
      writable: true,
      value: {
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        vendor: '',
        maxTouchPoints: 0,
      },
    });

    Object.defineProperty(global, 'window', {
      writable: true,
      value: {
        ...originalWindow,
        screen: {
          width: 1920,
          height: 1080,
        },
        matchMedia: vi.fn().mockReturnValue({
          matches: false,
          addListener: vi.fn(),
          removeListener: vi.fn(),
        }),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      },
    });
  });

  afterEach(() => {
    // Restore original values
    global.navigator = originalNavigator;
    global.window = originalWindow;
    vi.clearAllMocks();
  });

  it('detects desktop device by default', () => {
    const { result } = renderHook(() => useDeviceType());
    expect(result.current.isMobileOrTablet).toBe(false);
  });

  it('detects mobile device by user agent - iPhone', () => {
    Object.defineProperty(global.navigator, 'userAgent', {
      writable: true,
      value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
    });

    const { result } = renderHook(() => useDeviceType());
    expect(result.current.isMobileOrTablet).toBe(true);
  });

  it('detects mobile device by user agent - Android', () => {
    Object.defineProperty(global.navigator, 'userAgent', {
      writable: true,
      value: 'Mozilla/5.0 (Linux; Android 10; SM-G975F)',
    });

    const { result } = renderHook(() => useDeviceType());
    expect(result.current.isMobileOrTablet).toBe(true);
  });

  it('detects tablet device by user agent - iPad', () => {
    Object.defineProperty(global.navigator, 'userAgent', {
      writable: true,
      value: 'Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X)',
    });

    const { result } = renderHook(() => useDeviceType());
    expect(result.current.isMobileOrTablet).toBe(true);
  });

  it('detects mobile by screen width (<768px)', () => {
    Object.defineProperty(global.window, 'screen', {
      writable: true,
      value: { width: 500, height: 800 },
    });

    const { result } = renderHook(() => useDeviceType());
    expect(result.current.isMobileOrTablet).toBe(true);
  });

  it('detects tablet by screen width and touch capabilities', () => {
    Object.defineProperty(global.window, 'screen', {
      writable: true,
      value: { width: 800, height: 1024 },
    });

    Object.defineProperty(global.navigator, 'maxTouchPoints', {
      writable: true,
      value: 5,
    });

    // Mock ontouchstart
    Object.defineProperty(global.window, 'ontouchstart', {
      writable: true,
      value: {},
    });

    const { result } = renderHook(() => useDeviceType());
    expect(result.current.isMobileOrTablet).toBe(true);
  });

  it('detects desktop for large screens even with touch', () => {
    Object.defineProperty(global.window, 'screen', {
      writable: true,
      value: { width: 1920, height: 1080 },
    });

    Object.defineProperty(global.navigator, 'maxTouchPoints', {
      writable: true,
      value: 5,
    });

    Object.defineProperty(global.window, 'ontouchstart', {
      writable: true,
      value: {},
    });

    const { result } = renderHook(() => useDeviceType());
    expect(result.current.isMobileOrTablet).toBe(false);
  });

  it('uses matchMedia as fallback for coarse pointer', () => {
    Object.defineProperty(global.window, 'screen', {
      writable: true,
      value: { width: 900, height: 1200 },
    });

    const mockMatchMedia = vi.fn().mockReturnValue({
      matches: true,
      addListener: vi.fn(),
      removeListener: vi.fn(),
    });

    Object.defineProperty(global.window, 'matchMedia', {
      writable: true,
      value: mockMatchMedia,
    });

    const { result } = renderHook(() => useDeviceType());
    
    expect(mockMatchMedia).toHaveBeenCalledWith('(pointer: coarse)');
    expect(result.current.isMobileOrTablet).toBe(true);
  });

  it('handles landscape orientation correctly', () => {
    Object.defineProperty(global.window, 'screen', {
      writable: true,
      value: { width: 1024, height: 768 }, // Landscape tablet
    });

    Object.defineProperty(global.navigator, 'maxTouchPoints', {
      writable: true,
      value: 5,
    });

    Object.defineProperty(global.window, 'ontouchstart', {
      writable: true,
      value: {},
    });

    const { result } = renderHook(() => useDeviceType());
    expect(result.current.isMobileOrTablet).toBe(true);
  });

  it('adds and removes resize event listener', () => {
    const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

    const { unmount } = renderHook(() => useDeviceType());

    expect(addEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));
  });

  it('handles missing navigator properties gracefully', () => {
    Object.defineProperty(global, 'navigator', {
      writable: true,
      value: {}, // Empty navigator
    });

    const { result } = renderHook(() => useDeviceType());
    // Should not throw and default to desktop
    expect(result.current.isMobileOrTablet).toBe(false);
  });

  it('detects BlackBerry device', () => {
    Object.defineProperty(global.navigator, 'userAgent', {
      writable: true,
      value: 'Mozilla/5.0 (BlackBerry; U; BlackBerry 9900)',
    });

    const { result } = renderHook(() => useDeviceType());
    expect(result.current.isMobileOrTablet).toBe(true);
  });

  it('detects Opera Mini', () => {
    Object.defineProperty(global.navigator, 'userAgent', {
      writable: true,
      value: 'Opera/9.80 (J2ME/MIDP; Opera Mini/5.1.21214/28.2725; U; ru)',
    });

    const { result } = renderHook(() => useDeviceType());
    expect(result.current.isMobileOrTablet).toBe(true);
  });
});
