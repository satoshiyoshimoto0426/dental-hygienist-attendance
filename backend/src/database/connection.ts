import { Pool, PoolConfig } from 'pg';
import dotenv from 'dotenv';
import { mockDatabase } from './mockDatabase';

dotenv.config();

// モックデータベースを使用するかどうか
const useMockDB = process.env.USE_MOCK_DB === 'true';

let pool: any;

if (useMockDB) {
  // 開発環境でモックデータベースを使用
  console.log('Using mock database for development');
  pool = mockDatabase;
} else {
  // 本番環境でPostgreSQLを使用
  const poolConfig: PoolConfig = {
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'dental_hygienist_attendance',
    password: process.env.DB_PASSWORD || 'password',
    port: parseInt(process.env.DB_PORT || '5432'),
    max: 20, // 最大接続数
    idleTimeoutMillis: 30000, // アイドルタイムアウト
    connectionTimeoutMillis: 2000, // 接続タイムアウト
  };
  pool = new Pool(poolConfig);
}

export { pool };

// データベース接続テスト
export const testConnection = async (): Promise<boolean> => {
  try {
    if (useMockDB) {
      // モックデータベースの場合は常に成功
      console.log('モックデータベース接続成功');
      return true;
    }
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();
    console.log('データベース接続成功');
    return true;
  } catch (error) {
    console.error('データベース接続エラー:', error);
    return false;
  }
};

// データベース接続を閉じる
export const closeConnection = async (): Promise<void> => {
  try {
    if (!useMockDB) {
      await pool.end();
      console.log('データベース接続を閉じました');
    }
  } catch (error) {
    console.error('データベース接続終了エラー:', error);
  }
};

// プロセス終了時にデータベース接続を閉じる
process.on('SIGINT', async () => {
  await closeConnection();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await closeConnection();
  process.exit(0);
});