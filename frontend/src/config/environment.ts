// 環境設定
export const isDevelopment = import.meta.env.DEV;
export const isProduction = import.meta.env.PROD;

// デモモードの判定（本番環境でもモックデータを使用）
export const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true' || true; // 常にデモモード

// API URLの設定
export const API_URL = isDemoMode 
  ? '' // デモモードではAPIを使用しない
  : (import.meta.env.VITE_API_URL || 'http://localhost:3001');

// アプリケーションタイトル
export const APP_TITLE = import.meta.env.VITE_APP_TITLE || '歯科衛生士月間勤怠システム';