export interface EnvironmentConfig {
  // API設定
  api: {
    baseUrl: string;
  };
  
  // アプリケーション設定
  app: {
    title: string;
    version: string;
    environment: string;
    demoMode: boolean;
  };
  
  // セキュリティ設定
  security: {
    enableDevtools: boolean;
  };
  
  // ログ設定
  logging: {
    level: string;
  };
}

// 環境変数の検証とデフォルト値の設定
const getEnvironmentConfig = (): EnvironmentConfig => {
  return {
    api: {
      baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api',
    },
    app: {
      title: import.meta.env.VITE_APP_TITLE || '歯科衛生士月間勤怠システム',
      version: import.meta.env.VITE_APP_VERSION || '1.0.0',
      environment: import.meta.env.VITE_ENVIRONMENT || 'development',
      demoMode: import.meta.env.VITE_DEMO_MODE === 'true',
    },
    security: {
      enableDevtools: import.meta.env.VITE_ENABLE_DEVTOOLS === 'true',
    },
    logging: {
      level: import.meta.env.VITE_LOG_LEVEL || 'info',
    },
  };
};

export const config = getEnvironmentConfig();

// 環境判定のヘルパー
export const isDevelopment = config.app.environment === 'development';
export const isProduction = config.app.environment === 'production';
export const isDemoMode = config.app.demoMode;

// ログレベルの判定
export const shouldLog = (level: 'debug' | 'info' | 'warn' | 'error'): boolean => {
  const levels = ['debug', 'info', 'warn', 'error'];
  const currentLevelIndex = levels.indexOf(config.logging.level);
  const requestedLevelIndex = levels.indexOf(level);
  
  return requestedLevelIndex >= currentLevelIndex;
};