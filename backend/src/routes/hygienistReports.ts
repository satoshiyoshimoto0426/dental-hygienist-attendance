import express from 'express';
import { HygienistReportController } from '../controllers/hygienistReportController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// 全てのルートに認証を適用
router.use(authenticateToken);

// 歯科衛生士別月間統計を取得
router.get('/hygienist/:hygienistId/monthly', HygienistReportController.getHygienistMonthlyStats);

// 歯科衛生士別年間統計を取得
router.get('/hygienist/:hygienistId/yearly', HygienistReportController.getHygienistYearlyStats);

// 複数歯科衛生士の月間統計比較を取得
router.get('/hygienist-comparison', HygienistReportController.getHygienistComparisonReport);

// 歯科衛生士別レポートをCSV形式で出力
router.get('/hygienist/:hygienistId/csv', HygienistReportController.exportHygienistReportCsv);

export default router;