#!/bin/bash
# ==============================================
# Recovery Journey Deployment Script
# ==============================================
# Usage: ./scripts/deploy.sh [staging|production] [options]
# ==============================================

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Default values
ENVIRONMENT="${1:-staging}"
DRY_RUN=false
SKIP_TESTS=false
SKIP_MIGRATIONS=false
FORCE=false

# Parse arguments
shift || true
while [[ $# -gt 0 ]]; do
    case $1 in
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --skip-tests)
            SKIP_TESTS=true
            shift
            ;;
        --skip-migrations)
            SKIP_MIGRATIONS=true
            shift
            ;;
        --force)
            FORCE=true
            shift
            ;;
        -h|--help)
            echo "Usage: $0 [staging|production] [options]"
            echo ""
            echo "Options:"
            echo "  --dry-run          Show what would be done without executing"
            echo "  --skip-tests       Skip running tests before deployment"
            echo "  --skip-migrations  Skip database migrations"
            echo "  --force            Force deployment without confirmation"
            echo "  -h, --help         Show this help message"
            exit 0
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            exit 1
            ;;
    esac
done

# Validate environment
if [[ "$ENVIRONMENT" != "staging" && "$ENVIRONMENT" != "production" ]]; then
    echo -e "${RED}Invalid environment: $ENVIRONMENT${NC}"
    echo "Valid environments: staging, production"
    exit 1
fi

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

run_command() {
    if [[ "$DRY_RUN" == "true" ]]; then
        echo -e "${YELLOW}[DRY-RUN]${NC} Would execute: $*"
    else
        "$@"
    fi
}

# Trap to alert on deployment failure
on_deploy_failure() {
    local exit_code=$?
    if [[ $exit_code -ne 0 ]]; then
        log_error "Deployment to $ENVIRONMENT FAILED with exit code $exit_code"
        log_error "Consider running: ./scripts/rollback.sh $ENVIRONMENT"
    fi
}
trap on_deploy_failure EXIT

confirm_action() {
    if [[ "$FORCE" == "true" ]]; then
        return 0
    fi

    local message="$1"
    echo -e "${YELLOW}$message${NC}"
    read -p "Continue? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_info "Deployment cancelled"
        exit 0
    fi
}

check_prerequisites() {
    log_info "Checking prerequisites..."

    # Check required tools
    local missing_tools=()

    for tool in docker docker-compose git node npm; do
        if ! command -v "$tool" &> /dev/null; then
            missing_tools+=("$tool")
        fi
    done

    if [[ ${#missing_tools[@]} -gt 0 ]]; then
        log_error "Missing required tools: ${missing_tools[*]}"
        exit 1
    fi

    # Check if we're on the correct branch
    local current_branch
    current_branch=$(git rev-parse --abbrev-ref HEAD)

    if [[ "$ENVIRONMENT" == "production" && "$current_branch" != "main" ]]; then
        log_warning "Production deployments should be from 'main' branch"
        log_warning "Current branch: $current_branch"
        confirm_action "Deploy from non-main branch?"
    fi

    # Check for uncommitted changes
    if [[ -n $(git status --porcelain) ]]; then
        log_warning "You have uncommitted changes"
        confirm_action "Deploy with uncommitted changes?"
    fi

    log_success "Prerequisites check passed"
}

run_tests() {
    if [[ "$SKIP_TESTS" == "true" ]]; then
        log_warning "Skipping tests (--skip-tests flag set)"
        return 0
    fi

    log_info "Running tests..."

    cd "$PROJECT_ROOT/Backend"
    run_command npm test

    log_success "All tests passed"
}

build_images() {
    log_info "Building Docker images..."

    local version
    version=$(git describe --tags --always --dirty)

    cd "$PROJECT_ROOT"

    run_command docker build \
        -t "recovery-journey-backend:$version" \
        -t "recovery-journey-backend:$ENVIRONMENT" \
        --build-arg VERSION="$version" \
        -f Backend/Dockerfile \
        Backend/

    log_success "Docker images built successfully"
}

run_migrations() {
    if [[ "$SKIP_MIGRATIONS" == "true" ]]; then
        log_warning "Skipping migrations (--skip-migrations flag set)"
        return 0
    fi

    log_info "Running database migrations..."

    cd "$PROJECT_ROOT/Backend"
    run_command npx prisma migrate deploy

    log_success "Migrations completed"
}

deploy_backend() {
    log_info "Deploying backend to $ENVIRONMENT..."

    local compose_file="docker-compose.yml"
    if [[ "$ENVIRONMENT" == "production" ]]; then
        compose_file="docker-compose.prod.yml"
    fi

    cd "$PROJECT_ROOT"

    # Pull latest images
    run_command docker-compose -f "$compose_file" pull backend

    # Deploy with zero downtime (if supported)
    run_command docker-compose -f "$compose_file" up -d --no-deps --scale backend=2 backend

    # Wait for new container health check before removing old one
    log_info "Waiting for new container to become healthy..."
    local health_attempts=0
    local max_health_attempts=12
    while [[ $health_attempts -lt $max_health_attempts ]]; do
        if docker-compose -f "$compose_file" ps backend | grep -q "(healthy)" 2>/dev/null; then
            break
        fi
        sleep 5
        ((health_attempts++))
        log_info "Waiting for healthy status... ($health_attempts/$max_health_attempts)"
    done

    if [[ $health_attempts -ge $max_health_attempts ]]; then
        log_error "New container did not become healthy. Rolling back scale."
        run_command docker-compose -f "$compose_file" up -d --no-deps --scale backend=1 backend
        return 1
    fi

    # Scale back to 1 (remove old container)
    run_command docker-compose -f "$compose_file" up -d --no-deps --scale backend=1 backend

    log_success "Backend deployed successfully"
}

verify_deployment() {
    log_info "Verifying deployment..."

    local health_url
    if [[ "$ENVIRONMENT" == "staging" ]]; then
        health_url="https://staging-api.recoveryjourney.app/health"
    else
        health_url="https://api.recoveryjourney.app/health"
    fi

    if [[ "$DRY_RUN" == "true" ]]; then
        echo -e "${YELLOW}[DRY-RUN]${NC} Would verify: $health_url"
        return 0
    fi

    local max_attempts=30
    local attempt=1

    while [[ $attempt -le $max_attempts ]]; do
        if curl -sf "$health_url" > /dev/null 2>&1; then
            log_success "Health check passed!"
            return 0
        fi

        log_info "Health check attempt $attempt/$max_attempts..."
        sleep 5
        ((attempt++))
    done

    log_error "Health check failed after $max_attempts attempts"
    return 1
}

cleanup() {
    log_info "Cleaning up old images..."

    run_command docker image prune -f --filter "label=app=recovery-journey" --filter "until=168h"

    log_success "Cleanup completed"
}

# Main deployment flow
main() {
    echo ""
    echo "=========================================="
    echo "  Recovery Journey Deployment"
    echo "  Environment: $ENVIRONMENT"
    echo "=========================================="
    echo ""

    if [[ "$ENVIRONMENT" == "production" ]]; then
        confirm_action "⚠️  You are about to deploy to PRODUCTION!"
    fi

    check_prerequisites
    run_tests
    build_images
    run_migrations
    deploy_backend
    verify_deployment
    cleanup

    echo ""
    log_success "🚀 Deployment to $ENVIRONMENT completed successfully!"
    echo ""
}

# Run main function
main
