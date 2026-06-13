#!/bin/bash
# ==============================================
# Recovery Journey Database Restore Script
# ==============================================
# HIPAA-compliant restore from encrypted backup
# Usage: ./scripts/restore.sh <backup_file> [options]
#
# When the database runs in Docker with no published port (production),
# psql/pg_dump run via `docker exec` inside the db container. Otherwise
# they connect to DB_HOST:DB_PORT directly.
# ==============================================

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Load project .env if present (SSH/cron sessions don't inherit it).
# Values already set in the environment take precedence.
if [[ -f "$PROJECT_ROOT/.env" ]]; then
    set +u
    # shellcheck disable=SC1090
    source <(grep -E '^[A-Za-z_][A-Za-z0-9_]*=' "$PROJECT_ROOT/.env" | while IFS='=' read -r key value; do
        if [[ -z "${!key:-}" ]]; then
            printf 'export %s=%q\n' "$key" "$value"
        fi
    done)
    set -u
fi

# Configuration
BACKUP_DIR="${BACKUP_DIR:-$PROJECT_ROOT/backups}"
TEMP_DIR="${TEMP_DIR:-/tmp/recovery_restore_$$}"

# Database connection
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-recovery_journey}"
DB_USER="${DB_USER:-postgres}"
DB_CONTAINER="${DB_CONTAINER:-recovery-journey-db}"

# Set when psql should run inside the db container
USE_DB_CONTAINER=false

# Options
DRY_RUN=false
FORCE=false
SKIP_PRE_BACKUP=false
TARGET_DB=""

# Functions — all logging goes to stderr so functions can return values
# on stdout via command substitution.
log_info() {
    echo -e "${BLUE}[INFO]${NC} $(date '+%Y-%m-%d %H:%M:%S') $1" >&2
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $(date '+%Y-%m-%d %H:%M:%S') $1" >&2
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $(date '+%Y-%m-%d %H:%M:%S') $1" >&2
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $(date '+%Y-%m-%d %H:%M:%S') $1" >&2
}

cleanup() {
    log_info "Cleaning up temporary files (secure delete for HIPAA compliance)..."
    # Securely delete decrypted/decompressed backup data from temp dir
    if [[ -d "$TEMP_DIR" ]]; then
        find "$TEMP_DIR" -type f -exec shred -u {} \; 2>/dev/null || rm -rf "$TEMP_DIR"
        rm -rf "$TEMP_DIR" 2>/dev/null || true
    fi
}

trap cleanup EXIT

# Run psql against the target server, inside the container when needed.
# Usage: run_psql <database> [psql args...]   (reads stdin)
run_psql() {
    local database="$1"
    shift
    if [[ "$USE_DB_CONTAINER" == "true" ]]; then
        docker exec -i "$DB_CONTAINER" psql -U "$DB_USER" -d "$database" "$@"
    else
        PGPASSWORD="${DB_PASSWORD:-}" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$database" "$@"
    fi
}

# Run pg_dump against the target server, inside the container when needed.
run_pg_dump() {
    local database="$1"
    shift
    if [[ "$USE_DB_CONTAINER" == "true" ]]; then
        docker exec "$DB_CONTAINER" pg_dump -U "$DB_USER" -d "$database" "$@"
    else
        PGPASSWORD="${DB_PASSWORD:-}" pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$database" "$@"
    fi
}

check_prerequisites() {
    log_info "Checking prerequisites..."

    # Prefer the db container: in production the database port is not
    # published, so a host psql cannot reach it.
    if command -v docker &> /dev/null && \
       docker ps --format '{{.Names}}' 2>/dev/null | grep -qx "$DB_CONTAINER"; then
        USE_DB_CONTAINER=true
        log_info "Using database container: $DB_CONTAINER"
    fi

    local required_tools=(openssl gunzip)
    if [[ "$USE_DB_CONTAINER" != "true" ]]; then
        required_tools+=(psql)
    fi

    for tool in "${required_tools[@]}"; do
        if ! command -v "$tool" &> /dev/null; then
            log_error "Missing required tool: $tool"
            exit 1
        fi
    done

    mkdir -p "$TEMP_DIR"
    chmod 700 "$TEMP_DIR"

    log_success "Prerequisites check passed"
}

verify_backup_file() {
    local backup_file="$1"

    log_info "Verifying backup file..."

    if [[ ! -f "$backup_file" ]]; then
        log_error "Backup file not found: $backup_file"
        exit 1
    fi

    local file_size
    file_size=$(stat -f%z "$backup_file" 2>/dev/null || stat -c%s "$backup_file")

    if [[ "$file_size" -eq 0 ]]; then
        log_error "Backup file is empty"
        exit 1
    fi

    log_success "Backup file verified: $(du -h "$backup_file" | cut -f1)"
}

decrypt_backup() {
    local input_file="$1"
    local output_file="$2"

    # Check if file is encrypted (ends with .enc)
    if [[ "$input_file" != *.enc ]]; then
        cp "$input_file" "$output_file"
        return
    fi

    log_info "Decrypting backup..."

    local encryption_key="${BACKUP_ENCRYPTION_KEY:-${ENCRYPTION_KEY:-}}"

    if [[ -z "$encryption_key" ]]; then
        log_error "BACKUP_ENCRYPTION_KEY or ENCRYPTION_KEY required for encrypted backups"
        exit 1
    fi

    # The key is passed via the environment, not the command line,
    # so it never appears in the process list.
    BACKUP_OPENSSL_PASS="$encryption_key" openssl enc -aes-256-cbc -d \
        -pbkdf2 \
        -iter 100000 \
        -in "$input_file" \
        -out "$output_file" \
        -pass env:BACKUP_OPENSSL_PASS

    log_success "Backup decrypted"
}

decompress_backup() {
    local input_file="$1"
    local output_file="$2"

    log_info "Decompressing backup..."

    case "$input_file" in
        *.gz)
            gunzip -c "$input_file" > "$output_file"
            ;;
        *.bz2)
            command -v bunzip2 &> /dev/null || { log_error "bunzip2 is required for .bz2 backups"; exit 1; }
            bunzip2 -c "$input_file" > "$output_file"
            ;;
        *.xz)
            command -v xz &> /dev/null || { log_error "xz is required for .xz backups"; exit 1; }
            xz -dc "$input_file" > "$output_file"
            ;;
        *.sql)
            cp "$input_file" "$output_file"
            ;;
        *)
            cp "$input_file" "$output_file"
            ;;
    esac

    log_success "Backup decompressed"
}

confirm_restore() {
    local target="$1"

    if [[ "$FORCE" == "true" ]]; then
        return 0
    fi

    echo "" >&2
    log_warning "⚠️  WARNING: This will OVERWRITE the database '$target'"
    log_warning "All existing data will be LOST!"
    echo "" >&2
    read -p "Are you sure you want to continue? (type 'yes' to confirm): " -r

    if [[ "$REPLY" != "yes" ]]; then
        log_info "Restore cancelled"
        exit 0
    fi
}

create_pre_restore_backup() {
    local target_db="$1"

    log_info "Creating pre-restore backup of current database..."

    local timestamp
    timestamp=$(date +%Y%m%d_%H%M%S)
    local pre_backup="$BACKUP_DIR/pre_restore_${target_db}_${timestamp}.sql.gz"

    run_pg_dump "$target_db" --format=plain --no-owner | gzip > "$pre_backup"

    # The pre-restore dump is the only way back from a bad restore — refuse
    # to continue if it is missing or empty.
    if [[ ! -s "$pre_backup" ]]; then
        log_error "Pre-restore backup is missing or empty: $pre_backup"
        log_error "Refusing to overwrite the database without a safety dump (use --no-pre-backup to override)"
        exit 1
    fi

    # Encrypt the pre-restore dump too — it contains the same PHI as any
    # other backup (HIPAA requirement).
    local encryption_key="${BACKUP_ENCRYPTION_KEY:-${ENCRYPTION_KEY:-}}"
    if [[ -n "$encryption_key" ]]; then
        BACKUP_OPENSSL_PASS="$encryption_key" openssl enc -aes-256-cbc \
            -salt -pbkdf2 -iter 100000 \
            -in "$pre_backup" \
            -out "${pre_backup}.enc" \
            -pass env:BACKUP_OPENSSL_PASS
        shred -u "$pre_backup" 2>/dev/null || rm -f "$pre_backup"
        pre_backup="${pre_backup}.enc"
    else
        log_warning "No encryption key set — pre-restore backup is NOT encrypted"
    fi

    log_success "Pre-restore backup created: $pre_backup"
}

restore_database() {
    local sql_file="$1"
    local target_db="$2"

    if [[ "$DRY_RUN" == "true" ]]; then
        log_info "[DRY RUN] Would restore to database: $target_db"
        return
    fi

    log_info "Restoring to database: $target_db"

    # Drop existing connections
    run_psql postgres \
        -c "SELECT pg_terminate_backend(pg_stat_activity.pid) FROM pg_stat_activity WHERE pg_stat_activity.datname = '$target_db' AND pid <> pg_backend_pid();" \
        2>/dev/null || true

    # Drop and recreate database. WITH (FORCE) handles clients (e.g. the
    # still-running backend) that reconnect between terminate and drop.
    log_info "Recreating database..."

    run_psql postgres -c "DROP DATABASE IF EXISTS $target_db WITH (FORCE);"
    run_psql postgres -c "CREATE DATABASE $target_db;"

    # Restore from backup (SQL is streamed via stdin so it works both for
    # direct connections and docker exec)
    log_info "Importing data..."

    run_psql "$target_db" -v ON_ERROR_STOP=1 -f - < "$sql_file"

    log_success "Database restored successfully"
}

verify_restore() {
    local target_db="$1"

    log_info "Verifying restore..."

    # Check if we can connect
    local table_count
    table_count=$(run_psql "$target_db" \
        -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" \
        2>/dev/null | tr -d ' ')

    if [[ -z "$table_count" ]] || [[ "$table_count" -eq 0 ]]; then
        log_error "Restore verification failed: No tables found"
        return 1
    fi

    log_success "Restore verified: $table_count tables found"
}

list_available_backups() {
    log_info "Available backups:"
    echo "" >&2

    if [[ -d "$BACKUP_DIR" ]]; then
        ls -lh "$BACKUP_DIR"/recovery_journey_*.sql* 2>/dev/null | while read -r line; do
            echo "  $line" >&2
        done
    else
        echo "  No backups found in $BACKUP_DIR" >&2
    fi

    echo "" >&2
}

# Main function
main() {
    local backup_file="${1:-}"

    log_info "=========================================="
    log_info "  Recovery Journey Database Restore"
    log_info "=========================================="

    # Show available backups if no file specified
    if [[ -z "$backup_file" ]]; then
        list_available_backups
        echo "Usage: $0 <backup_file> [options]"
        echo ""
        echo "Options:"
        echo "  --target DB       Restore to specific database"
        echo "  --dry-run         Show what would be done"
        echo "  --force           Skip confirmation prompts"
        echo "  --no-pre-backup   Skip the pre-restore safety dump (dangerous)"
        echo "  -h, --help        Show this help"
        exit 0
    fi

    check_prerequisites
    verify_backup_file "$backup_file"

    # Determine target database
    local target="${TARGET_DB:-$DB_NAME}"

    # Validate database name to prevent SQL injection
    if [[ ! "$target" =~ ^[a-zA-Z_][a-zA-Z0-9_]*$ ]]; then
        log_error "Invalid database name: '$target'. Only alphanumeric characters and underscores are allowed."
        exit 1
    fi

    # Confirm restore
    confirm_restore "$target"

    # Create pre-restore backup — a hard gate before any destructive step
    if [[ "$DRY_RUN" != "true" ]]; then
        if [[ "$SKIP_PRE_BACKUP" == "true" ]]; then
            log_warning "Skipping pre-restore backup (--no-pre-backup) — there is no way back from a bad restore"
        else
            create_pre_restore_backup "$target"
        fi
    fi

    # Process backup file
    local current_file="$backup_file"

    # Decrypt if needed. The decrypted file must keep the inner extension
    # (e.g. backup.sql.gz.enc -> backup.sql.gz) — decompress_backup decides
    # how to unpack based on it.
    if [[ "$current_file" == *.enc ]]; then
        local decrypted_file
        decrypted_file="$TEMP_DIR/$(basename "${current_file%.enc}")"
        decrypt_backup "$current_file" "$decrypted_file"
        current_file="$decrypted_file"
    fi

    # Decompress if needed
    local sql_file="$TEMP_DIR/backup.sql"
    decompress_backup "$current_file" "$sql_file"

    # Restore database
    restore_database "$sql_file" "$target"

    # Verify restore
    verify_restore "$target"

    log_success "🔄 Database restore completed successfully!"
    log_info "Database: $target"
}

# Parse arguments
BACKUP_FILE=""
while [[ $# -gt 0 ]]; do
    case $1 in
        --target)
            TARGET_DB="${2:?--target requires a database name}"
            shift 2
            ;;
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --force)
            FORCE=true
            shift
            ;;
        --no-pre-backup)
            SKIP_PRE_BACKUP=true
            shift
            ;;
        -h|--help)
            main ""
            ;;
        -*)
            log_error "Unknown option: $1"
            exit 1
            ;;
        *)
            BACKUP_FILE="$1"
            shift
            ;;
    esac
done

# Run main
main "$BACKUP_FILE"
