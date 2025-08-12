import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CsvExportService } from '../csvExportService';

// APIをモック化
const mockGet = vi.fn();
vi.mock('../api', () => ({
  default: {
    get: mockGet
  }
}));

// DOM APIをモック化
Object.defineProperty(window, 'URL', {
  value: {
    createObjectURL: vi.fn(() => 'mock-url'),
    revokeObjectURL: vi.fn()
  }
});

// document.createElement をモック化
const mockLink = {
  href: '',
  download: '',
  click: vi.fn()
};

Object.defineProperty(document, 'createElement', {
  value: vi.fn(() => mockLink)
});

Object.defineProperty(document.body, 'appendChild', {
  value: vi.fn()
});

Object.defineProperty(document.body, 'removeChild', {
  value: vi.fn()
});

describe('CsvExportService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('exportPatientReport', () => {
    it('患者別レポートを正しくCSV出力する', async () => {
      const mockBlob = new Blob(['test csv data'], { type: 'text/csv' });
      const mockResponse = {
        data: mockBlob,
        headers: {
          'content-disposition': 'attachment; filename="患者別レポート_田中太郎_2024年1月.csv"'
        }
      };

      mockGet.mockResolvedValue(mockResponse);

      const params = {
        patientId: 1,
        year: 2024,
        month: 1
      };

      await CsvExportService.exportPatientReport(params);

      expect(mockGet).toHaveBeenCalledWith(
        '/patient-reports/1/csv',
        {
          params: {
            year: 2024,
            month: 1
          },
          responseType: 'blob'
        }
      );

      expect(window.URL.createObjectURL).toHaveBeenCalledWith(mockBlob);
      expect(document.createElement).toHaveBeenCalledWith('a');
      expect(mockLink.click).toHaveBeenCalled();
      expect(window.URL.revokeObjectURL).toHaveBeenCalledWith('mock-url');
    });

    it('APIエラー時に適切なエラーを投げる', async () => {
      const mockError = new Error('API Error');
      mockGet.mockRejectedValue(mockError);

      const params = {
        patientId: 1,
        year: 2024,
        month: 1
      };

      await expect(CsvExportService.exportPatientReport(params))
        .rejects
        .toThrow('患者別レポートのCSV出力に失敗しました');
    });

    it('Content-Dispositionヘッダーがない場合はデフォルトファイル名を使用する', async () => {
      const mockBlob = new Blob(['test csv data'], { type: 'text/csv' });
      const mockResponse = {
        data: mockBlob,
        headers: {}
      };

      mockGet.mockResolvedValue(mockResponse);

      const params = {
        patientId: 1,
        year: 2024,
        month: 1
      };

      await CsvExportService.exportPatientReport(params);

      expect(mockLink.download).toBe('患者別レポート_2024年1月.csv');
    });
  });

  describe('exportHygienistReport', () => {
    it('歯科衛生士別レポートを正しくCSV出力する', async () => {
      const mockBlob = new Blob(['test csv data'], { type: 'text/csv' });
      const mockResponse = {
        data: mockBlob,
        headers: {
          'content-disposition': 'attachment; filename="歯科衛生士別レポート_佐藤花子_2024年1月.csv"'
        }
      };

      mockGet.mockResolvedValue(mockResponse);

      const params = {
        hygienistId: 1,
        year: 2024,
        month: 1
      };

      await CsvExportService.exportHygienistReport(params);

      expect(mockGet).toHaveBeenCalledWith(
        '/hygienist-reports/hygienist/1/csv',
        {
          params: {
            year: 2024,
            month: 1
          },
          responseType: 'blob'
        }
      );

      expect(window.URL.createObjectURL).toHaveBeenCalledWith(mockBlob);
      expect(document.createElement).toHaveBeenCalledWith('a');
      expect(mockLink.click).toHaveBeenCalled();
      expect(window.URL.revokeObjectURL).toHaveBeenCalledWith('mock-url');
    });

    it('APIエラー時に適切なエラーを投げる', async () => {
      const mockError = new Error('API Error');
      mockGet.mockRejectedValue(mockError);

      const params = {
        hygienistId: 1,
        year: 2024,
        month: 1
      };

      await expect(CsvExportService.exportHygienistReport(params))
        .rejects
        .toThrow('歯科衛生士別レポートのCSV出力に失敗しました');
    });

    it('Content-Dispositionヘッダーがない場合はデフォルトファイル名を使用する', async () => {
      const mockBlob = new Blob(['test csv data'], { type: 'text/csv' });
      const mockResponse = {
        data: mockBlob,
        headers: {}
      };

      mockGet.mockResolvedValue(mockResponse);

      const params = {
        hygienistId: 1,
        year: 2024,
        month: 1
      };

      await CsvExportService.exportHygienistReport(params);

      expect(mockLink.download).toBe('歯科衛生士別レポート_2024年1月.csv');
    });
  });
});