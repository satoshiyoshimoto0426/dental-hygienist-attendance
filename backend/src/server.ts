import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

// 設定のインポート
import { config, isDevelopment, isProduction } from './config/environment';

// ミドルウェアのインポート
import { errorHandler } from './middleware/errorHandler';

// ルートのインポート
import authRoutes from './routes/auth';
import patientRoutes from './routes/patients';
import hygienistRoutes from './routes/hygienists';
import visitRecordRoutes from './routes/visitRecords';
import dailyVisitRecordRoutes from './routes/dailyVisitRecords';
import patientReportRoutes from './routes/patientReports';
import hygienistReportRoutes from './routes/hygienistReports';

const app = express();

// セキュリティミドルウェア
if (isProduction) {
  app.use(helmet());
} else {
  app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  }));
}

// CORS設定
app.use(cors({
  origin: config.cors.origin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ボディパーサー
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 開発環境でのリクエストログ
if (isDevelopment) {
  app.use((req, _res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

// ルート設定
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/hygienists', hygienistRoutes);
app.use('/api/visit-records', visitRecordRoutes);
app.use('/api/daily-visit-records', dailyVisitRecordRoutes);
app.use('/api/patient-reports', patientReportRoutes);
app.use('/api/hygienist-reports', hygienistReportRoutes);

// ヘルスチェック
app.get('/health', (_req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: config.server.nodeEnv
  });
});

app.get('/api/health', (_req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: config.server.nodeEnv,
    version: '1.0.0'
  });
});

// 404エラーハンドリング
app.use('*', (_req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'エンドポイントが見つかりません'
    }
  });
});

// 統一エラーハンドリングミドルウェア
app.use(errorHandler);

// サーバー起動
if (config.server.nodeEnv !== 'test') {
  app.listen(config.server.port, () => {
    console.log(`サーバーがポート ${config.server.port} で起動しました`);
    console.log(`環境: ${config.server.nodeEnv}`);
    console.log(`CORS Origin: ${config.cors.origin}`);
    if (isDevelopment) {
      console.log(`API Base URL: http://localhost:${config.server.port}/api`);
    }
  });
}

export default app;