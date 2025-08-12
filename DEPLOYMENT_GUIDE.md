# 🚀 外部WEBアプリデプロイ手順

## ステップ1: GitHubリポジトリの作成

1. **GitHubにアクセス**: https://github.com
2. **新しいリポジトリを作成**:
   - Repository name: `dental-hygienist-attendance`
   - Description: `歯科衛生士月間勤怠システム`
   - Public または Private を選択
   - README.md は追加しない（既に作成済み）

3. **ローカルからプッシュ**:
```bash
git init
git add .
git commit -m "Initial commit: 歯科衛生士勤怠システム"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/dental-hygienist-attendance.git
git push -u origin main
```

## ステップ2: Railway（バックエンド）デプロイ

1. **Railway.app にアクセス**: https://railway.app
2. **GitHubでサインアップ/ログイン**
3. **"New Project" をクリック**
4. **"Deploy from GitHub repo" を選択**
5. **作成したリポジトリを選択**
6. **"Deploy Now" をクリック**

### 環境変数の設定:
Railway のプロジェクト設定で以下を追加:

```
NODE_ENV=production
PORT=3001
USE_MOCK_DATABASE=true
JWT_SECRET=railway_super_secure_jwt_secret_2024_production
CORS_ORIGIN=https://dental-hygienist-attendance.vercel.app
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
LOG_LEVEL=info
```

### デプロイ設定:
- **Root Directory**: `backend`
- **Build Command**: `npm run build`
- **Start Command**: `npm start`

## ステップ3: Vercel（フロントエンド）デプロイ

1. **Vercel.com にアクセス**: https://vercel.com
2. **GitHubでサインアップ/ログイン**
3. **"New Project" をクリック**
4. **GitHubリポジトリを選択**
5. **設定を確認**:
   - Framework Preset: `Vite`
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`

### 環境変数の設定:
Vercel のプロジェクト設定で以下を追加:

```
VITE_API_BASE_URL=https://YOUR_RAILWAY_APP_NAME.railway.app/api
VITE_APP_NAME=歯科衛生士勤怠システム
VITE_APP_VERSION=1.0.0
VITE_ENVIRONMENT=production
VITE_ENABLE_DEVTOOLS=false
VITE_LOG_LEVEL=warn
```

**注意**: `YOUR_RAILWAY_APP_NAME` は Railway で生成されたアプリ名に置き換えてください。

## ステップ4: CORS設定の更新

1. **Railway のバックエンド環境変数を更新**:
```
CORS_ORIGIN=https://YOUR_VERCEL_APP_NAME.vercel.app
```

2. **両方のサービスを再デプロイ**

## ステップ5: 動作確認

### アクセスURL:
- **フロントエンド**: https://YOUR_VERCEL_APP_NAME.vercel.app
- **バックエンドAPI**: https://YOUR_RAILWAY_APP_NAME.railway.app/api/health

### テスト用ログイン:
- **ユーザー名**: `admin`
- **パスワード**: `admin`

## 🔧 トラブルシューティング

### よくある問題:

1. **CORS エラー**:
   - Railway の `CORS_ORIGIN` 環境変数を正しいVercel URLに設定

2. **API接続エラー**:
   - Vercel の `VITE_API_BASE_URL` を正しいRailway URLに設定

3. **ビルドエラー**:
   - 各サービスのログを確認
   - 依存関係の問題がないか確認

### デバッグ方法:

1. **Railway ログ確認**:
   - Railway ダッシュボード → プロジェクト → "Deployments" → ログを確認

2. **Vercel ログ確認**:
   - Vercel ダッシュボード → プロジェクト → "Functions" → ログを確認

3. **ブラウザ開発者ツール**:
   - F12 → Console/Network タブでエラーを確認

## 🎉 完了！

デプロイが成功すると、チームメンバーは以下のURLでアプリケーションにアクセスできます:

**https://YOUR_VERCEL_APP_NAME.vercel.app**

## 📱 チーム共有

デプロイ完了後、以下の情報をチームメンバーに共有してください:

- **アプリURL**: https://YOUR_VERCEL_APP_NAME.vercel.app
- **テストユーザー**: admin / admin
- **機能説明**: 患者管理、歯科衛生士管理、訪問記録、レポート機能

## 🔄 更新方法

コードを更新する場合:
1. ローカルで変更
2. `git add .`
3. `git commit -m "更新内容"`
4. `git push`

→ Vercel と Railway が自動的に再デプロイします！