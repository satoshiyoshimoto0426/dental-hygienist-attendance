import { renderHook } from '@testing-library/react';
import { useApiError } from '../useApiError';
import { useError } from '../../contexts/ErrorContext';
import { ApiClientError } from '../../services/api';

// useErrorをモック
jest.mock('../../contexts/ErrorContext');
const mockUseError = useError as jest.MockedFunction<typeof useError>;

describe('useApiError', () => {
  const mockAddError = jest.fn();

  beforeEach(() => {
    mockUseError.mockReturnValue({
      errors: [],
      addError: mockAddError,
      removeError: jest.fn(),
      clearErrors: jest.fn()
    });
    jest.clearAllMocks();
  });

  it('ApiClientErrorを適切に処理する', () => {
    const { result } = renderHook(() => useApiError());
    
    const apiError = new ApiClientError(
      'VALIDATION_ERROR',
      'バリデーションエラーです',
      400,
      { field: 'name' }
    );

    result.current.handleApiError(apiError);

    expect(mockAddError).toHaveBeenCalledWith(
      'バリデーションエラーです',
      'error',
      {
        code: 'VALIDATION_ERROR',
        statusCode: 400,
        details: { field: 'name' }
      }
    );
  });

  it('通常のErrorを適切に処理する', () => {
    const { result } = renderHook(() => useApiError());
    
    const error = new Error('通常のエラーです');

    result.current.handleApiError(error);

    expect(mockAddError).toHaveBeenCalledWith('通常のエラーです', 'error');
  });

  it('未知のエラーを適切に処理する', () => {
    const { result } = renderHook(() => useApiError());
    
    const unknownError = 'string error';

    result.current.handleApiError(unknownError);

    expect(mockAddError).toHaveBeenCalledWith('予期しないエラーが発生しました', 'error');
  });

  it('成功メッセージを適切に処理する', () => {
    const { result } = renderHook(() => useApiError());
    
    result.current.handleSuccess('操作が成功しました');

    expect(mockAddError).toHaveBeenCalledWith('操作が成功しました', 'info');
  });

  it('警告メッセージを適切に処理する', () => {
    const { result } = renderHook(() => useApiError());
    
    result.current.handleWarning('注意が必要です');

    expect(mockAddError).toHaveBeenCalledWith('注意が必要です', 'warning');
  });
});