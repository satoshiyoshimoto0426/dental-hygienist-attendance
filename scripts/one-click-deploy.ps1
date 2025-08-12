# One-Click Auto Deploy
# Dental Hygienist Attendance System - Complete Automation

param(
    [string]$GitHubUsername = ""
)

function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) {
        Write-Output $args
    }
    $host.UI.RawUI.ForegroundColor = $fc
}

Write-ColorOutput Green "Dental Hygienist Attendance System - One-Click Auto Deploy"
Write-ColorOutput Green "========================================================="

# Get GitHub username
if ($GitHubUsername -eq "") {
    $GitHubUsername = Read-Host "Enter your GitHub username"
}

Write-ColorOutput Yellow "Deploy steps:"
Write-ColorOutput White "  1. Install required CLI tools"
Write-ColorOutput White "  2. Create GitHub repository"
Write-ColorOutput White "  3. Auto deploy to Railway (backend)"
Write-ColorOutput White "  4. Auto deploy to Vercel (frontend)"
Write-ColorOutput White "  5. Optimize configuration"
Write-ColorOutput White "  6. Verify operation"
Write-ColorOutput Green ""

$confirm = Read-Host "Continue? (y/N)"
if ($confirm -ne "y" -and $confirm -ne "Y") {
    Write-ColorOutput Red "Deploy cancelled"
    exit 0
}

# Step 1: Install CLI tools
Write-ColorOutput Yellow "Step 1: Installing required CLI tools..."
& ".\scripts\install-cli-tools.ps1"

if ($LASTEXITCODE -ne 0) {
    Write-ColorOutput Red "CLI tools installation failed"
    exit 1
}

# Step 2: Execute auto deploy
Write-ColorOutput Yellow "Step 2: Starting auto deploy..."
& ".\scripts\auto-deploy-cloud.ps1" -GitHubUsername $GitHubUsername

if ($LASTEXITCODE -ne 0) {
    Write-ColorOutput Red "Auto deploy failed"
    exit 1
}

Write-ColorOutput Green ""
Write-ColorOutput Green "One-click deploy completed!"
Write-ColorOutput Green ""
Write-ColorOutput Yellow "Share this information with your team:"
Write-ColorOutput Cyan "   App URL: https://dental-hygienist-attendance.vercel.app"
Write-ColorOutput Cyan "   Test user: admin / admin"
Write-ColorOutput Green ""
Write-ColorOutput Yellow "Future updates can be done easily with:"
Write-ColorOutput White "   git add ."
Write-ColorOutput White "   git commit -m 'update message'"
Write-ColorOutput White "   git push"
Write-ColorOutput Green ""