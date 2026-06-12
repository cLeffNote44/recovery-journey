#!/bin/bash
# ==============================================
# Recovery Journey Deployment Script
# ==============================================
# Usage: ./scripts/deploy.sh [staging|production] [options]
#
# Intended to run ON the deployment server, from the project checkout
# (e.g. /opt/recovery-journey), with a `.env` file in the project root
# providing the required secrets (see deploy/<env>/.env.<env> templates).
#
# Deploys the backend as a tagged image so ./scripts/rollback.sh can
# swap back to any previously deployed tag.
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

# Image name must match what CI/CD pushes to the registry so locally
# built and pulled images share one tag namespace for rollback.
BACKEND_IMAGE="${BACKEND_IMAGE:-ghcr.io/cleffnote44/recovery-journey/backend}"

# Both files are always required: docker-compose.prod.yml is an override
# and cannot start the stack on its own.
COMPOSE_FILES=(-f docker-compose.yml -f docker-compose.prod.yml)

# Default values
ENVIRONMENT="${1:-staging}"
DRY_RUN=false
RUN_TESTS=false
SKIP_MIGRATIONS=false
PULL_IMAGE=false
IMAGE_TAG=""
FORCE=false

# Parse arguments
shift || true
while [[ $# -gt 0 ]]; do
    case $1 in
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --with-tests)
            RUN_TESTS=true
            shift
            ;;
        --skip-tests)
            # Retained for compatibility — tests are opt-in now
            RUN_TESTS=false
            shift
            ;;
        --skip-migrations)
            SKIP_MIGRATIONS=true
            shift
            ;;
        --pull)
            PULL_IMAGE=true
            shift
            ;;
        --image-tag)
            IMAGE_TAG="${2:?--image-tag requires a value}"
            shift 2
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
            echo "  --with-tests       Run the Backend test suite first (needs dev deps + a reachable test DB;"
            echo "                     CI is the authoritative test gate)"
            echo "  --skip-migrations  Skip database migrations"
            echo "  --pull             Pull the image from the registry instead of building"
            echo "  --image-tag TAG    Deploy a specific image tag (implies --pull)"
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

if [[ -n "$IMAGE_TAG" ]]; then
    PULL_IMAGE=true
fi

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
    run_command "${COMPOSE_CMD[@]}" "${COMPOSE_FILES[@]}" "$@"
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

    for tool in docker git node npm; do
        if ! command -v "$tool" &> /dev/null; then
            missing_tools+=("$tool")
        fi
    done

    if [[ ${#missing_tools[@]} -gt 0 ]]; then
        log_error "Missing required tools: ${missing_tools[*]}"
        exit 1
    fi

    detect_compose

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
    # Tests are opt-in: deployment servers have neither the dev toolchain
    # nor a reachable test database (the production db publishes no host
    # port). CI is the authoritative test gate.
    if [[ "$RUN_TESTS" != "true" ]]; then
        log_info "Skipping local test run (CI gates tests; pass --with-tests to run here)"
        return 0
    fi

    log_info "Running tests..."

    # vitest's default `npm test` enters watch mode and never exits;
    # test:run performs a single deterministic run.
    cd "$PROJECT_ROOT/Backend"
    run_command npm run test:run

    log_success "All tests passed"
}

prepare_image() {
    cd "$PROJECT_ROOT"

    if [[ "$PULL_IMAGE" == "true" ]]; then
        if [[ -z "$IMAGE_TAG" ]]; then
            log_error "--pull requires --image-tag (which registry tag should be deployed?)"
            exit 1
        fi
        export BACKEND_IMAGE_TAG="$IMAGE_TAG"
        log_info "Pulling image $BACKEND_IMAGE:$BACKEND_IMAGE_TAG..."
        compose pull backend
        log_success "Image pulled"
        return 0
    fi

    log_info "Building Docker image..."

    local version
    version=$(git describe --tags --always --dirty)

    # Build the production target explicitly — the development stage is
    # last in the Dockerfile and would otherwise be the default.
    run_command docker build \
        --target production \
        -t "$BACKEND_IMAGE:$version" \
        -t "$BACKEND_IMAGE:$ENVIRONMENT" \
        --build-arg VERSION="$version" \
        -f Backend/Dockerfile \
        Backend/

    export BACKEND_IMAGE_TAG="$version"

    log_success "Docker image built: $BACKEND_IMAGE:$version"
}

run_migrations() {
    if [[ "$SKIP_MIGRATIONS" == "true" ]]; then
        log_warning "Skipping migrations (--skip-migrations flag set)"
        return 0
    fi

    log_info "Running database migrations..."

    # Run inside the compose network — the production database does not
    # publish a host port, so a host-side prisma cannot reach it.
    # < /dev/null: `compose run` attaches stdin by default and would consume
    # the rest of this script if it ever runs from piped stdin.
    cd "$PROJECT_ROOT"
    compose run --rm migrate < /dev/null

    log_success "Migrations completed"
}

deploy_backend() {
    log_info "Deploying backend ($BACKEND_IMAGE:${BACKEND_IMAGE_TAG:-latest}) to $ENVIRONMENT..."

    cd "$PROJECT_ROOT"

    compose up -d --no-build --remove-orphans db backend

    if [[ "$DRY_RUN" == "true" ]]; then
        return 0
    fi

    # Wait for the new container to become healthy
    log_info "Waiting for backend container to become healthy..."
    local health_attempts=0
    local max_health_attempts=12
    while [[ $health_attempts -lt $max_health_attempts ]]; do
        local health_status
        health_status=$(docker inspect -f '{{.State.Health.Status}}' recovery-journey-backend 2>/dev/null || echo "unknown")
        if [[ "$health_status" == "healthy" ]]; then
            log_success "Backend container is healthy"
            return 0
        fi
        sleep 5
        health_attempts=$((health_attempts + 1))
        log_info "Waiting for healthy status... ($health_attempts/$max_health_attempts, current: $health_status)"
    done

    log_error "Backend container did not become healthy"
    return 1
}

record_deployed_version() {
    if [[ "$DRY_RUN" == "true" ]]; then
        return 0
    fi

    cd "$PROJECT_ROOT"
    if [[ -f .deployed_version ]]; then
        cp .deployed_version .deployed_version.previous
    fi
    echo "${BACKEND_IMAGE_TAG:-latest}" > .deployed_version
    log_info "Recorded deployed version: ${BACKEND_IMAGE_TAG:-latest}"
}

verify_deployment() {
    log_info "Verifying deployment..."

    if [[ "$DRY_RUN" == "true" ]]; then
        echo -e "${YELLOW}[DRY-RUN]${NC} Would verify local and public health endpoints"
        return 0
    fi

    # Primary gate: the backend we just deployed, reached directly.
    local local_url="http://localhost:${BACKEND_PORT:-8000}/health"
    local max_attempts=30
    local attempt=1
    local local_ok=false

    while [[ $attempt -le $max_attempts ]]; do
        if curl -sf "$local_url" > /dev/null 2>&1; then
            local_ok=true
            break
        fi
        log_info "Local health check attempt $attempt/$max_attempts..."
        sleep 5
        attempt=$((attempt + 1))
    done

    if [[ "$local_ok" != "true" ]]; then
        log_error "Local health check failed after $max_attempts attempts ($local_url)"
        return 1
    fi
    log_success "Local health check passed"

    # Secondary: the public endpoint (exercises DNS/proxy/TLS). A failure
    # here is a warning — the proxy may be managed separately.
    local public_url
    if [[ "$ENVIRONMENT" == "staging" ]]; then
        public_url="https://staging-api.recoveryjourney.app/health"
    else
        public_url="https://api.recoveryjourney.app/health"
    fi

    if curl -sf --max-time 15 "$public_url" > /dev/null 2>&1; then
        log_success "Public health check passed ($public_url)"
    else
        log_warning "Public health check failed ($public_url) — verify the reverse proxy/DNS"
    fi

    return 0
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
    prepare_image
    run_migrations
    deploy_backend
    verify_deployment
    record_deployed_version
    cleanup

    echo ""
    log_success "🚀 Deployment to $ENVIRONMENT completed successfully!"
    echo ""
}

# Run main function
main
