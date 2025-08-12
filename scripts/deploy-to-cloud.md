# 外部WEBアプリとしてのデプロイ手順

## 🚀 Vercel + Railway デプロイ（推奨）

### 前提条件
- GitHubアカウント
- Vercelアカウント（無料）
- Railwayアカウント（無料）

### ステップ1: GitHubリポジトリの準備

1. **GitHubに新しいリポジトリを作成**
2. **現在のプロジェクトをプッシュ**

```bash
git init
git add .
git commit -m "Initial commit: 歯科衛生士勤怠システム"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/dental-hygienist-attendance.git
git push -u origin main
```

### ステップ2: Railway（バックエンド）デプロイ

1. **Railway.app にアクセス**
   - https://railway.app/
   - GitHubでサインアップ/ログイン

2. **新しいプロジェクトを作成**
   - "Deploy from GitHub repo" を選択
   - リポジトリを選択

3. **環境変数を設定**
   ```
   NODE_ENV=production
   PORT=3001
   USE_MOCK_DATABASE=true
   JWT_SECRET=super_secure_jwt_secret_for_production_railway_2024
   CORS_ORIGIN=https://your-app-name.vercel.app
   ```

4. **デプロイ設定**
   - Root Directory: `backend`
   - Build Command: `npm run build`
   - Start Command: `npm start`

### ステップ3: Vercel（フロントエンド）デプロイ

1. **Vercel.com にアクセス**
   - https://vercel.com/
   - GitHubでサインアップ/ログイン

2. **新しいプロジェクトをインポート**
   - GitHubリポジトリを選択
   - Framework Preset: Vite
   - Root Directory: `frontend`

3. **環境変数を設定**
   ```
   VITE_API_BASE_URL=https://your-railway-app.railway.app/api
   VITE_APP_NAME=歯科衛生士勤怠システム
   VITE_ENVIRONMENT=production
   ```

### ステップ4: CORS設定の更新

Railwayのバックエンド環境変数で：
```
CORS_ORIGIN=https://your-vercel-app.vercel.app
```

## 🎯 その他のオプション

### オプション2: Netlify + Render

#### Netlify（フロントエンド）
- 無料プラン: 100GB帯域幅/月
- 自動デプロイ
- カスタムドメイン対応

#### Render（バックエンド）
- 無料プラン: 750時間/月
- PostgreSQL対応
- 自動スリープ機能

### オプション3: GitHub Pages + Heroku

#### GitHub Pages（フロントエンド）
- 完全無料
- GitHubリポジトリから直接デプロイ

#### Heroku（バックエンド）
- 無料プラン廃止のため有料（$7/月〜）

## 💰 コスト比較

| サービス | フロントエンド | バックエンド | 月額コスト |
|----------|----------------|--------------|------------|
| Vercel + Railway | 無料 | 無料 | $0 |
| Netlify + Render | 無料 | 無料 | $0 |
| GitHub Pages + Heroku | 無料 | $7〜 | $7〜 |

## 🔧 推奨構成

**Vercel + Railway** が最もおすすめです：
- 両方とも無料プランが充実
- 設定が簡単
- 自動デプロイ
- 高いパフォーマンス
- 日本からのアクセスが高速

## 📱 デプロイ後のURL例

- **フロントエンド**: https://dental-hygienist-attendance.vercel.app
- **バックエンドAPI**: https://dental-hygienist-backend.railway.app/api

## 🔐 セキュリティ設定

本番環境では以下を必ず設定：
- 強力なJWTシークレット
- HTTPS通信の強制
- 適切なCORS設定
- レート制限の有効化

## 📞 サポート

デプロイで問題が発生した場合：
1. 各サービスのドキュメントを確認
2. GitHub Issuesで質問
3. コミュニティフォーラムを活用