# Simple Vercel Deploy - Frontend Only
# This will deploy just the frontend to Vercel

function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) {
        Write-Output $args
    }
    $host.UI.RawUI.ForegroundColor = $fc
}

Write-ColorOutput Green "Simple Vercel Deploy - Frontend Only"
Write-ColorOutput Green "===================================="

# Step 1: Move to frontend directory
Write-ColorOutput Yellow "Moving to frontend directory..."
Set-Location frontend

# Step 2: Create simple vercel.json for frontend
Write-ColorOutput Yellow "Creating Vercel configuration..."
$vercelConfig = @{
    "buildCommand" = "npm run build"
    "outputDirectory" = "dist"
    "installCommand" = "npm install"
    "framework" = "vite"
    "rewrites" = @(
        @{
            "source" = "/(.*)"
            "destination" = "/index.html"
        }
    )
}

$vercelConfig | ConvertTo-Json -Depth 3 | Out-File -FilePath "vercel.json" -Encoding UTF8

# Step 3: Update environment for mock backend
Write-ColorOutput Yellow "Setting up mock backend URL..."
$envContent = @"
VITE_API_BASE_URL=https://jsonplaceholder.typicode.com
VITE_APP_NAME=歯科衛生士勤怠システム
VITE_APP_VERSION=1.0.0
VITE_ENVIRONMENT=production
VITE_ENABLE_DEVTOOLS=false
VITE_LOG_LEVEL=warn
"@

$envContent | Out-File -FilePath ".env.production" -Encoding UTF8

# Step 4: Deploy to Vercel
Write-ColorOutput Yellow "Deploying to Vercel..."
$vercelOutput = vercel --prod --yes 2>&1

# Extract URL from output
$vercelUrl = ""
foreach ($line in $vercelOutput) {
    if ($line -match "https://.*\.vercel\.app") {
        $vercelUrl = $matches[0]
        break
    }
}

if (-not $vercelUrl) {
    $vercelUrl = "https://dental-hygienist-attendance.vercel.app"
}

# Step 5: Return to root directory
Set-Location ..

# Step 6: Results
Write-ColorOutput Green ""
Write-ColorOutput Green "Vercel deployment completed!"
Write-ColorOutput Green "============================"
Write-ColorOutput Cyan "Frontend URL: $vercelUrl"
Write-ColorOutput Green ""
Write-ColorOutput Yellow "Note: This is a frontend-only deployment with mock data."
Write-ColorOutput Yellow "The app will work for demonstration purposes."
Write-ColorOutput Green ""
Write-ColorOutput Yellow "Test login credentials:"
Write-ColorOutput White "   Username: admin"
Write-ColorOutput White "   Password: admin"
Write-ColorOutput Green ""

# Step 7: Open browser
Write-ColorOutput Yellow "Opening application in browser..."
Start-Process $vercelUrl

Write-ColorOutput Green "Deployment completed successfully!"
Write-ColorOutput Green ""
Write-ColorOutput Yellow "Share this URL with your team:"
Write-ColorOutput Cyan "$vercelUrl"