#!/bin/bash
# ==============================================
# Recovery Journey Database Restore Script
# ==============================================
# HIPAA-compliant restore from encrypted backup
# Usage: ./scripts/restore.sh <backup_file> [options]
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

# Configuration
BACKUP_DIR="${BACKUP_DIR:-$PROJECT_ROOT/backups}"
TEMP_DIR="${TEMP_DIR:-/tmp/recovery_restore_$$}"

# Database connection
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-recovery_journey}"
DB_USER="${DB_USER:-postgres}"

# Options
DRY_RUN=false
FORCE=false
TARGET_DB=""

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $(date '+%Y-%m-%d %H:%M:%S') $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $(date '+%Y-%m-%d %H:%M:%S') $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $(date '+%Y-%m-%d %H:%M:%S') $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $(date '+%Y-%m-%d %H:%M:%S') $1"
}

cleanup() {
    log_info "Cleaning up temporary files (secure delete for HIPAA compliance)..."
    # Securely delete decrypted/decompressed backup data from temp dir
    if [[ -d "$TEMP_DIR" ]]; then
        find "$TEMP_DIR" -type f -exec shred -u {} \; 2>/dev/null || rm -rf "$TEMP_DIR"
    fi
}

trap cleanup EXIT

check_prerequisites() {
    log_info "Checking prerequisites..."

    for tool in psql openssl gunzip; do
        if ! command -v "$tool" &> /dev/null; then
            log_error "Missing required tool: $tool"
            exit 1
        fi
    done

    mkdir -p "$TEMP_DIR"

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

    openssl enc -aes-256-cbc -d \
        -pbkdf2 \
        -iter 100000 \
        -in "$input_file" \
        -out "$output_file" \
        -pass "pass:$encryption_key"

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
            bunzip2 -c "$input_file" > "$output_file"
            ;;
        *.xz)
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

    echo ""
    log_warning "⚠️  WARNING: This will OVERWRITE the database '$target'"
    log_warning "All existing data will be LOST!"
    echo ""
    read -p "Are you sure you want to continue? (type 'yes' to confirm): " -r

    if [[ "$REPLY" != "yes" ]]; then
        log_info "Restore cancelled"
        exit 0
    fi
}

create_pre_restore_backup() {
    local target_db="$1"

    log_info "Creating pre-restore backup of current database..."

    local pre_backup="$BACKUP_DIR/pre_restore_${target_db}_$(date +%Y%m%d_%H%M%S).sql.gz"

    PGPASSWORD="${DB_PASSWORD:-}" pg_dump \
        -h "$DB_HOST" \
        -p "$DB_PORT" \
        -U "$DB_USER" \
        -d "$target_db" \
        --format=plain \
        --no-owner \
        2>/dev/null | gzip > "$pre_backup"

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
    PGPASSWORD="${DB_PASSWORD:-}" psql \
        -h "$DB_HOST" \
        -p "$DB_PORT" \
        -U "$DB_USER" \
        -d postgres \
        -c "SELECT pg_terminate_backend(pg_stat_activity.pid) FROM pg_stat_activity WHERE pg_stat_activity.datname = '$target_db' AND pid <> pg_backend_pid();" \
        2>/dev/null || true

    # Drop and recreate database
    log_info "Recreating database..."

    PGPASSWORD="${DB_PASSWORD:-}" psql \
        -h "$DB_HOST" \
        -p "$DB_PORT" \
        -U "$DB_USER" \
        -d postgres \
        -c "DROP DATABASE IF EXISTS $target_db;"

    PGPASSWORD="${DB_PASSWORD:-}" psql \
        -h "$DB_HOST" \
        -p "$DB_PORT" \
        -U "$DB_USER" \
        -d postgres \
        -c "CREATE DATABASE $target_db;"

    # Restore from backup
    log_info "Importing data..."

    PGPASSWORD="${DB_PASSWORD:-}" psql \
        -h "$DB_HOST" \
        -p "$DB_PORT" \
        -U "$DB_USER" \
        -d "$target_db" \
        -f "$sql_file"

    log_success "Database restored successfully"
}

verify_restore() {
    local target_db="$1"

    log_info "Verifying restore..."

    # Check if we can connect
    local table_count
    table_count=$(PGPASSWORD="${DB_PASSWORD:-}" psql \
        -h "$DB_HOST" \
        -p "$DB_PORT" \
        -U "$DB_USER" \
        -d "$target_db" \
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
    echo ""

    if [[ -d "$BACKUP_DIR" ]]; then
        ls -lh "$BACKUP_DIR"/recovery_journey_*.sql* 2>/dev/null | while read -r line; do
            echo "  $line"
        done
    else
        echo "  No backups found in $BACKUP_DIR"
    fi

    echo ""
}

# Main function
main() {
    local backup_file="${1:-}"

    echo ""
    echo "=========================================="
    echo "  Recovery Journey Database Restore"
    echo "=========================================="
    echo ""

    # Show available backups if no file specified
    if [[ -z "$backup_file" ]]; then
        list_available_backups
        echo "Usage: $0 <backup_file> [options]"
        echo ""
        echo "Options:"
        echo "  --target DB    Restore to specific database"
        echo "  --dry-run      Show what would be done"
        echo "  --force        Skip confirmation prompts"
        echo "  -h, --help     Show this help"
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

    # Create pre-restore backup
    if [[ "$DRY_RUN" != "true" ]]; then
        create_pre_restore_backup "$target" || true
    fi

    # Process backup file
    local current_file="$backup_file"

    # Decrypt if needed
    if [[ "$current_file" == *.enc ]]; then
        local decrypted_file="$TEMP_DIR/backup_decrypted"
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

    echo ""
    log_success "🔄 Database restore completed successfully!"
    log_info "Database: $target"
    echo ""
}

# Parse arguments
BACKUP_FILE=""
while [[ $# -gt 0 ]]; do
    case $1 in
        --target)
            TARGET_DB="$2"
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
