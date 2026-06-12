#!/bin/bash
# ==============================================
# Recovery Journey Rollback Script
# ==============================================
# Usage: ./scripts/rollback.sh [staging|production] [version]
#
# Rolls the backend container back to a previously deployed image tag.
# Deploys record their tag in .deployed_version / .deployed_version.previous
# (written by scripts/deploy.sh and the CD pipeline), so rollback without
# an explicit version targets the previous deploy.
#
# NOTE: database migrations are NOT rolled back automatically.
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

# Must match the image name used by deploy.sh and the CD pipeline
BACKEND_IMAGE="${BACKEND_IMAGE:-ghcr.io/cleffnote44/recovery-journey/backend}"

# docker-compose.prod.yml is an override and must be combined with the base
COMPOSE_FILES=(-f docker-compose.yml -f docker-compose.prod.yml)

# Arguments
ENVIRONMENT="${1:-}"
TARGET_VERSION="${2:-}"

# Validate arguments
if [[ -z "$ENVIRONMENT" ]]; then
    echo "Usage: $0 [staging|production] [version]"
    echo ""
    echo "Arguments:"
    echo "  environment   Required. Target environment (staging or production)"
    echo "  version       Optional. Specific image tag to roll back to"
    echo "                If not provided, rolls back to the previous deploy"
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

# Compose command detection: prefer the v2 plugin, fall back to standalone —
# but only v2: docker-compose.prod.yml uses the `!reset` tag, which Compose
# v1 cannot parse (it would fail or silently misbehave).
COMPOSE_CMD=()
detect_compose() {
    if docker compose version &> /dev/null; then
        COMPOSE_CMD=(docker compose)
    elif command -v docker-compose &> /dev/null; then
        local cv
        cv=$(docker-compose version --short 2>/dev/null || echo "0")
        if [[ "$cv" == 1* || "$cv" == v1* || "$cv" == "0" ]]; then
            log_error "docker-compose v1 detected ($cv) — Compose v2.24.4+ is required (the prod override uses !reset)"
            exit 1
        fi
        COMPOSE_CMD=(docker-compose)
    else
        log_error "Neither 'docker compose' nor 'docker-compose' is available"
        exit 1
    fi
}

compose() {
    "${COMPOSE_CMD[@]}" "${COMPOSE_FILES[@]}" "$@"
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
    log_info "Locally available image tags for $BACKEND_IMAGE:"
    docker images "$BACKEND_IMAGE" --format "table {{.Tag}}\t{{.CreatedAt}}" | head -20
}

get_previous_version() {
    # Preferred source: the version file maintained by deploys
    if [[ -f "$PROJECT_ROOT/.deployed_version.previous" ]]; then
        cat "$PROJECT_ROOT/.deployed_version.previous"
        return 0
    fi

    # Fallback: second most recent local image tag (current is first).
    # Exclude the environment alias tags, which always point at the
    # currently deployed image.
    docker images "$BACKEND_IMAGE" --format "{{.Tag}}" \
        | grep -vE '^(staging|production|latest)$' \
        | sed -n '2p'
}

ensure_image_available() {
    local version="$1"

    if docker image inspect "$BACKEND_IMAGE:$version" &> /dev/null; then
        return 0
    fi

    log_info "Image $BACKEND_IMAGE:$version not found locally, pulling..."
    if ! docker pull "$BACKEND_IMAGE:$version"; then
        log_error "Image $BACKEND_IMAGE:$version is not available locally or in the registry"
        exit 1
    fi
}

rollback_backend() {
    local version="$1"

    log_info "Rolling back backend to image tag: $version"

    cd "$PROJECT_ROOT"

    ensure_image_available "$version"

    # The compose override resolves the backend image from this variable
    export BACKEND_IMAGE_TAG="$version"

    compose up -d --no-build --no-deps backend

    log_success "Backend rolled back to: $BACKEND_IMAGE:$version"
}

verify_rollback() {
    log_info "Verifying rollback..."

    local health_url="http://localhost:${BACKEND_PORT:-8000}/health"
    local max_attempts=20
    local attempt=1

    while [[ $attempt -le $max_attempts ]]; do
        if curl -sf "$health_url" > /dev/null 2>&1; then
            log_success "Health check passed!"
            return 0
        fi

        log_info "Health check attempt $attempt/$max_attempts..."
        sleep 5
        attempt=$((attempt + 1))
    done

    log_error "Health check failed after rollback"
    return 1
}

record_deployed_version() {
    local version="$1"

    cd "$PROJECT_ROOT"
    if [[ -f .deployed_version ]]; then
        cp .deployed_version .deployed_version.previous
    fi
    echo "$version" > .deployed_version
}

# Main rollback flow
main() {
    echo ""
    echo "=========================================="
    echo "  Recovery Journey Rollback"
    echo "  Environment: $ENVIRONMENT"
    echo "=========================================="
    echo ""

    detect_compose

    # If no version specified, find previous version
    if [[ -z "$TARGET_VERSION" ]]; then
        list_available_versions
        echo ""
        TARGET_VERSION=$(get_previous_version)

        if [[ -z "$TARGET_VERSION" ]]; then
            log_error "Could not determine previous version"
            log_error "Specify one explicitly: $0 $ENVIRONMENT <version>"
            exit 1
        fi

        log_info "No version specified, will rollback to: $TARGET_VERSION"
    fi

    local current_version
    current_version=$(cat "$PROJECT_ROOT/.deployed_version" 2>/dev/null || echo "unknown")
    log_info "Currently deployed version: $current_version"

    log_warning "NOTE: This rollback only reverts the application container."
    log_warning "Database migrations are NOT automatically rolled back."
    log_warning "If the deployment included schema changes, manual DB intervention may be needed."
    echo ""

    confirm_action "You are about to rollback $ENVIRONMENT to version $TARGET_VERSION"

    rollback_backend "$TARGET_VERSION"
    verify_rollback
    record_deployed_version "$TARGET_VERSION"

    echo ""
    log_success "🔄 Rollback to $TARGET_VERSION completed successfully!"
    echo ""
}

# Run main function
main
