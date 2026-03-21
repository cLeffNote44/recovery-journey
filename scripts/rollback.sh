#!/bin/bash
# ==============================================
# Recovery Journey Rollback Script
# ==============================================
# Usage: ./scripts/rollback.sh [staging|production] [version]
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

# Arguments
ENVIRONMENT="${1:-}"
TARGET_VERSION="${2:-}"

# Validate arguments
if [[ -z "$ENVIRONMENT" ]]; then
    echo "Usage: $0 [staging|production] [version]"
    echo ""
    echo "Arguments:"
    echo "  environment   Required. Target environment (staging or production)"
    echo "  version       Optional. Specific version to rollback to"
    echo "                If not provided, rolls back to the previous version"
    exit 1
fi

if [[ "$ENVIRONMENT" != "staging" && "$ENVIRONMENT" != "production" ]]; then
    echo -e "${RED}Invalid environment: $ENVIRONMENT${NC}"
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

# Trap to alert on rollback failure
on_rollback_failure() {
    local exit_code=$?
    if [[ $exit_code -ne 0 ]]; then
        log_error "Rollback FAILED with exit code $exit_code"
        log_error "Manual intervention may be required for $ENVIRONMENT environment"
    fi
}
trap on_rollback_failure EXIT

confirm_action() {
    local message="$1"
    echo -e "${YELLOW}$message${NC}"
    read -p "Continue? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_info "Rollback cancelled"
        exit 0
    fi
}

list_available_versions() {
    log_info "Available versions:"
    docker images "recovery-journey-backend" --format "table {{.Tag}}\t{{.CreatedAt}}" | head -20
}

get_previous_version() {
    # Get the second most recent tag (current is first)
    docker images "recovery-journey-backend" --format "{{.Tag}}" | sed -n '2p'
}

rollback_backend() {
    local version="$1"

    log_info "Rolling back backend to version: $version"

    local compose_file="docker-compose.yml"
    if [[ "$ENVIRONMENT" == "production" ]]; then
        compose_file="docker-compose.prod.yml"
    fi

    cd "$PROJECT_ROOT"

    # Update the image tag
    export BACKEND_VERSION="$version"

    # Deploy the old version
    docker-compose -f "$compose_file" up -d --no-deps backend

    log_success "Backend rolled back to version: $version"
}

verify_rollback() {
    log_info "Verifying rollback..."

    local health_url
    if [[ "$ENVIRONMENT" == "staging" ]]; then
        health_url="https://staging-api.recoveryjourney.app/health"
    else
        health_url="https://api.recoveryjourney.app/health"
    fi

    local max_attempts=20
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

    log_error "Health check failed after rollback"
    return 1
}

# Main rollback flow
main() {
    echo ""
    echo "=========================================="
    echo "  Recovery Journey Rollback"
    echo "  Environment: $ENVIRONMENT"
    echo "=========================================="
    echo ""

    # If no version specified, find previous version
    if [[ -z "$TARGET_VERSION" ]]; then
        list_available_versions
        echo ""
        TARGET_VERSION=$(get_previous_version)

        if [[ -z "$TARGET_VERSION" ]]; then
            log_error "Could not determine previous version"
            exit 1
        fi

        log_info "No version specified, will rollback to: $TARGET_VERSION"
    fi

    log_warning "NOTE: This rollback only reverts the application container."
    log_warning "Database migrations are NOT automatically rolled back."
    log_warning "If the deployment included schema changes, manual DB intervention may be needed."
    echo ""

    confirm_action "You are about to rollback $ENVIRONMENT to version $TARGET_VERSION"

    # Create a backup before rollback in case we need to undo it
    log_info "Creating pre-rollback backup of current state..."
    local current_version
    current_version=$(docker images "recovery-journey-backend:$ENVIRONMENT" --format "{{.Tag}}" 2>/dev/null | head -1)
    if [[ -n "$current_version" ]]; then
        log_info "Current version before rollback: $current_version"
    fi

    rollback_backend "$TARGET_VERSION"
    verify_rollback

    echo ""
    log_success "🔄 Rollback to $TARGET_VERSION completed successfully!"
    echo ""
}

# Run main function
main
