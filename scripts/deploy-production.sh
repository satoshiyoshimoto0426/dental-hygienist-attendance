#!/bin/bash

# Production Deployment Script for Dental Hygienist Attendance System
# This script handles the deployment of the application to production environment

set -e  # Exit on any error

echo "🚀 Starting production deployment..."

# Configuration
COMPOSE_FILE="docker-compose.prod.yml"
ENV_FILE=".env.production"
BACKUP_DIR="./backups/$(date +%Y%m%d_%H%M%S)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required files exist
check_requirements() {
    print_status "Checking deployment requirements..."
    
    if [ ! -f "$ENV_FILE" ]; then
        print_error "Environment file $ENV_FILE not found!"
        exit 1
    fi
    
    if [ ! -f "$COMPOSE_FILE" ]; then
        print_error "Docker compose file $COMPOSE_FILE not found!"
        exit 1
    fi
    
    # Check if Docker is running
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running!"
        exit 1
    fi
    
    # Check if Docker Compose is available
    if ! command -v docker-compose > /dev/null 2>&1; then
        print_error "Docker Compose is not installed!"
        exit 1
    fi
    
    print_status "Requirements check passed ✓"
}

# Backup existing data
backup_data() {
    print_status "Creating backup..."
    
    mkdir -p "$BACKUP_DIR"
    
    # Backup database if container is running
    if docker-compose -f "$COMPOSE_FILE" ps database | grep -q "Up"; then
        print_status "Backing up database..."
        docker-compose -f "$COMPOSE_FILE" exec -T database pg_dump -U dental_hygienist_user dental_hygienist_prod > "$BACKUP_DIR/database_backup.sql"
        print_status "Database backup created: $BACKUP_DIR/database_backup.sql"
    else
        print_warning "Database container not running, skipping database backup"
    fi
    
    # Backup environment files
    cp "$ENV_FILE" "$BACKUP_DIR/"
    cp "backend/.env.production" "$BACKUP_DIR/" 2>/dev/null || true
    cp "frontend/.env.production" "$BACKUP_DIR/" 2>/dev/null || true
    
    print_status "Backup completed ✓"
}

# Build and deploy
deploy() {
    print_status "Building and deploying application..."
    
    # Load environment variables
    export $(cat "$ENV_FILE" | grep -v '^#' | xargs)
    
    # Pull latest images and build
    docker-compose -f "$COMPOSE_FILE" pull
    docker-compose -f "$COMPOSE_FILE" build --no-cache
    
    # Stop existing containers
    print_status "Stopping existing containers..."
    docker-compose -f "$COMPOSE_FILE" down
    
    # Start new containers
    print_status "Starting new containers..."
    docker-compose -f "$COMPOSE_FILE" up -d
    
    print_status "Deployment completed ✓"
}

# Health check
health_check() {
    print_status "Performing health checks..."
    
    # Wait for services to start
    sleep 30
    
    # Check database health
    if docker-compose -f "$COMPOSE_FILE" exec -T database pg_isready -U dental_hygienist_user -d dental_hygienist_prod; then
        print_status "Database health check passed ✓"
    else
        print_error "Database health check failed!"
        return 1
    fi
    
    # Check backend health
    if curl -f http://localhost:3001/api/health > /dev/null 2>&1; then
        print_status "Backend health check passed ✓"
    else
        print_error "Backend health check failed!"
        return 1
    fi
    
    # Check frontend health
    if curl -f http://localhost/health > /dev/null 2>&1; then
        print_status "Frontend health check passed ✓"
    else
        print_error "Frontend health check failed!"
        return 1
    fi
    
    print_status "All health checks passed ✓"
}

# Rollback function
rollback() {
    print_warning "Rolling back to previous version..."
    
    # Stop current containers
    docker-compose -f "$COMPOSE_FILE" down
    
    # Restore database from backup if available
    if [ -f "$BACKUP_DIR/database_backup.sql" ]; then
        print_status "Restoring database from backup..."
        docker-compose -f "$COMPOSE_FILE" up -d database
        sleep 10
        docker-compose -f "$COMPOSE_FILE" exec -T database psql -U dental_hygienist_user -d dental_hygienist_prod < "$BACKUP_DIR/database_backup.sql"
    fi
    
    print_warning "Rollback completed"
}

# Main deployment process
main() {
    print_status "=== Production Deployment Started ==="
    
    # Trap errors and rollback
    trap 'print_error "Deployment failed! Rolling back..."; rollback; exit 1' ERR
    
    check_requirements
    backup_data
    deploy
    
    # Health check with retry
    if ! health_check; then
        print_error "Health checks failed, rolling back..."
        rollback
        exit 1
    fi
    
    print_status "=== Production Deployment Completed Successfully ==="
    print_status "Application is now running at:"
    print_status "  Frontend: http://localhost"
    print_status "  Backend API: http://localhost:3001/api"
    print_status ""
    print_status "Backup created at: $BACKUP_DIR"
    print_status ""
    print_warning "Please verify the application is working correctly and monitor logs for any issues."
}

# Run main function
main "$@"