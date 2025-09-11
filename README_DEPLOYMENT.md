# 歯科衛生士月間勤怠システム - デプロイメントガイド

## 🚀 システム概要

このシステムは以下の構成でデプロイされます：
- **フロントエンド**: Vercel
- **バックエンド**: Railway/Render
- **データベース**: PostgreSQL (Railway/Supabase)

## 📋 デプロイメント手順

### 1. フロントエンドのデプロイ (Vercel)

1. Vercelアカウントを作成
2. GitHubリポジトリと連携
3. 以下の環境変数を設定：
   ```
   VITE_API_URL=https://your-backend-url.railway.app
   VITE_APP_TITLE=歯科衛生士月間勤怠システム
   VITE_DEMO_MODE=false
   ```

4. デプロイ設定：
   - Framework: Vite
   - Build Command: `cd frontend && npm install && npm run build`
   - Output Directory: `frontend/dist`

### 2. バックエンドのデプロイ (Railway)

1. Railwayアカウントを作成
2. 新しいプロジェクトを作成
3. PostgreSQLサービスを追加
4. GitHubリポジトリと連携
5. 以下の環境変数を設定：
   ```
   NODE_ENV=production
   PORT=3001
   DB_HOST=<Railway提供のホスト>
   DB_PORT=5432
   DB_NAME=<データベース名>
   DB_USER=<ユーザー名>
   DB_PASSWORD=<パスワード>
   JWT_SECRET=<ランダムな文字列>
   JWT_EXPIRES_IN=7d
   CORS_ORIGIN=https://your-frontend.vercel.app
   ```

6. デプロイ設定：
   - Build Command: `cd backend && npm install && npm run build`
   - Start Command: `cd backend && npm start`

### 3. データベースの初期化

バックエンドがデプロイされたら、データベーススキーマを初期化：

```bash
# Railway CLIを使用
railway run npm run migrate
```

または、Railway コンソールから直接SQLを実行

### 4. 動作確認

1. フロントエンドURL: `https://your-app.vercel.app`
2. バックエンドヘルスチェック: `https://your-backend.railway.app/health`
3. ログイン情報:
   - ユーザー名: admin
   - パスワード: admin (初回ログイン後に変更推奨)

## 🔒 セキュリティ設定

### 本番環境で必須の設定

1. **JWT_SECRET**: 強力なランダム文字列に変更
2. **管理者パスワード**: 初回ログイン後すぐに変更
3. **CORS設定**: フロントエンドのURLのみ許可
4. **HTTPS**: 両方のサービスでHTTPS強制
5. **Rate Limiting**: DDoS攻撃対策を有効化

## 📊 モニタリング

### 推奨ツール

- **Sentry**: エラートラッキング
- **LogRocket**: ユーザーセッション記録
- **Datadog/New Relic**: パフォーマンス監視

## 🔄 CI/CD パイプライン

### GitHub Actions設定

`.github/workflows/deploy.yml`:
```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: |
          cd backend
          npm ci
          npm test
      - run: |
          cd frontend
          npm ci
          npm test

  deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}

  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: railway/deploy@v1
        with:
          railway-token: ${{ secrets.RAILWAY_TOKEN }}
```

## 🔧 トラブルシューティング

### よくある問題と解決方法

1. **CORS エラー**
   - バックエンドの`CORS_ORIGIN`環境変数を確認
   - フロントエンドのURLが正しく設定されているか確認

2. **データベース接続エラー**
   - Railway/Renderの環境変数が正しく設定されているか確認
   - PostgreSQLサービスが起動しているか確認

3. **認証エラー**
   - JWT_SECRETが両環境で一致しているか確認
   - トークンの有効期限を確認

## 📝 メンテナンス

### 定期的なタスク

- [ ] 依存関係の更新 (月1回)
- [ ] セキュリティパッチの適用
- [ ] データベースバックアップ (週1回)
- [ ] ログのローテーション
- [ ] パフォーマンスレビュー

## 📞 サポート

問題が発生した場合は、以下にお問い合わせください：
- GitHub Issues: [リポジトリURL]/issues
- メール: support@example.com