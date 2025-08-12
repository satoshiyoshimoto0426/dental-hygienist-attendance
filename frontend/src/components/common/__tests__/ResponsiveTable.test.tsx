import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { ResponsiveTable, TableColumn, StatusChip } from '../ResponsiveTable';
import { useResponsive } from '../../../hooks/useResponsive';

// useResponsiveをモック
jest.mock('../../../hooks/useResponsive');
const mockUseResponsive = useResponsive as jest.MockedFunction<typeof useResponsive>;

const theme = createTheme();

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider theme={theme}>
    {children}
  </ThemeProvider>
);

describe('ResponsiveTable', () => {
  const mockColumns: TableColumn[] = [
    { id: 'id', label: 'ID', minWidth: 50 },
    { id: 'name', label: '名前', minWidth: 100 },
    { id: 'email', label: 'メール', hideOnMobile: true },
    { id: 'status', label: 'ステータス', format: (value) => <span>{value}</span> }
  ];

  const mockRows = [
    { id: 1, name: '田中太郎', email: 'tanaka@example.com', status: 'active' },
    { id: 2, name: '佐藤花子', email: 'sato@example.com', status: 'inactive' }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('デスクトップでテーブル形式で表示される', () => {
    mockUseResponsive.mockReturnValue({
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      screenSize: 'desktop',
      orientation: 'landscape'
    });

    render(
      <TestWrapper>
        <ResponsiveTable columns={mockColumns} rows={mockRows} />
      </TestWrapper>
    );

    // テーブルヘッダーが表示される
    expect(screen.getByText('ID')).toBeInTheDocument();
    expect(screen.getByText('名前')).toBeInTheDocument();
    expect(screen.getByText('メール')).toBeInTheDocument();
    expect(screen.getByText('ステータス')).toBeInTheDocument();

    // データが表示される
    expect(screen.getByText('田中太郎')).toBeInTheDocument();
    expect(screen.getByText('tanaka@example.com')).toBeInTheDocument();
  });

  it('モバイルでカード形式で表示される', () => {
    mockUseResponsive.mockReturnValue({
      isMobile: true,
      isTablet: false,
      isDesktop: false,
      screenSize: 'mobile',
      orientation: 'portrait'
    });

    render(
      <TestWrapper>
        <ResponsiveTable columns={mockColumns} rows={mockRows} />
      </TestWrapper>
    );

    // カード形式で表示される
    expect(screen.getByText('田中太郎')).toBeInTheDocument();
    expect(screen.getByText('佐藤花子')).toBeInTheDocument();

    // hideOnMobileのカラムは表示されない
    expect(screen.queryByText('tanaka@example.com')).not.toBeInTheDocument();
  });

  it('データが空の場合にメッセージが表示される', () => {
    mockUseResponsive.mockReturnValue({
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      screenSize: 'desktop',
      orientation: 'landscape'
    });

    render(
      <TestWrapper>
        <ResponsiveTable columns={mockColumns} rows={[]} />
      </TestWrapper>
    );

    expect(screen.getByText('データがありません')).toBeInTheDocument();
  });

  it('カスタム空メッセージが表示される', () => {
    mockUseResponsive.mockReturnValue({
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      screenSize: 'desktop',
      orientation: 'landscape'
    });

    render(
      <TestWrapper>
        <ResponsiveTable 
          columns={mockColumns} 
          rows={[]} 
          emptyMessage="カスタムメッセージ"
        />
      </TestWrapper>
    );

    expect(screen.getByText('カスタムメッセージ')).toBeInTheDocument();
  });

  it('行クリックイベントが動作する', () => {
    const mockOnRowClick = jest.fn();
    
    mockUseResponsive.mockReturnValue({
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      screenSize: 'desktop',
      orientation: 'landscape'
    });

    render(
      <TestWrapper>
        <ResponsiveTable 
          columns={mockColumns} 
          rows={mockRows} 
          onRowClick={mockOnRowClick}
        />
      </TestWrapper>
    );

    const firstRow = screen.getByText('田中太郎').closest('tr');
    fireEvent.click(firstRow!);

    expect(mockOnRowClick).toHaveBeenCalledWith(mockRows[0]);
  });

  it('フォーマット関数が正しく動作する', () => {
    const columnsWithFormat: TableColumn[] = [
      { 
        id: 'price', 
        label: '価格', 
        format: (value) => `¥${value.toLocaleString()}` 
      }
    ];
    
    const rowsWithPrice = [
      { price: 1000 },
      { price: 2500 }
    ];

    mockUseResponsive.mockReturnValue({
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      screenSize: 'desktop',
      orientation: 'landscape'
    });

    render(
      <TestWrapper>
        <ResponsiveTable columns={columnsWithFormat} rows={rowsWithPrice} />
      </TestWrapper>
    );

    expect(screen.getByText('¥1,000')).toBeInTheDocument();
    expect(screen.getByText('¥2,500')).toBeInTheDocument();
  });
});

describe('StatusChip', () => {
  it('デフォルトのステータスチップが表示される', () => {
    render(
      <TestWrapper>
        <StatusChip status="active" />
      </TestWrapper>
    );

    expect(screen.getByText('active')).toBeInTheDocument();
  });

  it('カスタムカラーマップが適用される', () => {
    const colorMap = {
      active: 'success' as const,
      inactive: 'error' as const
    };

    render(
      <TestWrapper>
        <StatusChip status="active" colorMap={colorMap} />
      </TestWrapper>
    );

    const chip = screen.getByText('active');
    expect(chip).toBeInTheDocument();
  });

  it('カスタムラベルマップが適用される', () => {
    const labelMap = {
      active: 'アクティブ',
      inactive: '非アクティブ'
    };

    render(
      <TestWrapper>
        <StatusChip status="active" labelMap={labelMap} />
      </TestWrapper>
    );

    expect(screen.getByText('アクティブ')).toBeInTheDocument();
  });
});