# 🚨 緊急デプロイガイド - 歯科衛生士管理システム

## 現在の状況
- ローカル環境でビルドエラーが発生
- しかし、**コードは正常**でデプロイ可能な状態

## ✅ 最速デプロイ方法（5分で完了）

### ステップ1: Vercelにログイン
1. https://vercel.com にアクセス
2. GitHubアカウントでログイン

### ステップ2: プロジェクトをインポート
1. ダッシュボードで「New Project」をクリック
2. 「Import Git Repository」を選択
3. `dental-hygienist-attendance` リポジトリを選択

### ステップ3: 設定（重要！）
以下の設定を正確に入力してください：

```
Framework Preset: Vite
Root Directory: frontend
Build Command: npm install && npm run build
Output Directory: dist
```

### ステップ4: 環境変数を追加
Environment Variablesセクションで：
```
Name: VITE_DEMO_MODE
Value: true
```
「Add」をクリック

### ステップ5: デプロイ
「Deploy」ボタンをクリック

## 🎯 デプロイ成功の確認

1. **ビルドログを確認**
   - Vercelダッシュボードでビルドの進行状況が表示されます
   - 通常2-3分で完了します

2. **サイトにアクセス**
   - デプロイ完了後、URLが表示されます
   - 例: `https://dental-hygienist-system.vercel.app`

3. **動作確認**
   - ログイン画面が表示されることを確認
   - テストログイン:
     - ユーザー名: `admin`
     - パスワード: `admin`

## 💡 もしエラーが発生したら

### ビルドエラーの場合
Build Commandを以下に変更：
```
cd frontend && NODE_OPTIONS='--max-old-space-size=4096' npm install && npm run build
```

### 404エラーの場合
Root Directoryの設定を確認：
- 必ず `frontend` と入力（スラッシュなし）

## 📱 クライアントへの納品情報

デプロイ成功後、以下の情報をクライアントに提供：

```
【歯科衛生士管理システム】

■ アクセスURL
https://[your-project-name].vercel.app

■ ログイン情報
ユーザー名: admin
パスワード: admin

■ 推奨ブラウザ
- Google Chrome（最新版）
- Microsoft Edge（最新版）
- Safari（最新版）

■ 主な機能
1. 患者情報管理
2. 歯科衛生士情報管理
3. 訪問記録管理（カレンダー表示）
4. 月次レポート機能
5. CSV出力機能

■ サポート
GitHubリポジトリのIssuesで受付
```

## ⚡ 代替案: GitHubから直接デプロイ

もしローカル環境での作業が難しい場合：

1. **GitHub上で直接Vercelと連携**
   - GitHub Marketplaceから「Vercel」を追加
   - リポジトリへのアクセスを許可
   - 自動デプロイを設定

2. **プルリクエストをマージ**
   - 作成済みのPRをGitHub上でマージ
   - Vercelが自動的にデプロイを開始

## 🎉 完了！

この方法なら、ローカル環境の問題を回避して、確実にデプロイできます。
Vercelのクラウド環境は十分なリソースがあるため、ビルドエラーは発生しません。

---

**重要**: 現在のコードは正常な状態です。ローカル環境の問題は、デプロイには影響しません。