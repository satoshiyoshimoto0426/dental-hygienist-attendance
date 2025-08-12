import express from 'express';
import { PatientReportController } from '../controllers/patientReportController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// 全てのルートに認証を適用
router.use(authenticateToken);

/**
 * 患者別月間統計を取得
 * GET /api/patient-reports/:patientId/monthly?year=2024&month=1
 */
router.get('/:patientId/monthly', PatientReportController.getPatientMonthlyStats);

/**
 * 患者別年間統計を取得
 * GET /api/patient-reports/:patientId/yearly?year=2024
 */
router.get('/:patientId/yearly', PatientReportController.getPatientYearlyStats);

/**
 * 複数患者の月間統計比較を取得
 * GET /api/patient-reports/comparison?year=2024&month=1
 */
router.get('/comparison', PatientReportController.getPatientComparisonReport);

/**
 * 患者別レポートをCSV形式で出力
 * GET /api/patient-reports/:patientId/csv?year=2024&month=1
 */
router.get('/:patientId/csv', PatientReportController.exportPatientReportCsv);

export default router;