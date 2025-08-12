import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import { ErrorProvider, useError } from '../ErrorContext';

// テスト用コンポーネント
const TestComponent: React.FC = () => {
  const { errors, addError, removeError, clearErrors } = useError();

  return (
    <div>
      <div data-testid="error-count">{errors.length}</div>
      {errors.map((error) => (
        <div key={error.id} data-testid={`error-${error.id}`}>
          {error.message} - {error.type}
        </div>
      ))}
      <button onClick={() => addError('テストエラー', 'error')}>
        エラー追加
      </button>
      <button onClick={() => addError('テスト警告', 'warning')}>
        警告追加
      </button>
      <button onClick={() => addError('テスト情報', 'info')}>
        情報追加
      </button>
      <button onClick={() => errors.length > 0 && removeError(errors[0].id)}>
        最初のエラー削除
      </button>
      <button onClick={clearErrors}>
        全エラークリア
      </button>
    </div>
  );
};

const TestComponentWithoutProvider: React.FC = () => {
  const { addError } = useError();
  return <button onClick={() => addError('test')}>Test</button>;
};

describe('ErrorContext', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('プロバイダーなしでuseErrorを使用するとエラーが発生する', () => {
    // console.errorをモック
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => {
      render(<TestComponentWithoutProvider />);
    }).toThrow('useError must be used within an ErrorProvider');
    
    consoleSpy.mockRestore();
  });

  it('エラーを追加できる', () => {
    render(
      <ErrorProvider>
        <TestComponent />
      </ErrorProvider>
    );

    expect(screen.getByTestId('error-count')).toHaveTextContent('0');

    act(() => {
      screen.getByText('エラー追加').click();
    });

    expect(screen.getByTestId('error-count')).toHaveTextContent('1');
    expect(screen.getByText('テストエラー - error')).toBeInTheDocument();
  });

  it('異なるタイプのエラーを追加できる', () => {
    render(
      <ErrorProvider>
        <TestComponent />
      </ErrorProvider>
    );

    act(() => {
      screen.getByText('エラー追加').click();
      screen.getByText('警告追加').click();
      screen.getByText('情報追加').click();
    });

    expect(screen.getByTestId('error-count')).toHaveTextContent('3');
    expect(screen.getByText('テストエラー - error')).toBeInTheDocument();
    expect(screen.getByText('テスト警告 - warning')).toBeInTheDocument();
    expect(screen.getByText('テスト情報 - info')).toBeInTheDocument();
  });

  it('特定のエラーを削除できる', () => {
    render(
      <ErrorProvider>
        <TestComponent />
      </ErrorProvider>
    );

    act(() => {
      screen.getByText('エラー追加').click();
      screen.getByText('警告追加').click();
    });

    expect(screen.getByTestId('error-count')).toHaveTextContent('2');

    act(() => {
      screen.getByText('最初のエラー削除').click();
    });

    expect(screen.getByTestId('error-count')).toHaveTextContent('1');
    expect(screen.queryByText('テストエラー - error')).not.toBeInTheDocument();
    expect(screen.getByText('テスト警告 - warning')).toBeInTheDocument();
  });

  it('全てのエラーをクリアできる', () => {
    render(
      <ErrorProvider>
        <TestComponent />
      </ErrorProvider>
    );

    act(() => {
      screen.getByText('エラー追加').click();
      screen.getByText('警告追加').click();
      screen.getByText('情報追加').click();
    });

    expect(screen.getByTestId('error-count')).toHaveTextContent('3');

    act(() => {
      screen.getByText('全エラークリア').click();
    });

    expect(screen.getByTestId('error-count')).toHaveTextContent('0');
  });

  it('エラーが5秒後に自動削除される', async () => {
    render(
      <ErrorProvider>
        <TestComponent />
      </ErrorProvider>
    );

    act(() => {
      screen.getByText('エラー追加').click();
    });

    expect(screen.getByTestId('error-count')).toHaveTextContent('1');

    // 5秒経過
    act(() => {
      jest.advanceTimersByTime(5000);
    });

    await waitFor(() => {
      expect(screen.getByTestId('error-count')).toHaveTextContent('0');
    });
  });

  it('エラーにはユニークなIDとタイムスタンプが設定される', () => {
    const TestComponentWithDetails: React.FC = () => {
      const { errors, addError } = useError();

      return (
        <div>
          {errors.map((error) => (
            <div key={error.id} data-testid={`error-details-${error.id}`}>
              ID: {error.id}, Timestamp: {error.timestamp.toISOString()}
            </div>
          ))}
          <button onClick={() => addError('テスト')}>エラー追加</button>
        </div>
      );
    };

    render(
      <ErrorProvider>
        <TestComponentWithDetails />
      </ErrorProvider>
    );

    act(() => {
      screen.getByText('エラー追加').click();
    });

    const errorElement = screen.getByTestId(/error-details-/);
    expect(errorElement.textContent).toMatch(/ID: \d+\w+, Timestamp: \d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/);
  });
});