# デプロイメント設定ガイド

## 概要

歯科衛生士月間勤怠システムのデプロイメント設定について説明します。

## 環境構成

### 開発環境 (Development)
- **フロントエンド**: http://localhost:3000
- **バックエンド**: http://localhost:3001
- **データベース**: PostgreSQL (localhost:5432)

### ステージング環境 (Staging)
- **フロントエンド**: https://staging.dental-hygienist-attendance.com
- **バックエンド**: https://staging-api.dental-hygienist-attendance.com
- **データベース**: PostgreSQL (staging-db.dental-hygienist-attendance.com:5432)

### 本番環境 (Production)
- **フロントエンド**: https://dental-hygienist-attendance.com
- **バックエンド**: https://api.dental-hygienist-attendance.com
- **データベース**: PostgreSQL (prod-db.dental-hygienist-attendance.com:5432)

## 環境変数設定

### フロントエンド環境変数

#### 開発環境 (.env)
```bash
VITE_API_BASE_URL=http://localhost:3001/api
VITE_APP_TITLE=歯科衛生士月間勤怠システム
VITE_APP_VERSION=1.0.0
VITE_ENVIRONMENT=development
VITE_ENABLE_DEVTOOLS=true
VITE_LOG_LEVEL=debug
```

#### ステージング環境 (.env.staging)
```bash
VITE_API_BASE_URL=https://staging-api.dental-hygienist-attendance.com/api
VITE_APP_TITLE=歯科衛生士月間勤怠システム（ステージング）
VITE_APP_VERSION=1.0.0
VITE_ENVIRONMENT=staging
VITE_ENABLE_DEVTOOLS=false
VITE_LOG_LEVEL=info
```

#### 本番環境 (.env.production)
```bash
VITE_API_BASE_URL=https://api.dental-hygienist-attendance.com/api
VITE_APP_TITLE=歯科衛生士月間勤怠システム
VITE_APP_VERSION=1.0.0
VITE_ENVIRONMENT=production
VITE_ENABLE_DEVTOOLS=false
VITE_LOG_LEVEL=warn
```

### バックエンド環境変数

#### 開発環境 (.env)
```bash
NODE_ENV=development
PORT=3001
DB_HOST=localhost
DB_PORT=5432
DB_NAME=dental_hygienist_attendance
DB_USER=postgres
DB_PASSWORD=password
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=24h
CORS_ORIGIN=http://localhost:3000
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
LOG_LEVEL=debug
LOG_FILE_PATH=./logs/app.log
SESSION_TIMEOUT=86400000
```

#### ステージング環境 (.env.staging)
```bash
NODE_ENV=staging
PORT=3001
DB_HOST=staging-db.dental-hygienist-attendance.com
DB_PORT=5432
DB_NAME=dental_hygienist_attendance_staging
DB_USER=dental_app_staging
DB_PASSWORD=staging_secure_password
JWT_SECRET=staging_jwt_secret_key_for_testing
JWT_EXPIRES_IN=24h
CORS_ORIGIN=https://staging.dental-hygienist-attendance.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=200
LOG_LEVEL=info
LOG_FILE_PATH=./logs/staging.log
SESSION_TIMEOUT=86400000
```

#### 本番環境 (.env.production)
```bash
NODE_ENV=production
PORT=3001
DB_HOST=prod-db.dental-hygienist-attendance.com
DB_PORT=5432
DB_NAME=dental_hygienist_attendance_prod
DB_USER=dental_app_user
DB_PASSWORD=secure_production_password
JWT_SECRET=super_secure_jwt_secret_for_production_use_only
JWT_EXPIRES_IN=24h
CORS_ORIGIN=https://dental-hygienist-attendance.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
LOG_LEVEL=warn
LOG_FILE_PATH=./logs/app.log
SESSION_TIMEOUT=86400000
```

## デプロイメント手順

### 1. 前提条件
- Node.js 18以上
- PostgreSQL 13以上
- Git

### 2. フロントエンドのビルドとデプロイ

#### 開発環境
```bash
cd frontend
npm install
npm run dev
```

#### ステージング環境
```bash
cd frontend
npm install
npm run build:staging
# ビルドされたファイルをステージングサーバーにデプロイ
```

#### 本番環境
```bash
cd frontend
npm install
npm run build
# ビルドされたファイルを本番サーバーにデプロイ
```

### 3. バックエンドのデプロイ

#### 開発環境
```bash
cd backend
npm install
npm run dev
```

#### ステージング環境
```bash
cd backend
npm install
npm run build
NODE_ENV=staging npm start
```

#### 本番環境
```bash
cd backend
npm install
npm run build
NODE_ENV=production npm start
```

### 4. データベースセットアップ

#### マイグレーション実行
```bash
cd backend
npm run migrate
```

#### 初期データ投入（必要に応じて）
```bash
cd backend
npm run seed
```

## セキュリティ設定

### 本番環境でのセキュリティ要件
1. **HTTPS の使用**: すべての通信でHTTPSを使用
2. **強力なJWTシークレット**: 32文字以上のランダムな文字列
3. **データベースパスワード**: 強力なパスワードの使用
4. **CORS設定**: 適切なオリジンの設定
5. **レート制限**: API呼び出しの制限
6. **ログレベル**: 本番環境では'warn'レベル

### 環境変数の管理
- 本番環境の環境変数は環境変数管理システムまたはシークレット管理サービスを使用
- `.env`ファイルは本番環境では使用しない
- 機密情報はバージョン管理システムにコミットしない

## 監視とログ

### ログ設定
- **開発環境**: debug レベル
- **ステージング環境**: info レベル
- **本番環境**: warn レベル

### ヘルスチェック
- **エンドポイント**: `/health`
- **レスポンス**: `{"status": "OK", "timestamp": "...", "environment": "..."}`

## トラブルシューティング

### よくある問題と解決方法

#### 1. API接続エラー
- CORS設定を確認
- API Base URLが正しく設定されているか確認
- ネットワーク接続を確認

#### 2. 認証エラー
- JWT シークレットが正しく設定されているか確認
- トークンの有効期限を確認

#### 3. データベース接続エラー
- データベース接続情報を確認
- データベースサーバーが起動しているか確認
- ネットワーク接続を確認

## 統合テスト

### テスト実行
```bash
# バックエンド統合テスト
cd backend
npm test integration-final.test

# フロントエンド統合テスト
cd frontend
npm test -- --run integration-final.test
```

### テスト内容
- 環境設定の確認
- API エンドポイントの存在確認
- セキュリティ設定の確認
- エラーハンドリングの確認
- CORS設定の確認

## 継続的インテグレーション/デプロイメント (CI/CD)

### 推奨ワークフロー
1. **開発**: 機能開発とテスト
2. **ステージング**: 統合テストと受け入れテスト
3. **本番**: 本番デプロイメント

### 自動化可能な項目
- コードの品質チェック
- 単体テストの実行
- 統合テストの実行
- ビルドプロセス
- デプロイメント

## Docker を使用した本番デプロイメント

### Docker Compose を使用したデプロイ

本番環境では Docker Compose を使用した統合デプロイメントが推奨されます。

#### 前提条件
- Docker Engine 20.10+
- Docker Compose 2.0+

#### デプロイ手順

1. **設定ファイルの準備**
```bash
# 本番環境変数の設定
cp .env.production.example .env.production
# 必要な値を設定

# 設定の検証
node scripts/validate-production-config.js
```

2. **自動デプロイ（推奨）**
```bash
# Linux/macOS
./scripts/deploy-production.sh

# Windows (PowerShell)
.\scripts\deploy-production.ps1
```

3. **手動デプロイ**
```bash
# イメージのビルド
docker-compose -f docker-compose.prod.yml build

# コンテナの起動
docker-compose -f docker-compose.prod.yml up -d

# ヘルスチェック
curl http://localhost/health
curl http://localhost:3001/api/health
```

#### セキュリティ設定の確認

デプロイ前に `scripts/security-checklist.md` のすべての項目を確認してください。

#### 監視とメンテナンス

```bash
# ログの確認
docker-compose -f docker-compose.prod.yml logs -f

# コンテナの状態確認
docker-compose -f docker-compose.prod.yml ps

# データベースバックアップ
docker-compose -f docker-compose.prod.yml exec database pg_dump -U dental_hygienist_user dental_hygienist_prod > backup.sql
```

詳細な本番デプロイメント手順については、`PRODUCTION_DEPLOYMENT.md` を参照してください。

## 参考資料

- [Node.js デプロイメントガイド](https://nodejs.org/en/docs/guides/deployment/)
- [Vite デプロイメントガイド](https://vitejs.dev/guide/build.html)
- [PostgreSQL セキュリティガイド](https://www.postgresql.org/docs/current/security.html)
- [Docker セキュリティベストプラクティス](https://docs.docker.com/develop/security-best-practices/)
- [本番デプロイメント詳細ガイド](./PRODUCTION_DEPLOYMENT.md)