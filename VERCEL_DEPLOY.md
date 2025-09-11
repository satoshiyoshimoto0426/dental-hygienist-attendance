# 🚀 Vercelへの手動デプロイ手順

## エラーについて
`404: NOT_FOUND` エラーは、Vercelプロジェクトがまだ正しく設定されていないことを示しています。

## 解決方法

### オプション1: Vercelダッシュボードから新規インポート（推奨）

1. [Vercel Dashboard](https://vercel.com/dashboard)にログイン
2. 「Add New...」→「Project」をクリック
3. 「Import Git Repository」を選択
4. `dental-hygienist-attendance`リポジトリを選択
5. 以下の設定を適用：
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### オプション2: ワンクリックデプロイ

以下のボタンをクリックして、自動設定でデプロイ：

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/satoshiyoshimoto0426/dental-hygienist-attendance&project-name=dental-hygienist-attendance&root-directory=frontend&framework=vite&build-command=npm%20install%20%26%26%20npm%20run%20build&output-directory=dist&install-command=npm%20install)

### オプション3: Vercel CLIを使用

```bash
# Vercel CLIをインストール
npm install -g vercel

# プロジェクトディレクトリに移動
cd frontend

# Vercelにデプロイ
vercel

# 質問に答える：
# ? Set up and deploy "~/webapp/frontend"? [Y/n] Y
# ? Which scope do you want to deploy to? (あなたのアカウントを選択)
# ? Link to existing project? [y/N] N
# ? What's your project's name? dental-hygienist-attendance
# ? In which directory is your code located? ./
# ? Want to modify these settings? [y/N] N
```

## 設定の確認ポイント

✅ **Root Directory**: `frontend`（重要！）
✅ **Framework**: Vite
✅ **Build Command**: `npm install && npm run build`
✅ **Output Directory**: `dist`

## デプロイ後の確認

1. デプロイが成功すると、URLが表示されます
2. 例: `https://dental-hygienist-attendance.vercel.app`
3. ブラウザでアクセスして動作確認

## トラブルシューティング

### ビルドエラーが発生する場合
- Node.jsバージョンを18.x以上に設定
- 環境変数の設定を確認

### 404エラーが続く場合
- プロジェクトを一度削除して再作成
- Root Directoryが`frontend`になっているか確認

## サポート
問題が解決しない場合は、GitHubのIssuesでお知らせください。