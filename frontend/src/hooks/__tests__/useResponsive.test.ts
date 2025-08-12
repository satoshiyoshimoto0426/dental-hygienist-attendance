import { renderHook } from '@testing-library/react';
import { useResponsive } from '../useResponsive';
import { useMediaQuery } from '@mui/material';

// useMediaQueryをモック
jest.mock('@mui/material', () => ({
  ...jest.requireActual('@mui/material'),
  useMediaQuery: jest.fn(),
  useTheme: () => ({
    breakpoints: {
      down: jest.fn(),
      between: jest.fn(),
      up: jest.fn()
    }
  })
}));

const mockUseMediaQuery = useMediaQuery as jest.MockedFunction<typeof useMediaQuery>;

describe('useResponsive', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // デフォルトでデスクトップサイズを設定
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 768
    });
  });

  it('モバイルサイズを正しく検出する', () => {
    mockUseMediaQuery
      .mockReturnValueOnce(true)  // isMobile
      .mockReturnValueOnce(false) // isTablet
      .mockReturnValueOnce(false); // isDesktop

    const { result } = renderHook(() => useResponsive());

    expect(result.current.isMobile).toBe(true);
    expect(result.current.isTablet).toBe(false);
    expect(result.current.isDesktop).toBe(false);
    expect(result.current.screenSize).toBe('mobile');
  });

  it('タブレットサイズを正しく検出する', () => {
    mockUseMediaQuery
      .mockReturnValueOnce(false) // isMobile
      .mockReturnValueOnce(true)  // isTablet
      .mockReturnValueOnce(false); // isDesktop

    const { result } = renderHook(() => useResponsive());

    expect(result.current.isMobile).toBe(false);
    expect(result.current.isTablet).toBe(true);
    expect(result.current.isDesktop).toBe(false);
    expect(result.current.screenSize).toBe('tablet');
  });

  it('デスクトップサイズを正しく検出する', () => {
    mockUseMediaQuery
      .mockReturnValueOnce(false) // isMobile
      .mockReturnValueOnce(false) // isTablet
      .mockReturnValueOnce(true);  // isDesktop

    const { result } = renderHook(() => useResponsive());

    expect(result.current.isMobile).toBe(false);
    expect(result.current.isTablet).toBe(false);
    expect(result.current.isDesktop).toBe(true);
    expect(result.current.screenSize).toBe('desktop');
  });

  it('ポートレート向きを正しく検出する', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 667
    });

    mockUseMediaQuery
      .mockReturnValueOnce(true)  // isMobile
      .mockReturnValueOnce(false) // isTablet
      .mockReturnValueOnce(false); // isDesktop

    const { result } = renderHook(() => useResponsive());

    expect(result.current.orientation).toBe('portrait');
  });

  it('ランドスケープ向きを正しく検出する', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 667
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 375
    });

    mockUseMediaQuery
      .mockReturnValueOnce(true)  // isMobile
      .mockReturnValueOnce(false) // isTablet
      .mockReturnValueOnce(false); // isDesktop

    const { result } = renderHook(() => useResponsive());

    expect(result.current.orientation).toBe('landscape');
  });
});