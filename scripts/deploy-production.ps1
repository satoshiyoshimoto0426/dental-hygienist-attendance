# Production Deployment Script for Dental Hygienist Attendance System (PowerShell)
# This script handles the deployment of the application to production environment

param(
    [switch]$SkipBackup = $false,
    [switch]$SkipHealthCheck = $false
)

# Configuration
$ComposeFile = "docker-compose.prod.yml"
$EnvFile = ".env.production"
$BackupDir = "./backups/$(Get-Date -Format 'yyyyMMdd_HHmmss')"

# Function to print colored output
function Write-Status {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Check if required files exist
function Test-Requirements {
    Write-Status "Checking deployment requirements..."
    
    if (-not (Test-Path $EnvFile)) {
        Write-Error "Environment file $EnvFile not found!"
        exit 1
    }
    
    if (-not (Test-Path $ComposeFile)) {
        Write-Error "Docker compose file $ComposeFile not found!"
        exit 1
    }
    
    # Check if Docker is running
    try {
        docker info | Out-Null
    }
    catch {
        Write-Error "Docker is not running!"
        exit 1
    }
    
    # Check if Docker Compose is available
    try {
        docker-compose --version | Out-Null
    }
    catch {
        Write-Error "Docker Compose is not installed!"
        exit 1
    }
    
    Write-Status "Requirements check passed ✓"
}

# Backup existing data
function Backup-Data {
    if ($SkipBackup) {
        Write-Warning "Skipping backup as requested"
        return
    }
    
    Write-Status "Creating backup..."
    
    New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
    
    # Backup database if container is running
    $dbStatus = docker-compose -f $ComposeFile ps database
    if ($dbStatus -match "Up") {
        Write-Status "Backing up database..."
        docker-compose -f $ComposeFile exec -T database pg_dump -U dental_hygienist_user dental_hygienist_prod | Out-File -FilePath "$BackupDir/database_backup.sql" -Encoding UTF8
        Write-Status "Database backup created: $BackupDir/database_backup.sql"
    }
    else {
        Write-Warning "Database container not running, skipping database backup"
    }
    
    # Backup environment files
    Copy-Item $EnvFile $BackupDir -ErrorAction SilentlyContinue
    Copy-Item "backend/.env.production" $BackupDir -ErrorAction SilentlyContinue
    Copy-Item "frontend/.env.production" $BackupDir -ErrorAction SilentlyContinue
    
    Write-Status "Backup completed ✓"
}

# Build and deploy
function Deploy-Application {
    Write-Status "Building and deploying application..."
    
    # Pull latest images and build
    docker-compose -f $ComposeFile pull
    docker-compose -f $ComposeFile build --no-cache
    
    # Stop existing containers
    Write-Status "Stopping existing containers..."
    docker-compose -f $ComposeFile down
    
    # Start new containers
    Write-Status "Starting new containers..."
    docker-compose -f $ComposeFile up -d
    
    Write-Status "Deployment completed ✓"
}

# Health check
function Test-Health {
    if ($SkipHealthCheck) {
        Write-Warning "Skipping health check as requested"
        return $true
    }
    
    Write-Status "Performing health checks..."
    
    # Wait for services to start
    Start-Sleep -Seconds 30
    
    # Check database health
    try {
        docker-compose -f $ComposeFile exec -T database pg_isready -U dental_hygienist_user -d dental_hygienist_prod | Out-Null
        Write-Status "Database health check passed ✓"
    }
    catch {
        Write-Error "Database health check failed!"
        return $false
    }
    
    # Check backend health
    try {
        Invoke-WebRequest -Uri "http://localhost:3001/api/health" -UseBasicParsing | Out-Null
        Write-Status "Backend health check passed ✓"
    }
    catch {
        Write-Error "Backend health check failed!"
        return $false
    }
    
    # Check frontend health
    try {
        Invoke-WebRequest -Uri "http://localhost/health" -UseBasicParsing | Out-Null
        Write-Status "Frontend health check passed ✓"
    }
    catch {
        Write-Error "Frontend health check failed!"
        return $false
    }
    
    Write-Status "All health checks passed ✓"
    return $true
}

# Rollback function
function Invoke-Rollback {
    Write-Warning "Rolling back to previous version..."
    
    # Stop current containers
    docker-compose -f $ComposeFile down
    
    # Restore database from backup if available
    if (Test-Path "$BackupDir/database_backup.sql") {
        Write-Status "Restoring database from backup..."
        docker-compose -f $ComposeFile up -d database
        Start-Sleep -Seconds 10
        Get-Content "$BackupDir/database_backup.sql" | docker-compose -f $ComposeFile exec -T database psql -U dental_hygienist_user -d dental_hygienist_prod
    }
    
    Write-Warning "Rollback completed"
}

# Main deployment process
function Main {
    Write-Status "=== Production Deployment Started ==="
    
    try {
        Test-Requirements
        Backup-Data
        Deploy-Application
        
        # Health check with retry
        if (-not (Test-Health)) {
            Write-Error "Health checks failed, rolling back..."
            Invoke-Rollback
            exit 1
        }
        
        Write-Status "=== Production Deployment Completed Successfully ==="
        Write-Status "Application is now running at:"
        Write-Status "  Frontend: http://localhost"
        Write-Status "  Backend API: http://localhost:3001/api"
        Write-Status ""
        Write-Status "Backup created at: $BackupDir"
        Write-Status ""
        Write-Warning "Please verify the application is working correctly and monitor logs for any issues."
    }
    catch {
        Write-Error "Deployment failed! Rolling back..."
        Invoke-Rollback
        exit 1
    }
}

# Run main function
Main