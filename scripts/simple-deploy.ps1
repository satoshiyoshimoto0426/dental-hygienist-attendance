# Simple Deployment Script (No Docker Required)
# 歯科衛生士勤怠システム - 簡単デプロイ

Write-Host "🚀 歯科衛生士勤怠システム - 簡単デプロイ開始" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green

# Step 1: バックエンドの起動
Write-Host "📦 バックエンドを起動中..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; Copy-Item .env.dev .env -Force; npm run dev" -WindowStyle Normal

# Wait for backend to start
Write-Host "⏳ バックエンドの起動を待機中（5秒）..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Step 2: フロントエンドの起動
Write-Host "🌐 フロントエンドを起動中..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; Copy-Item .env.dev .env -Force; npm run dev" -WindowStyle Normal

# Wait for frontend to start
Write-Host "⏳ フロントエンドの起動を待機中（10秒）..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Step 3: ブラウザでアプリケーションを開く
Write-Host "🌍 ブラウザでアプリケーションを開いています..." -ForegroundColor Yellow
Start-Process "http://localhost:3000"

Write-Host ""
Write-Host "✅ デプロイ完了！" -ForegroundColor Green
Write-Host "📱 フロントエンド: http://localhost:3000" -ForegroundColor Cyan
Write-Host "🔧 バックエンドAPI: http://localhost:3001/api" -ForegroundColor Cyan
Write-Host ""
Write-Host "📝 テスト用ログイン情報:" -ForegroundColor Yellow
Write-Host "   ユーザー名: admin" -ForegroundColor White
Write-Host "   パスワード: admin" -ForegroundColor White
Write-Host ""
Write-Host "🛑 停止するには、両方のPowerShellウィンドウでCtrl+Cを押してください" -ForegroundColor Red