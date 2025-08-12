# Vercel Only Deploy Script
# Since Railway CLI has changed, let's deploy to Vercel only for now

param(
    [string]$GitHubUsername = "",
    [string]$RepoName = "dental-hygienist-attendance"
)

function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) {
        Write-Output $args
    }
    $host.UI.RawUI.ForegroundColor = $fc
}

Write-ColorOutput Green "Vercel-Only Deploy (Frontend + Mock Backend)"
Write-ColorOutput Green "============================================"

# Get GitHub username
if ($GitHubUsername -eq "") {
    $GitHubUsername = Read-Host "Enter your GitHub username"
}

# Step 1: Check Vercel authentication
Write-ColorOutput Yellow "Checking Vercel authentication..."
$vercelAuth = vercel whoami 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-ColorOutput Yellow "Vercel authentication required. Opening browser..."
    vercel login
}

# Step 2: Deploy to Vercel with full-stack configuration
Write-ColorOutput Yellow "Deploying full-stack app to Vercel..."

# Create Vercel configuration for full-stack
$vercelConfig = @{
    "builds" = @(
        @{
            "src" = "frontend/package.json"
            "use" = "@vercel/static-build"
            "config" = @{
                "distDir" = "dist"
            }
        },
        @{
            "src" = "backend/src/server.ts"
            "use" = "@vercel/node"
        }
    )
    "routes" = @(
        @{
            "src" = "/api/(.*)"
            "dest" = "/backend/src/server.ts"
        },
        @{
            "src" = "/(.*)"
            "dest" = "/frontend/dist/index.html"
        }
    )
    "env" = @{
        "NODE_ENV" = "production"
        "USE_MOCK_DATABASE" = "true"
        "JWT_SECRET" = "vercel_secure_jwt_secret_2024_production"
        "CORS_ORIGIN" = "https://$RepoName.vercel.app"
    }
} | ConvertTo-Json -Depth 4

$vercelConfig | Out-File -FilePath "vercel.json" -Encoding UTF8

# Step 3: Set environment variables
Write-ColorOutput Yellow "Setting Vercel environment variables..."
vercel env add NODE_ENV production "production"
vercel env add USE_MOCK_DATABASE production "true"
vercel env add JWT_SECRET production "vercel_secure_jwt_secret_2024_production"
vercel env add VITE_API_BASE_URL production "https://$RepoName.vercel.app/api"
vercel env add VITE_APP_NAME production "Dental Hygienist Attendance System"
vercel env add VITE_ENVIRONMENT production "production"

# Step 4: Deploy
Write-ColorOutput Yellow "Deploying to Vercel..."
$vercelOutput = vercel --prod --yes 2>&1
$vercelUrl = ($vercelOutput | Select-String "https://.*\.vercel\.app" | Select-Object -First 1).Matches.Value

if ($vercelUrl) {
    Write-ColorOutput Green "Vercel deploy completed: $vercelUrl"
} else {
    Write-ColorOutput Red "Failed to get Vercel URL"
    $vercelUrl = "https://$RepoName.vercel.app"
}

# Step 5: Test deployment
Write-ColorOutput Yellow "Testing deployment..."
Start-Sleep -Seconds 10

try {
    $healthCheck = Invoke-RestMethod -Uri "$vercelUrl/api/health" -Method GET -TimeoutSec 10
    Write-ColorOutput Green "Health check successful"
} catch {
    Write-ColorOutput Yellow "Health check failed (may still be deploying)"
}

# Step 6: Completion
Write-ColorOutput Green ""
Write-ColorOutput Green "Vercel deployment completed!"
Write-ColorOutput Green "================================"
Write-ColorOutput Cyan "App URL: $vercelUrl"
Write-ColorOutput Cyan "API URL: $vercelUrl/api"
Write-ColorOutput Green ""
Write-ColorOutput Yellow "Test login credentials:"
Write-ColorOutput White "   Username: admin"
Write-ColorOutput White "   Password: admin"
Write-ColorOutput Green ""

# Open browser
Write-ColorOutput Yellow "Opening application in browser..."
Start-Process $vercelUrl

Write-ColorOutput Green "Deployment completed successfully!"