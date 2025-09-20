import dotenv from 'dotenv';

// 環境に応じた.envファイルを読み込み
const envFile = process.env.NODE_ENV === 'production' 
  ? '.env.production' 
  : process.env.NODE_ENV === 'test' 
    ? '.env.test' 
    : '.env';

dotenv.config({ path: envFile });

export interface EnvironmentConfig {
  // データベース設定
  database: {
    host: string;
    port: number;
    name: string;
    user: string;
    password: string;
  };
  
  // JWT設定
  jwt: {
    secret: string;
    expiresIn: string;
  };
  
  // サーバー設定
  server: {
    port: number;
    nodeEnv: string;
  };
  
  // CORS設定
  cors: {
    origin: string;
  };
  
  // セキュリティ設定
  security: {
    rateLimitWindowMs: number;
    rateLimitMaxRequests: number;
  };
  
  // ログ設定
  logging: {
    level: string;
    filePath: string;
  };
  
  // セッション設定
  session: {
    timeout: number;
  };
}

// 環境変数の検証とデフォルト値の設定
const getEnvironmentConfig = (): EnvironmentConfig => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const useMockDB = process.env.USE_MOCK_DATABASE === 'true' || process.env.USE_MOCK_DB === 'true';
  
  // 開発環境でモックDBを使用する場合は、DB設定をスキップ
  if (!isDevelopment || !useMockDB) {
    const requiredEnvVars = [
      'DB_HOST',
      'DB_PORT',
      'DB_NAME',
      'DB_USER',
      'DB_PASSWORD',
      'JWT_SECRET'
    ];

    // 必須環境変数のチェック
    for (const envVar of requiredEnvVars) {
      if (!process.env[envVar]) {
        throw new Error(`必須の環境変数 ${envVar} が設定されていません`);
      }
    }
  } else {
    // モックDB使用時はJWT_SECRETのみチェック
    if (!process.env.JWT_SECRET) {
      // 開発環境用のデフォルトシークレットを設定
      process.env.JWT_SECRET = 'dev-secret-key-change-in-production';
    }
  }

  return {
    database: {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      name: process.env.DB_NAME || 'dental_hygienist_db',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
    },
    jwt: {
      secret: process.env.JWT_SECRET!,
      expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    },
    server: {
      port: parseInt(process.env.PORT || '3001', 10),
      nodeEnv: process.env.NODE_ENV || 'development',
    },
    cors: {
      origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    },
    security: {
      rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
      rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
    },
    logging: {
      level: process.env.LOG_LEVEL || 'info',
      filePath: process.env.LOG_FILE_PATH || './logs/app.log',
    },
    session: {
      timeout: parseInt(process.env.SESSION_TIMEOUT || '86400000', 10),
    },
  };
};

export const config = getEnvironmentConfig();

// 開発環境かどうかの判定
export const isDevelopment = config.server.nodeEnv === 'development';
export const isProduction = config.server.nodeEnv === 'production';
export const isTest = config.server.nodeEnv === 'test';