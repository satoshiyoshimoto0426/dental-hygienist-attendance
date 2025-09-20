import * as XLSX from 'xlsx';
import { format, parseISO } from 'date-fns';
import ja from 'date-fns/locale/ja';
import { Patient, VisitRecord, Hygienist } from '../types';

export const exportPatientMonthlyReport = (
  patient: Patient,
  records: VisitRecord[],
  month: Date,
  hygienists: Hygienist[]
) => {
  const wb = XLSX.utils.book_new();
  
  // A4縦1枚に収まるように設計されたレポート
  const reportData: any[][] = [];
  
  // ヘッダー部分
  reportData.push(['患者月間訪問報告書']);
  reportData.push(['']);
  reportData.push(['報告月', format(month, 'yyyy年MM月', { locale: ja })]);
  reportData.push(['']);
  
  // 患者基本情報（上部）
  reportData.push(['【患者情報】']);
  reportData.push(['患者ID', patient.patientId, '氏名', patient.name, 'フリガナ', patient.kana]);
  reportData.push(['生年月日', patient.birthDate, '年齢', `${patient.age}歳`, '性別', patient.gender]);
  reportData.push(['住所', patient.address]);
  reportData.push(['電話番号', patient.phone, '緊急連絡先', patient.emergencyContact || '', '緊急電話', patient.emergencyPhone || '']);
  reportData.push(['要介護度', patient.careLevel || '', '既往歴', patient.medicalHistory || '']);
  reportData.push(['']);
  
  // 医療・介護関連情報
  reportData.push(['【医療・介護情報】']);
  reportData.push(['歯科クリニック', patient.dentalClinic || '', '担当歯科医師', patient.dentist || '']);
  reportData.push(['居宅介護支援事業所', patient.careOffice || '', 'ケアマネージャー', patient.careManager || '']);
  reportData.push(['']);
  
  // 月間サマリー
  const completedVisits = records.filter(r => r.status === 'completed').length;
  const cancelledVisits = records.filter(r => r.status === 'cancelled').length;
  let totalMinutes = 0;
  const serviceCount: { [key: string]: number } = {};
  
  records.forEach(record => {
    // サービス種別カウント
    record.serviceType.forEach(type => {
      serviceCount[type] = (serviceCount[type] || 0) + 1;
    });
    // 訪問時間計算
    if (record.startTime && record.endTime) {
      const [startHour, startMin] = record.startTime.split(':').map(Number);
      const [endHour, endMin] = record.endTime.split(':').map(Number);
      totalMinutes += (endHour * 60 + endMin) - (startHour * 60 + startMin);
    }
  });
  
  reportData.push(['【月間サマリー】']);
  reportData.push(['総訪問回数', `${records.length}回`, '完了', `${completedVisits}回`, 'キャンセル', `${cancelledVisits}回`]);
  reportData.push(['総ケア時間', `${Math.round(totalMinutes / 60 * 10) / 10}時間`]);
  
  const serviceBreakdown = Object.entries(serviceCount).map(([type, count]) => `${type}: ${count}回`).join('、');
  reportData.push(['サービス内訳', serviceBreakdown]);
  reportData.push(['']);
  
  // 訪問記録詳細（下部）
  reportData.push(['【訪問記録詳細】']);
  reportData.push(['訪問日', '時間', '担当衛生士', 'サービス内容', '実施内容', '患者状態', '家族コメント']);
  
  // 各訪問記録を追加
  records.forEach(record => {
    const hygienist = hygienists.find(h => h.id === record.hygienistId);
    reportData.push([
      format(parseISO(record.visitDate), 'MM/dd(E)', { locale: ja }),
      `${record.startTime}-${record.endTime}`,
      hygienist?.name || '',
      record.serviceType.join('、'),
      record.careDetails || '',
      record.patientCondition || '',
      record.familyComments || ''
    ]);
  });
  
  // 備考欄
  reportData.push(['']);
  reportData.push(['【備考】']);
  reportData.push([patient.notes || '']);
  
  // シートを作成
  const ws = XLSX.utils.aoa_to_sheet(reportData);
  
  // 列幅の設定（A4に収まるように調整）
  const colWidths = [
    { wch: 15 }, // A列
    { wch: 20 }, // B列
    { wch: 12 }, // C列
    { wch: 20 }, // D列
    { wch: 12 }, // E列
    { wch: 15 }, // F列
    { wch: 25 }  // G列
  ];
  ws['!cols'] = colWidths;
  
  // セルの結合（タイトル）
  ws['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 6 } }, // タイトル行
  ];
  
  // シートをワークブックに追加
  XLSX.utils.book_append_sheet(wb, ws, '月間報告書');
  
  // ファイル名を生成してダウンロード
  const fileName = `患者月間報告書_${patient.name}_${format(month, 'yyyyMM')}.xlsx`;
  XLSX.writeFile(wb, fileName);
};

export const exportHygienistMonthlyReport = (
  hygienist: Hygienist,
  records: VisitRecord[],
  month: Date,
  patients: Patient[]
) => {
  const wb = XLSX.utils.book_new();
  
  // レポートデータ
  const reportData: any[][] = [];
  
  // ヘッダー
  reportData.push(['歯科衛生士月間勤務報告書']);
  reportData.push(['']);
  reportData.push(['報告月', format(month, 'yyyy年MM月', { locale: ja })]);
  reportData.push(['']);
  
  // 衛生士情報
  reportData.push(['【歯科衛生士情報】']);
  reportData.push(['スタッフID', hygienist.staffId, '氏名', hygienist.name]);
  reportData.push(['免許番号', hygienist.licenseNumber, '専門分野', hygienist.specialties?.join('、') || '']);
  reportData.push(['']);
  
  // 勤務統計
  const patientCount = new Set(records.map(r => r.patientId)).size;
  let totalMinutes = 0;
  records.forEach(record => {
    if (record.startTime && record.endTime) {
      const [startHour, startMin] = record.startTime.split(':').map(Number);
      const [endHour, endMin] = record.endTime.split(':').map(Number);
      totalMinutes += (endHour * 60 + endMin) - (startHour * 60 + startMin);
    }
  });
  
  reportData.push(['【月間勤務統計】']);
  reportData.push(['総訪問回数', `${records.length}回`, '担当患者数', `${patientCount}名`]);
  reportData.push(['総勤務時間', `${Math.round(totalMinutes / 60 * 10) / 10}時間`, '平均訪問時間', `${records.length > 0 ? Math.round(totalMinutes / records.length) : 0}分`]);
  reportData.push(['']);
  
  // 訪問記録一覧
  reportData.push(['【訪問記録一覧】']);
  reportData.push(['訪問日', '患者名', '時間', 'サービス内容', '実施内容', 'ステータス']);
  
  records.forEach(record => {
    const patient = patients.find(p => p.id === record.patientId);
    reportData.push([
      format(parseISO(record.visitDate), 'MM/dd(E)', { locale: ja }),
      patient?.name || '',
      `${record.startTime}-${record.endTime}`,
      record.serviceType.join('、'),
      record.careDetails || '',
      record.status === 'completed' ? '完了' : record.status === 'cancelled' ? 'キャンセル' : '予定'
    ]);
  });
  
  // シートを作成
  const ws = XLSX.utils.aoa_to_sheet(reportData);
  
  // 列幅の設定
  const colWidths = [
    { wch: 12 }, // A列
    { wch: 20 }, // B列
    { wch: 15 }, // C列
    { wch: 25 }, // D列
    { wch: 30 }, // E列
    { wch: 10 }  // F列
  ];
  ws['!cols'] = colWidths;
  
  // セルの結合（タイトル）
  ws['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 5 } }, // タイトル行
  ];
  
  // シートをワークブックに追加
  XLSX.utils.book_append_sheet(wb, ws, '勤務報告書');
  
  // ファイル名を生成してダウンロード
  const fileName = `歯科衛生士勤務報告書_${hygienist.name}_${format(month, 'yyyyMM')}.xlsx`;
  XLSX.writeFile(wb, fileName);
};