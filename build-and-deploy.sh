#!/bin/bash

echo "🚀 歯科衛生士管理システムのデプロイ準備を開始します..."

# 1. フロントエンドのビルド
echo "📦 フロントエンドをビルド中..."
cd frontend
npm install --production=false
NODE_OPTIONS='--max-old-space-size=2048' npm run build

if [ -d "dist" ]; then
    echo "✅ フロントエンドのビルドが完了しました"
    ls -la dist/
else
    echo "❌ フロントエンドのビルドに失敗しました"
    exit 1
fi

cd ..

echo "🎉 ビルドプロセスが完了しました！"
echo ""
echo "📋 次のステップ:"
echo "1. Vercelにフロントエンドをデプロイ"
echo "   - https://vercel.com/new でプロジェクトをインポート"
echo "   - リポジトリ: dental-hygienist-attendance"
echo "   - Root Directory: frontend"
echo "   - Framework: Vite"
echo ""
echo "2. 環境変数の設定"
echo "   - VITE_DEMO_MODE = true"
echo ""
echo "準備が整いました！"