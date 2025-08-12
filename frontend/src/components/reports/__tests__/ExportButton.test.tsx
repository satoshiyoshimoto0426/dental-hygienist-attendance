import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ExportButton } from '../ExportButton';

describe('ExportButton', () => {
  it('デフォルトのプロパティで正しくレンダリングされる', () => {
    const mockOnExport = vi.fn();
    render(<ExportButton onExport={mockOnExport} />);

    const button = screen.getByRole('button', { name: /csv出力/i });
    expect(button).toBeInTheDocument();
    expect(button).not.toBeDisabled();
  });

  it('カスタムラベルが正しく表示される', () => {
    const mockOnExport = vi.fn();
    render(<ExportButton onExport={mockOnExport} label="カスタム出力" />);

    expect(screen.getByRole('button', { name: /カスタム出力/i })).toBeInTheDocument();
  });

  it('disabled状態が正しく適用される', () => {
    const mockOnExport = vi.fn();
    render(<ExportButton onExport={mockOnExport} disabled={true} />);

    const button = screen.getByRole('button', { name: /csv出力/i });
    expect(button).toBeDisabled();
  });

  it('クリック時にonExportが呼ばれる', async () => {
    const mockOnExport = vi.fn().mockResolvedValue(undefined);
    render(<ExportButton onExport={mockOnExport} />);

    const button = screen.getByRole('button', { name: /csv出力/i });
    fireEvent.click(button);

    expect(mockOnExport).toHaveBeenCalledTimes(1);
  });

  it('出力中はローディング状態になる', async () => {
    let resolveExport: () => void;
    const mockOnExport = vi.fn(() => new Promise<void>((resolve) => {
      resolveExport = resolve;
    }));

    render(<ExportButton onExport={mockOnExport} />);

    const button = screen.getByRole('button', { name: /csv出力/i });
    fireEvent.click(button);

    // ローディング状態の確認
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /出力中/i })).toBeInTheDocument();
    });

    expect(button).toBeDisabled();

    // 出力完了
    resolveExport!();
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /csv出力/i })).toBeInTheDocument();
    });

    expect(button).not.toBeDisabled();
  });

  it('出力エラー時もローディング状態が解除される', async () => {
    const mockOnExport = vi.fn().mockRejectedValue(new Error('Export failed'));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(<ExportButton onExport={mockOnExport} />);

    const button = screen.getByRole('button', { name: /csv出力/i });
    fireEvent.click(button);

    // ローディング状態の確認
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /出力中/i })).toBeInTheDocument();
    });

    // エラー後にローディング状態が解除される
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /csv出力/i })).toBeInTheDocument();
    });

    expect(button).not.toBeDisabled();
    expect(consoleSpy).toHaveBeenCalledWith('CSV出力エラー:', expect.any(Error));

    consoleSpy.mockRestore();
  });

  it('ローディング中はクリックが無効になる', async () => {
    let resolveExport: () => void;
    const mockOnExport = vi.fn(() => new Promise<void>((resolve) => {
      resolveExport = resolve;
    }));

    render(<ExportButton onExport={mockOnExport} />);

    const button = screen.getByRole('button', { name: /csv出力/i });
    
    // 最初のクリック
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /出力中/i })).toBeInTheDocument();
    });

    // ローディング中の追加クリック
    fireEvent.click(button);

    // onExportは1回だけ呼ばれる
    expect(mockOnExport).toHaveBeenCalledTimes(1);

    resolveExport!();
  });

  it('disabled状態でクリックしても何も起こらない', () => {
    const mockOnExport = vi.fn();
    render(<ExportButton onExport={mockOnExport} disabled={true} />);

    const button = screen.getByRole('button', { name: /csv出力/i });
    fireEvent.click(button);

    expect(mockOnExport).not.toHaveBeenCalled();
  });

  it('異なるvariantとsizeが正しく適用される', () => {
    const mockOnExport = vi.fn();
    render(
      <ExportButton 
        onExport={mockOnExport} 
        variant="contained" 
        size="large" 
      />
    );

    const button = screen.getByRole('button', { name: /csv出力/i });
    expect(button).toHaveClass('MuiButton-contained');
    expect(button).toHaveClass('MuiButton-sizeLarge');
  });
});