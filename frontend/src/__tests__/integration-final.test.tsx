import { describe, it, expect } from 'vitest';
import { config, isDevelopment, isProduction } from '../config/environment';

describe('統合テスト - フロントエンドとバックエンドの統合', () => {
  describe('環境設定の確認', () => {
    it('環境変数が正しく読み込まれている', () => {
      // 必須の環境設定が存在することを確認
      expect(config.api.baseUrl).toBeDefined();
      expect(config.app.title).toBeDefined();
      expect(config.app.version).toBeDefined();
      expect(config.app.environment).toBeDefined();
      
      // API Base URL の形式確認
      expect(config.api.baseUrl).toMatch(/^https?:\/\/.+\/api$/);
      
      // アプリケーション情報の確認
      expect(config.app.title).toBe('歯科衛生士月間勤怠システム');
      expect(config.app.version).toMatch(/^\d+\.\d+\.\d+$/);
    });

    it('本番環境で適切な設定が有効になっている', () => {
      if (isProduction) {
        // 本番環境での設定確認
        expect(config.api.baseUrl).toContain('https://');
        expect(config.security.enableDevtools).toBe(false);
        expect(config.logging.level).toBe('warn');
        expect(config.app.environment).toBe('production');
      }
    });

    it('開発環境で適切な設定が有効になっている', () => {
      if (isDevelopment) {
        // 開発環境での設定確認
        expect(config.api.baseUrl).toContain('localhost');
        expect(config.security.enableDevtools).toBe(true);
        expect(config.logging.level).toBe('debug');
        expect(config.app.environment).toBe('development');
      }
    });
  });

  describe('API 連携設定の確認', () => {
    it('API Base URL が正しく設定されている', () => {
      // API Base URL の形式確認
      expect(config.api.baseUrl).toMatch(/\/api$/);
      
      // 本番環境では HTTPS を使用
      if (isProduction) {
        expect(config.api.baseUrl).toMatch(/^https:\/\//);
      }
      
      // 開発環境では localhost を使用
      if (isDevelopment) {
        expect(config.api.baseUrl).toContain('localhost');
      }
    });

    it('環境に応じた API エンドポイントが設定されている', () => {
      // 本番環境
      if (isProduction) {
        expect(config.api.baseUrl).toBe('https://api.dental-hygienist-attendance.com/api');
      }
      
      // 開発環境
      if (isDevelopment) {
        expect(config.api.baseUrl).toBe('http://localhost:3001/api');
      }
    });
  });

  describe('セキュリティ設定の確認', () => {
    it('本番環境でセキュリティ設定が適切に有効になっている', () => {
      if (isProduction) {
        expect(config.security.enableDevtools).toBe(false);
        expect(config.logging.level).toBe('warn');
      }
    });

    it('開発環境で開発ツールが有効になっている', () => {
      if (isDevelopment) {
        expect(config.security.enableDevtools).toBe(true);
        expect(config.logging.level).toBe('debug');
      }
    });
  });

  describe('ログ設定の確認', () => {
    it('ログレベルが環境に応じて設定されている', () => {
      const validLogLevels = ['debug', 'info', 'warn', 'error'];
      expect(validLogLevels).toContain(config.logging.level);
      
      if (isProduction) {
        expect(config.logging.level).toBe('warn');
      }
      
      if (isDevelopment) {
        expect(config.logging.level).toBe('debug');
      }
    });

    it('ログレベル判定関数が正常に動作する', async () => {
      const { shouldLog } = await import('../config/environment');
      
      // ログレベルの判定テスト
      if (config.logging.level === 'debug') {
        expect(shouldLog('debug')).toBe(true);
        expect(shouldLog('info')).toBe(true);
        expect(shouldLog('warn')).toBe(true);
        expect(shouldLog('error')).toBe(true);
      }
      
      if (config.logging.level === 'warn') {
        expect(shouldLog('debug')).toBe(false);
        expect(shouldLog('info')).toBe(false);
        expect(shouldLog('warn')).toBe(true);
        expect(shouldLog('error')).toBe(true);
      }
    });
  });

  describe('アプリケーション設定の確認', () => {
    it('アプリケーション情報が正しく設定されている', () => {
      expect(config.app.title).toBe('歯科衛生士月間勤怠システム');
      expect(config.app.version).toBe('1.0.0');
      expect(['development', 'production', 'test']).toContain(config.app.environment);
    });

    it('環境判定関数が正常に動作する', () => {
      // 環境判定の確認
      if (config.app.environment === 'development') {
        expect(isDevelopment).toBe(true);
        expect(isProduction).toBe(false);
      }
      
      if (config.app.environment === 'production') {
        expect(isDevelopment).toBe(false);
        expect(isProduction).toBe(true);
      }
    });
  });

  describe('設定の整合性確認', () => {
    it('本番環境設定の整合性が保たれている', () => {
      if (isProduction) {
        // 本番環境では安全な設定が使用されている
        expect(config.api.baseUrl).toMatch(/^https:\/\//);
        expect(config.security.enableDevtools).toBe(false);
        expect(config.logging.level).toBe('warn');
        expect(config.app.environment).toBe('production');
      }
    });

    it('開発環境設定の整合性が保たれている', () => {
      if (isDevelopment) {
        // 開発環境では開発に適した設定が使用されている
        expect(config.api.baseUrl).toContain('localhost');
        expect(config.security.enableDevtools).toBe(true);
        expect(config.logging.level).toBe('debug');
        expect(config.app.environment).toBe('development');
      }
    });

    it('設定値が適切な型で定義されている', () => {
      // 型の確認
      expect(typeof config.api.baseUrl).toBe('string');
      expect(typeof config.app.title).toBe('string');
      expect(typeof config.app.version).toBe('string');
      expect(typeof config.app.environment).toBe('string');
      expect(typeof config.security.enableDevtools).toBe('boolean');
      expect(typeof config.logging.level).toBe('string');
    });
  });

  describe('フロントエンドとバックエンドの連携確認', () => {
    it('API エンドポイントの形式が統一されている', () => {
      // API Base URL が /api で終わることを確認
      expect(config.api.baseUrl).toMatch(/\/api$/);
      
      // プロトコルが適切に設定されていることを確認
      expect(config.api.baseUrl).toMatch(/^https?:\/\//);
    });

    it('環境に応じた適切な API エンドポイントが設定されている', () => {
      if (isProduction) {
        // 本番環境では本番 API を使用
        expect(config.api.baseUrl).not.toContain('localhost');
        expect(config.api.baseUrl).toContain('https://');
      }
      
      if (isDevelopment) {
        // 開発環境では開発 API を使用
        expect(config.api.baseUrl).toContain('localhost');
        expect(config.api.baseUrl).toContain('3001');
      }
    });
  });

  describe('設定ファイルの読み込み確認', () => {
    it('環境変数が正しく読み込まれている', () => {
      // 環境変数の読み込み確認
      expect(config).toBeDefined();
      expect(config.api).toBeDefined();
      expect(config.app).toBeDefined();
      expect(config.security).toBeDefined();
      expect(config.logging).toBeDefined();
    });

    it('デフォルト値が適切に設定されている', () => {
      // デフォルト値の確認
      expect(config.api.baseUrl).toBeTruthy();
      expect(config.app.title).toBeTruthy();
      expect(config.app.version).toBeTruthy();
      expect(config.app.environment).toBeTruthy();
    });
  });
});