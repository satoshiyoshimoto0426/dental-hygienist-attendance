# 本番デプロイメントガイド

## 概要

このドキュメントは、歯科衛生士勤怠システムの本番環境へのデプロイメント手順を説明します。

## 前提条件

### システム要件
- Docker Engine 20.10+
- Docker Compose 2.0+
- PostgreSQL 15+ (コンテナまたは外部)
- 最低 4GB RAM、2 CPU コア
- 最低 20GB ディスク容量

### ネットワーク要件
- ポート 80 (HTTP)
- ポート 443 (HTTPS)
- ポート 3001 (バックエンドAPI)
- ポート 5432 (PostgreSQL、内部通信のみ)

## デプロイメント手順

### 1. 環境設定

#### 1.1 環境変数の設定
`.env.production` ファイルを編集し、本番環境に適した値を設定してください：

```bash
# データベース設定
DB_NAME=dental_hygienist_prod
DB_USER=dental_hygienist_user
DB_PASSWORD=your_secure_database_password_here

# JWT設定
JWT_SECRET=your_very_secure_jwt_secret_key_here_minimum_32_characters
JWT_EXPIRES_IN=24h

# CORS設定
CORS_ORIGIN=https://yourdomain.com

# フロントエンドAPI URL
VITE_API_BASE_URL=https://yourdomain.com/api
```

#### 1.2 SSL証明書の設定（HTTPS使用時）
SSL証明書を `./ssl/` ディレクトリに配置してください：
- `./ssl/cert.pem` - SSL証明書
- `./ssl/key.pem` - 秘密鍵

### 2. データベースの初期設定

#### 2.1 PostgreSQLの設定
```bash
# PostgreSQL管理者として実行
sudo -u postgres psql -f scripts/setup-production-db.sql
```

#### 2.2 データベースマイグレーション
```bash
# アプリケーションコンテナ内で実行
docker-compose -f docker-compose.prod.yml exec backend npm run migrate
```

### 3. アプリケーションのデプロイ

#### 3.1 自動デプロイスクリプトの使用（推奨）

**Linux/macOS:**
```bash
./scripts/deploy-production.sh
```

**Windows (PowerShell):**
```powershell
.\scripts\deploy-production.ps1
```

#### 3.2 手動デプロイ

```bash
# 1. イメージのビルド
docker-compose -f docker-compose.prod.yml build

# 2. コンテナの起動
docker-compose -f docker-compose.prod.yml up -d

# 3. ヘルスチェック
curl http://localhost/health
curl http://localhost:3001/api/health
```

### 4. セキュリティ設定の確認

`scripts/security-checklist.md` を参照し、すべての項目を確認してください。

#### 4.1 重要なセキュリティ設定
- [ ] 強力なパスワードの設定
- [ ] JWT秘密鍵の安全な生成
- [ ] HTTPS の有効化
- [ ] ファイアウォールの設定
- [ ] レート制限の確認

## 運用・監視

### ログの確認
```bash
# アプリケーションログ
docker-compose -f docker-compose.prod.yml logs -f backend
docker-compose -f docker-compose.prod.yml logs -f frontend

# データベースログ
docker-compose -f docker-compose.prod.yml logs -f database
```

### ヘルスチェック
```bash
# フロントエンド
curl http://localhost/health

# バックエンドAPI
curl http://localhost:3001/api/health

# データベース
docker-compose -f docker-compose.prod.yml exec database pg_isready -U dental_hygienist_user -d dental_hygienist_prod
```

### バックアップ

#### データベースバックアップ
```bash
# 手動バックアップ
docker-compose -f docker-compose.prod.yml exec database pg_dump -U dental_hygienist_user dental_hygienist_prod > backup_$(date +%Y%m%d_%H%M%S).sql

# 自動バックアップ（cron設定例）
0 2 * * * /path/to/backup-script.sh
```

#### データベース復元
```bash
# バックアップからの復元
docker-compose -f docker-compose.prod.yml exec -T database psql -U dental_hygienist_user -d dental_hygienist_prod < backup_file.sql
```

## トラブルシューティング

### よくある問題

#### 1. データベース接続エラー
```bash
# データベースコンテナの状態確認
docker-compose -f docker-compose.prod.yml ps database

# データベースログの確認
docker-compose -f docker-compose.prod.yml logs database
```

#### 2. フロントエンドが表示されない
```bash
# Nginxの設定確認
docker-compose -f docker-compose.prod.yml exec frontend nginx -t

# Nginxログの確認
docker-compose -f docker-compose.prod.yml logs frontend
```

#### 3. APIエラー
```bash
# バックエンドログの確認
docker-compose -f docker-compose.prod.yml logs backend

# バックエンドコンテナ内での確認
docker-compose -f docker-compose.prod.yml exec backend npm run health-check
```

### ロールバック手順

#### 自動ロールバック
デプロイスクリプトは失敗時に自動的にロールバックを実行します。

#### 手動ロールバック
```bash
# 1. 現在のコンテナを停止
docker-compose -f docker-compose.prod.yml down

# 2. 前のバックアップからデータベースを復元
docker-compose -f docker-compose.prod.yml up -d database
cat backup_file.sql | docker-compose -f docker-compose.prod.yml exec -T database psql -U dental_hygienist_user -d dental_hygienist_prod

# 3. 前のバージョンのコンテナを起動
# (前のイメージタグを指定)
```

## パフォーマンス最適化

### データベース最適化
```sql
-- インデックスの確認
SELECT schemaname, tablename, indexname, indexdef 
FROM pg_indexes 
WHERE schemaname = 'public';

-- 統計情報の更新
ANALYZE;

-- 不要なデータのクリーンアップ
VACUUM;
```

### コンテナリソース制限
`docker-compose.prod.yml` でリソース制限を設定：

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
```

## セキュリティ更新

### 定期的な更新作業
1. ベースイメージの更新
2. 依存関係の更新
3. セキュリティパッチの適用
4. SSL証明書の更新

### セキュリティ監視
- ログの定期的な確認
- 異常なアクセスパターンの監視
- 脆弱性スキャンの実施

## サポート

問題が発生した場合は、以下の情報を収集してください：
- エラーメッセージ
- ログファイル
- システム情報
- 再現手順

## 更新履歴

| 日付 | バージョン | 変更内容 |
|------|------------|----------|
| 2024-01-XX | 1.0.0 | 初回リリース |