# GitHub Pages Deploy Script
# Deploy to GitHub Pages for free hosting

function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) {
        Write-Output $args
    }
    $host.UI.RawUI.ForegroundColor = $fc
}

Write-ColorOutput Green "GitHub Pages Deploy"
Write-ColorOutput Green "=================="

# Step 1: Build the frontend
Write-ColorOutput Yellow "Building frontend..."
Set-Location frontend
npm run build

# Step 2: Create GitHub Pages workflow
Write-ColorOutput Yellow "Creating GitHub Actions workflow..."
Set-Location ..
New-Item -ItemType Directory -Path ".github/workflows" -Force

$workflowContent = @"
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout
      uses: actions/checkout@v3
      
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: |
        cd frontend
        npm install
        
    - name: Build
      run: |
        cd frontend
        npm run build
        
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: `${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./frontend/dist
"@

$workflowContent | Out-File -FilePath ".github/workflows/deploy.yml" -Encoding UTF8

# Step 3: Commit and push
Write-ColorOutput Yellow "Committing and pushing to GitHub..."
git add .
git commit -m "Add GitHub Pages deployment"
git push

Write-ColorOutput Green ""
Write-ColorOutput Green "GitHub Pages deployment setup completed!"
Write-ColorOutput Green "======================================="
Write-ColorOutput Yellow "Next steps:"
Write-ColorOutput White "1. Go to your GitHub repository"
Write-ColorOutput White "2. Go to Settings > Pages"
Write-ColorOutput White "3. Select 'GitHub Actions' as source"
Write-ColorOutput White "4. Your app will be available at:"
Write-ColorOutput Cyan "   https://satoshiyoshimoto0426.github.io/dental-hygienist-attendance/"
Write-ColorOutput Green ""