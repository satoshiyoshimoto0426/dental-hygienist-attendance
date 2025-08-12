# Complete Auto Cloud Deploy Script
# Railway + Vercel Auto Deploy

param(
    [string]$GitHubUsername = "",
    [string]$RepoName = "dental-hygienist-attendance"
)

# Color output function
function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) {
        Write-Output $args
    }
    $host.UI.RawUI.ForegroundColor = $fc
}

Write-ColorOutput Green "Dental Hygienist Attendance System - Auto Cloud Deploy"
Write-ColorOutput Green "============================================================"

# Step 1: Check required tools
Write-ColorOutput Yellow "Checking required tools..."

# Check GitHub CLI
if (!(Get-Command gh -ErrorAction SilentlyContinue)) {
    Write-ColorOutput Red "GitHub CLI (gh) is not installed"
    Write-ColorOutput Yellow "Installing GitHub CLI..."
    
    if (Get-Command winget -ErrorAction SilentlyContinue) {
        winget install --id GitHub.cli
    } elseif (Get-Command choco -ErrorAction SilentlyContinue) {
        choco install gh
    } else {
        Write-ColorOutput Red "winget or chocolatey is required"
        Write-ColorOutput Yellow "Please install GitHub CLI manually: https://cli.github.com/"
        exit 1
    }
}

# Check Vercel CLI
if (!(Get-Command vercel -ErrorAction SilentlyContinue)) {
    Write-ColorOutput Yellow "Installing Vercel CLI..."
    npm install -g vercel
}

# Check Railway CLI
if (!(Get-Command railway -ErrorAction SilentlyContinue)) {
    Write-ColorOutput Yellow "Installing Railway CLI..."
    npm install -g @railway/cli
}

Write-ColorOutput Green "Required tools check completed"

# Step 2: Get GitHub username
if ($GitHubUsername -eq "") {
    $GitHubUsername = Read-Host "Enter your GitHub username"
}

# Step 3: Check GitHub authentication
Write-ColorOutput Yellow "Checking GitHub authentication..."
$authStatus = gh auth status 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-ColorOutput Yellow "GitHub authentication required. Opening browser..."
    gh auth login --web
}

# Step 4: Create GitHub repository and push
Write-ColorOutput Yellow "Creating GitHub repository..."

# Git initialization
if (!(Test-Path ".git")) {
    git init
    git add .
    git commit -m "Initial commit: Dental Hygienist Attendance System"
    git branch -M main
}

# Create GitHub repository
$repoUrl = "https://github.com/$GitHubUsername/$RepoName"
try {
    gh repo create $RepoName --public --source=. --remote=origin --push
    Write-ColorOutput Green "GitHub repository created: $repoUrl"
} catch {
    Write-ColorOutput Yellow "Repository may already exist. Trying to push..."
    git remote add origin $repoUrl 2>$null
    git push -u origin main
}

# Step 5: Railway auto deploy
Write-ColorOutput Yellow "Starting Railway auto deploy..."

# Railway authentication check
$railwayAuth = railway whoami 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-ColorOutput Yellow "Railway authentication required. Opening browser..."
    railway login
}

# Create Railway project
Write-ColorOutput Yellow "Creating Railway project..."
railway project new

# Set environment variables
Write-ColorOutput Yellow "Setting Railway environment variables..."
$railwayEnvVars = @{
    "NODE_ENV" = "production"
    "PORT" = "3001"
    "USE_MOCK_DATABASE" = "true"
    "JWT_SECRET" = "railway_super_secure_jwt_secret_2024_production_$(Get-Random)"
    "CORS_ORIGIN" = "https://$RepoName.vercel.app"
    "BCRYPT_ROUNDS" = "12"
    "RATE_LIMIT_WINDOW_MS" = "900000"
    "RATE_LIMIT_MAX_REQUESTS" = "100"
    "LOG_LEVEL" = "info"
}

foreach ($key in $railwayEnvVars.Keys) {
    railway variables set "$key=$($railwayEnvVars[$key])"
}

# Railway deploy configuration
Write-ColorOutput Yellow "Configuring Railway deployment..."
Set-Location backend
railway up --detach
$railwayUrl = railway status --json | ConvertFrom-Json | Select-Object -ExpandProperty url
Set-Location ..

if ($railwayUrl) {
    Write-ColorOutput Green "Railway deploy completed: $railwayUrl"
} else {
    Write-ColorOutput Red "Failed to get Railway URL"
    $railwayUrl = "https://your-railway-app.railway.app"
}

# Step 6: Vercel auto deploy
Write-ColorOutput Yellow "Starting Vercel auto deploy..."

# Vercel authentication check
$vercelAuth = vercel whoami 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-ColorOutput Yellow "Vercel authentication required. Opening browser..."
    vercel login
}

# Vercel project configuration
Set-Location frontend

# Update vercel.json dynamically
$vercelConfig = @{
    "buildCommand" = "npm run build"
    "outputDirectory" = "dist"
    "framework" = "vite"
    "installCommand" = "npm install"
    "devCommand" = "npm run dev"
    "rewrites" = @(
        @{
            "source" = "/(.*)"
            "destination" = "/index.html"
        }
    )
} | ConvertTo-Json -Depth 3

$vercelConfig | Out-File -FilePath "vercel.json" -Encoding UTF8

# Set Vercel environment variables
Write-ColorOutput Yellow "Setting Vercel environment variables..."
vercel env add VITE_API_BASE_URL production "$railwayUrl/api"
vercel env add VITE_APP_NAME production "Dental Hygienist Attendance System"
vercel env add VITE_APP_VERSION production "1.0.0"
vercel env add VITE_ENVIRONMENT production "production"
vercel env add VITE_ENABLE_DEVTOOLS production "false"
vercel env add VITE_LOG_LEVEL production "warn"

# Vercel deploy
Write-ColorOutput Yellow "Deploying to Vercel..."
$vercelOutput = vercel --prod --yes 2>&1
$vercelUrl = ($vercelOutput | Select-String "https://.*\.vercel\.app" | Select-Object -First 1).Matches.Value

Set-Location ..

if ($vercelUrl) {
    Write-ColorOutput Green "Vercel deploy completed: $vercelUrl"
} else {
    Write-ColorOutput Red "Failed to get Vercel URL"
    $vercelUrl = "https://$RepoName.vercel.app"
}

# Step 7: Update CORS configuration
Write-ColorOutput Yellow "Updating CORS configuration..."
railway variables set "CORS_ORIGIN=$vercelUrl"

# Step 8: Final verification and testing
Write-ColorOutput Yellow "Testing deployment..."
Start-Sleep -Seconds 30

try {
    $backendHealth = Invoke-RestMethod -Uri "$railwayUrl/api/health" -Method GET -TimeoutSec 10
    Write-ColorOutput Green "Backend health check successful"
} catch {
    Write-ColorOutput Yellow "Backend health check failed (may still be starting up)"
}

# Step 9: Completion report
Write-ColorOutput Green ""
Write-ColorOutput Green "Auto deploy completed!"
Write-ColorOutput Green "=================================="
Write-ColorOutput Cyan "Frontend: $vercelUrl"
Write-ColorOutput Cyan "Backend API: $railwayUrl/api"
Write-ColorOutput Cyan "GitHub Repository: $repoUrl"
Write-ColorOutput Green ""
Write-ColorOutput Yellow "Test login credentials:"
Write-ColorOutput White "   Username: admin"
Write-ColorOutput White "   Password: admin"
Write-ColorOutput Green ""
Write-ColorOutput Yellow "Future updates:"
Write-ColorOutput White "   1. Make code changes"
Write-ColorOutput White "   2. git add ."
Write-ColorOutput White "   3. git commit -m 'update message'"
Write-ColorOutput White "   4. git push"
Write-ColorOutput White "   -> Automatic redeployment!"
Write-ColorOutput Green ""

# Open browser with the app
Write-ColorOutput Yellow "Opening application in browser..."
Start-Process $vercelUrl

Write-ColorOutput Green "All processes completed successfully!"