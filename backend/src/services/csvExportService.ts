import { PatientMonthlyStats } from '../types/PatientReport';
import { HygienistMonthlyStats } from '../types/HygienistReport';

/**
 * CSV出力サービス
 */
export class CsvExportService {
  /**
   * 患者別レポートをCSV形式に変換
   */
  static convertPatientReportToCsv(data: PatientMonthlyStats): string {
    const infoRows = [
      ['患者名', data.patientName],
      ['患者ID', data.patientId.toString()],
      ['電話番号', data.phone || ''],
      ['メールアドレス', data.email || ''],
      ['住所', data.address || '']
    ];

    const headers = [
      '対象年月',
      '総訪問回数',
      '完了回数',
      'キャンセル回数',
      '予定回数',
      '総時間（時間）',
      '平均訪問時間（分）',
      '完了率（%）'
    ];

    const completionRate = data.totalVisits > 0 ? 
      Math.round((data.completedVisits / data.totalVisits) * 100) : 0;

    const summaryRow = [
      `${data.year}年${data.month}月`,
      data.totalVisits.toString(),
      data.completedVisits.toString(),
      data.cancelledVisits.toString(),
      data.scheduledVisits.toString(),
      data.totalHours.toString(),
      data.averageVisitDuration?.toString() || '0',
      `${completionRate}%`
    ];

    // 詳細データのヘッダー
    const detailHeaders = [
      '訪問日',
      '開始時間',
      '終了時間',
      '時間（分）',
      'ステータス',
      '担当歯科衛生士',
      'スタッフID',
      'キャンセル理由',
      '備考'
    ];

    const detailRows = data.visitDetails.map(visit => [
      visit.visitDate.toLocaleDateString('ja-JP'),
      visit.startTime || '',
      visit.endTime || '',
      visit.duration?.toString() || '',
      this.getStatusLabel(visit.status),
      visit.hygienistName,
      visit.hygienistStaffId || '',
      visit.cancellationReason || '',
      visit.notes || ''
    ]);

    const csvRows = [
      ...infoRows,
      [],
      headers,
      summaryRow,
      [], // 空行
      detailHeaders,
      ...detailRows
    ];

    return csvRows.map(row => 
      row.map(cell => `"${cell.toString().replace(/"/g, '""')}"`).join(',')
    ).join('\n');
  }

  /**
   * 歯科衛生士別レポートをCSV形式に変換
   */
  static convertHygienistReportToCsv(data: HygienistMonthlyStats): string {
    const headers = [
      '歯科衛生士名',
      'スタッフID',
      '対象年月',
      '総訪問回数',
      '完了回数',
      'キャンセル回数',
      '予定回数',
      '総勤務時間（時間）',
      '平均訪問時間（分）'
    ];

    const summaryRow = [
      data.hygienistName,
      data.staffId || '',
      `${data.year}年${data.month}月`,
      data.totalVisits.toString(),
      data.completedVisits.toString(),
      data.cancelledVisits.toString(),
      data.scheduledVisits.toString(),
      data.totalHours.toString(),
      data.averageVisitDuration?.toString() || '0'
    ];

    // 詳細データのヘッダー
    const detailHeaders = [
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '訪問日',
      '患者名',
      '患者ID',
      '開始時間',
      '終了時間',
      '時間（分）',
      'ステータス',
      'キャンセル理由',
      '備考'
    ];

    const detailRows = data.visitDetails.map(visit => [
      '', '', '', '', '', '', '', '', '', // 空のセル（サマリー部分）
      visit.visitDate,
      visit.patientName,
      visit.patientId || '',
      visit.startTime || '',
      visit.endTime || '',
      visit.duration?.toString() || '',
      this.getStatusLabel(visit.status),
      visit.cancellationReason || '',
      visit.notes || ''
    ]);

    const csvRows = [
      headers,
      summaryRow,
      [], // 空行
      detailHeaders,
      ...detailRows
    ];

    return csvRows.map(row => 
      row.map(cell => `"${cell.toString().replace(/"/g, '""')}"`).join(',')
    ).join('\n');
  }

  /**
   * ステータスラベルを取得
   */
  private static getStatusLabel(status: string): string {
    switch (status) {
      case 'completed':
        return '完了';
      case 'cancelled':
        return 'キャンセル';
      case 'scheduled':
        return '予定';
      default:
        return status;
    }
  }
}