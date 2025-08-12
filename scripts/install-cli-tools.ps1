# CLI Tools Auto Installer Script

function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) {
        Write-Output $args
    }
    $host.UI.RawUI.ForegroundColor = $fc
}

Write-ColorOutput Green "CLI Tools Installation Started..."
Write-ColorOutput Green "========================================"

# Check Node.js
if (!(Get-Command node -ErrorAction SilentlyContinue)) {
    Write-ColorOutput Red "Node.js is not installed"
    Write-ColorOutput Yellow "Installing Node.js..."
    if (Get-Command winget -ErrorAction SilentlyContinue) {
        winget install OpenJS.NodeJS
    } else {
        Write-ColorOutput Red "Please install Node.js manually: https://nodejs.org/"
        exit 1
    }
} else {
    Write-ColorOutput Green "Node.js is already installed"
}

# Check Git
if (!(Get-Command git -ErrorAction SilentlyContinue)) {
    Write-ColorOutput Red "Git is not installed"
    Write-ColorOutput Yellow "Installing Git..."
    if (Get-Command winget -ErrorAction SilentlyContinue) {
        winget install Git.Git
    } else {
        Write-ColorOutput Red "Please install Git manually: https://git-scm.com/"
        exit 1
    }
} else {
    Write-ColorOutput Green "Git is already installed"
}

# Check GitHub CLI
if (!(Get-Command gh -ErrorAction SilentlyContinue)) {
    Write-ColorOutput Yellow "Installing GitHub CLI..."
    if (Get-Command winget -ErrorAction SilentlyContinue) {
        winget install --id GitHub.cli
    } elseif (Get-Command choco -ErrorAction SilentlyContinue) {
        choco install gh
    } else {
        npm install -g @github/cli
    }
} else {
    Write-ColorOutput Green "GitHub CLI is already installed"
}

# Check Vercel CLI
if (!(Get-Command vercel -ErrorAction SilentlyContinue)) {
    Write-ColorOutput Yellow "Installing Vercel CLI..."
    npm install -g vercel
} else {
    Write-ColorOutput Green "Vercel CLI is already installed"
}

# Check Railway CLI
if (!(Get-Command railway -ErrorAction SilentlyContinue)) {
    Write-ColorOutput Yellow "Installing Railway CLI..."
    npm install -g @railway/cli
} else {
    Write-ColorOutput Green "Railway CLI is already installed"
}

Write-ColorOutput Green ""
Write-ColorOutput Green "All CLI tools installation completed!"
Write-ColorOutput Green ""
Write-ColorOutput Yellow "Next step:"
Write-ColorOutput White "  Run: .\scripts\auto-deploy-cloud.ps1"