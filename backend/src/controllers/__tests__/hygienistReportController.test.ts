import { Request, Response } from 'express';
import { HygienistReportController } from '../hygienistReportController';
import { HygienistReportModel } from '../../models/HygienistReport';

// HygienistReportModelをモック
jest.mock('../../models/HygienistReport');
const mockHygienistReportModel = HygienistReportModel as jest.Mocked<typeof HygienistReportModel>;

describe('HygienistReportController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

  beforeEach(() => {
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    
    mockRequest = {};
    mockResponse = {
      json: mockJson,
      status: mockStatus
    };

    jest.clearAllMocks();
  });

  describe('getHygienistMonthlyStats', () => {
    it('正常な場合、歯科衛生士別月間統計を返す', async () => {
      const mockStats = {
        hygienistId: 1,
        hygienistName: '田中花子',
        staffId: 'H001',
        year: 2024,
        month: 1,
        totalVisits: 10,
        completedVisits: 8,
        cancelledVisits: 2,
        scheduledVisits: 0,
        totalHours: 12.5,
        averageVisitDuration: 75,
        visitDetails: []
      };

      mockRequest.params = { hygienistId: '1' };
      mockRequest.query = { year: '2024', month: '1' };

      mockHygienistReportModel.getHygienistMonthlyStats.mockResolvedValue(mockStats);

      await HygienistReportController.getHygienistMonthlyStats(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockHygienistReportModel.getHygienistMonthlyStats).toHaveBeenCalledWith({
        hygienistId: 1,
        year: 2024,
        month: 1
      });

      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: mockStats
      });
    });

    it('無効なパラメータの場合、400エラーを返す', async () => {
      mockRequest.params = { hygienistId: 'invalid' };
      mockRequest.query = { year: '2024', month: '1' };

      await HygienistReportController.getHygienistMonthlyStats(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'INVALID_PARAMETERS',
          message: '歯科衛生士ID、年、月は数値である必要があります'
        }
      });
    });

    it('無効な月の場合、400エラーを返す', async () => {
      mockRequest.params = { hygienistId: '1' };
      mockRequest.query = { year: '2024', month: '13' };

      await HygienistReportController.getHygienistMonthlyStats(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'INVALID_MONTH',
          message: '月は1から12の間で指定してください'
        }
      });
    });

    it('歯科衛生士が見つからない場合、404エラーを返す', async () => {
      mockRequest.params = { hygienistId: '999' };
      mockRequest.query = { year: '2024', month: '1' };

      mockHygienistReportModel.getHygienistMonthlyStats.mockResolvedValue(null);

      await HygienistReportController.getHygienistMonthlyStats(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'HYGIENIST_NOT_FOUND',
          message: '指定された歯科衛生士が見つかりません'
        }
      });
    });

    it('データベースエラーの場合、500エラーを返す', async () => {
      mockRequest.params = { hygienistId: '1' };
      mockRequest.query = { year: '2024', month: '1' };

      mockHygienistReportModel.getHygienistMonthlyStats.mockRejectedValue(
        new Error('Database error')
      );

      await HygienistReportController.getHygienistMonthlyStats(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: '歯科衛生士別月間統計の取得に失敗しました'
        }
      });
    });
  });

  describe('getHygienistComparisonReport', () => {
    it('正常な場合、歯科衛生士比較レポートを返す', async () => {
      const mockReport = {
        year: 2024,
        month: 1,
        hygienists: [],
        totalHygienists: 0,
        averageVisitsPerHygienist: 0
      };

      mockRequest.query = { year: '2024', month: '1' };

      mockHygienistReportModel.getHygienistComparisonReport.mockResolvedValue(mockReport);

      await HygienistReportController.getHygienistComparisonReport(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockHygienistReportModel.getHygienistComparisonReport).toHaveBeenCalledWith(2024, 1);

      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: mockReport
      });
    });
  });

  describe('getHygienistYearlyStats', () => {
    it('正常な場合、歯科衛生士年間統計を返す', async () => {
      const mockStats = [
        {
          hygienistId: 1,
          hygienistName: '田中花子',
          staffId: 'H001',
          year: 2024,
          month: 1,
          totalVisits: 10,
          completedVisits: 8,
          cancelledVisits: 2,
          scheduledVisits: 0,
          totalHours: 12.5,
          averageVisitDuration: 75,
          visitDetails: []
        }
      ];

      mockRequest.params = { hygienistId: '1' };
      mockRequest.query = { year: '2024' };

      mockHygienistReportModel.getHygienistYearlyStats.mockResolvedValue(mockStats);

      await HygienistReportController.getHygienistYearlyStats(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockHygienistReportModel.getHygienistYearlyStats).toHaveBeenCalledWith(1, 2024);

      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: mockStats
      });
    });
  });
});