import { CsvExportService } from '../csvExportService';
import { PatientMonthlyStats } from '../../types/PatientReport';
import { HygienistMonthlyStats } from '../../types/HygienistReport';

describe('CsvExportService', () => {
  describe('convertPatientReportToCsv', () => {
    it('患者別レポートを正しくCSV形式に変換する', () => {
      const mockData: PatientMonthlyStats = {
        patientId: 1,
        patientName: '田中太郎',
        phone: '090-1234-5678',
        email: 'taro@example.com',
        address: '東京都新宿区1-2-3',
        year: 2024,
        month: 1,
        totalVisits: 5,
        completedVisits: 4,
        cancelledVisits: 1,
        scheduledVisits: 0,
        totalHours: 3.5,
        averageVisitDuration: 42,
        visitDetails: [
          {
            id: 1,
            visitDate: new Date('2024-01-15'),
            startTime: '09:00',
            endTime: '09:30',
            duration: 30,
            status: 'completed',
            hygienistName: '佐藤花子',
            hygienistStaffId: 'H001',
            notes: '定期検診'
          },
          {
            id: 2,
            visitDate: new Date('2024-01-20'),
            startTime: '14:00',
            endTime: '15:00',
            duration: 60,
            status: 'cancelled',
            hygienistName: '鈴木次郎',
            hygienistStaffId: 'H002',
            cancellationReason: '体調不良'
          }
        ]
      };

      const result = CsvExportService.convertPatientReportToCsv(mockData);

      expect(result).toContain('患者名');
      expect(result).toContain('田中太郎');
      expect(result).toContain('2024年1月');
      expect(result).toContain('5'); // 総訪問回数
      expect(result).toContain('4'); // 完了回数
      expect(result).toContain('1'); // キャンセル回数
      expect(result).toContain('80%'); // 完了率
      expect(result).toContain('佐藤花子');
      expect(result).toContain('体調不良');
    });

    it('訪問詳細が空の場合でも正しく処理する', () => {
      const mockData: PatientMonthlyStats = {
        patientId: 2,
        patientName: '山田花子',
        phone: '080-0000-0000',
        email: 'hanako@example.com',
        address: '大阪府大阪市1-2-3',
        year: 2024,
        month: 2,
        totalVisits: 0,
        completedVisits: 0,
        cancelledVisits: 0,
        scheduledVisits: 0,
        totalHours: 0,
        averageVisitDuration: 0,
        visitDetails: []
      };

      const result = CsvExportService.convertPatientReportToCsv(mockData);

      expect(result).toContain('山田花子');
      expect(result).toContain('0%'); // 完了率
      expect(result).not.toContain('undefined');
    });
  });

  describe('convertHygienistReportToCsv', () => {
    it('歯科衛生士別レポートを正しくCSV形式に変換する', () => {
      const mockData: HygienistMonthlyStats = {
        hygienistId: 1,
        hygienistName: '佐藤花子',
        staffId: 'H001',
        year: 2024,
        month: 1,
        totalVisits: 10,
        completedVisits: 8,
        cancelledVisits: 2,
        scheduledVisits: 0,
        totalHours: 6.5,
        averageVisitDuration: 39,
        visitDetails: [
          {
            id: 1,
            visitDate: '2024-01-15',
            patientName: '田中太郎',
            patientId: 'P001',
            startTime: '09:00',
            endTime: '09:30',
            duration: 30,
            status: 'completed',
            notes: '定期検診'
          },
          {
            id: 2,
            visitDate: '2024-01-20',
            patientName: '山田花子',
            patientId: 'P002',
            startTime: '14:00',
            endTime: '15:00',
            duration: 60,
            status: 'cancelled',
            cancellationReason: '患者都合'
          }
        ]
      };

      const result = CsvExportService.convertHygienistReportToCsv(mockData);

      expect(result).toContain('歯科衛生士名');
      expect(result).toContain('佐藤花子');
      expect(result).toContain('H001');
      expect(result).toContain('2024年1月');
      expect(result).toContain('10'); // 総訪問回数
      expect(result).toContain('8'); // 完了回数
      expect(result).toContain('2'); // キャンセル回数
      expect(result).toContain('田中太郎');
      expect(result).toContain('患者都合');
    });

    it('訪問詳細が空の場合でも正しく処理する', () => {
      const mockData: HygienistMonthlyStats = {
        hygienistId: 2,
        hygienistName: '鈴木次郎',
        staffId: 'H002',
        year: 2024,
        month: 2,
        totalVisits: 0,
        completedVisits: 0,
        cancelledVisits: 0,
        scheduledVisits: 0,
        totalHours: 0,
        averageVisitDuration: 0,
        visitDetails: []
      };

      const result = CsvExportService.convertHygienistReportToCsv(mockData);

      expect(result).toContain('鈴木次郎');
      expect(result).toContain('H002');
      expect(result).not.toContain('undefined');
    });
  });

  describe('getStatusLabel', () => {
    it('ステータスラベルを正しく変換する', () => {
      // privateメソッドなので、実際のCSV出力結果で確認
      const mockData: PatientMonthlyStats = {
        patientId: 1,
        patientName: 'テスト患者',
        phone: '000',
        email: 'test@example.com',
        address: 'Test Address',
        year: 2024,
        month: 1,
        totalVisits: 3,
        completedVisits: 1,
        cancelledVisits: 1,
        scheduledVisits: 1,
        totalHours: 1,
        averageVisitDuration: 30,
        visitDetails: [
          {
            id: 1,
            visitDate: new Date('2024-01-15'),
            startTime: '09:00',
            endTime: '09:30',
            duration: 30,
            status: 'completed',
            hygienistName: 'テスト衛生士',
            hygienistStaffId: 'H001'
          },
          {
            id: 2,
            visitDate: new Date('2024-01-16'),
            startTime: '10:00',
            endTime: '10:30',
            duration: 30,
            status: 'cancelled',
            hygienistName: 'テスト衛生士',
            hygienistStaffId: 'H001'
          },
          {
            id: 3,
            visitDate: new Date('2024-01-17'),
            startTime: '11:00',
            endTime: '11:30',
            duration: 30,
            status: 'scheduled',
            hygienistName: 'テスト衛生士',
            hygienistStaffId: 'H001'
          }
        ]
      };

      const result = CsvExportService.convertPatientReportToCsv(mockData);

      expect(result).toContain('完了');
      expect(result).toContain('キャンセル');
      expect(result).toContain('予定');
    });
  });
});