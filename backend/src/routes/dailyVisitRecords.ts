import express from 'express';
import { DailyVisitRecordController } from '../controllers/dailyVisitRecordController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// 全てのルートに認証を適用
router.use(authenticateToken);

/**
 * 日次訪問記録一覧を取得
 * GET /api/daily-visit-records
 * クエリパラメータ:
 * - year: 年（月間取得時に必要）
 * - month: 月（月間取得時に必要）
 * - patientId: 患者ID（患者別取得時）
 * - hygienistId: 歯科衛生士ID（歯科衛生士別取得時）
 */
router.get('/', DailyVisitRecordController.getDailyVisitRecords);

/**
 * 月間統計を取得
 * GET /api/daily-visit-records/stats/monthly
 * クエリパラメータ:
 * - year: 年（必須）
 * - month: 月（必須）
 */
router.get('/stats/monthly', DailyVisitRecordController.getMonthlyStats);

/**
 * 日次訪問記録を取得
 * GET /api/daily-visit-records/:id
 */
router.get('/:id', DailyVisitRecordController.getDailyVisitRecord);

/**
 * 日次訪問記録を作成
 * POST /api/daily-visit-records
 * リクエストボディ:
 * {
 *   patientId: number,
 *   hygienistId: number,
 *   visitDate: string,
 *   startTime?: string,
 *   endTime?: string,
 *   status?: 'scheduled' | 'completed' | 'cancelled',
 *   cancellationReason?: string,
 *   notes?: string
 * }
 */
router.post('/', DailyVisitRecordController.createDailyVisitRecord);

/**
 * 日次訪問記録を更新
 * PUT /api/daily-visit-records/:id
 * リクエストボディ: 更新したいフィールドのみ
 */
router.put('/:id', DailyVisitRecordController.updateDailyVisitRecord);

/**
 * 日次訪問記録を削除
 * DELETE /api/daily-visit-records/:id
 */
router.delete('/:id', DailyVisitRecordController.deleteDailyVisitRecord);

export default router;