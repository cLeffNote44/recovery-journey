#!/bin/bash
# ==============================================
# Recovery Journey Database Backup Script
# ==============================================
# HIPAA-compliant backup with encryption
# Usage: ./scripts/backup.sh [options]
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

# Configuration (override with environment variables)
BACKUP_DIR="${BACKUP_DIR:-$PROJECT_ROOT/backups}"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-90}"
ENCRYPT_BACKUPS="${ENCRYPT_BACKUPS:-true}"
COMPRESSION="${BACKUP_COMPRESSION:-gzip}"
S3_BUCKET="${BACKUP_S3_BUCKET:-}"
S3_PREFIX="${BACKUP_S3_PREFIX:-backups}"

# Database connection from environment
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-recovery_journey}"
DB_USER="${DB_USER:-postgres}"

# Timestamp for backup file
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="recovery_journey_${TIMESTAMP}"

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

# Cleanup handler for unexpected failures
cleanup_on_failure() {
    local exit_code=$?
    if [[ $exit_code -ne 0 ]]; then
        log_error "Backup failed with exit code $exit_code"
        # Remove partial/incomplete backup files to avoid leaving corrupted backups
        rm -f "$BACKUP_DIR/${BACKUP_NAME}"*.sql* 2>/dev/null || true
        rm -f "$BACKUP_DIR/${BACKUP_NAME}_pg_dump.log" 2>/dev/null || true
    fi
}
trap cleanup_on_failure EXIT

check_prerequisites() {
    log_info "Checking prerequisites..."

    # Check for required tools
    local missing_tools=()

    for tool in pg_dump openssl; do
        if ! command -v "$tool" &> /dev/null; then
            missing_tools+=("$tool")
        fi
    done

    if [[ ${#missing_tools[@]} -gt 0 ]]; then
        log_error "Missing required tools: ${missing_tools[*]}"
        exit 1
    fi

    # Check if S3 tools are available if S3 backup is configured
    if [[ -n "$S3_BUCKET" ]] && ! command -v aws &> /dev/null; then
        log_warning "AWS CLI not found. S3 backup will be skipped."
        S3_BUCKET=""
    fi

    # Create backup directory
    mkdir -p "$BACKUP_DIR"

    log_success "Prerequisites check passed"
}

create_database_backup() {
    log_info "Creating database backup..."

    local backup_file="$BACKUP_DIR/${BACKUP_NAME}.sql"

    # Create backup with pg_dump
    # Note: stderr goes to a log file, NOT into the SQL dump
    PGPASSWORD="${DB_PASSWORD:-}" pg_dump \
        -h "$DB_HOST" \
        -p "$DB_PORT" \
        -U "$DB_USER" \
        -d "$DB_NAME" \
        --format=plain \
        --no-owner \
        --no-privileges \
        --verbose \
        > "$backup_file" 2>"$BACKUP_DIR/${BACKUP_NAME}_pg_dump.log"

    if [[ ! -f "$backup_file" ]] || [[ ! -s "$backup_file" ]]; then
        log_error "Database backup failed or is empty"
        exit 1
    fi

    log_success "Database backup created: $backup_file"
    echo "$backup_file"
}

compress_backup() {
    local input_file="$1"
    log_info "Compressing backup..."

    local compressed_file

    case "$COMPRESSION" in
        gzip)
            compressed_file="${input_file}.gz"
            gzip -9 "$input_file"
            ;;
        bzip2)
            compressed_file="${input_file}.bz2"
            bzip2 -9 "$input_file"
            ;;
        xz)
            compressed_file="${input_file}.xz"
            xz -9 "$input_file"
            ;;
        none)
            compressed_file="$input_file"
            ;;
        *)
            log_error "Unknown compression type: $COMPRESSION"
            exit 1
            ;;
    esac

    log_success "Backup compressed: $compressed_file"
    echo "$compressed_file"
}

encrypt_backup() {
    local input_file="$1"

    if [[ "$ENCRYPT_BACKUPS" != "true" ]]; then
        echo "$input_file"
        return
    fi

    log_info "Encrypting backup (HIPAA requirement)..."

    # Get encryption key (handle unset variables safely under set -u)
    local encryption_key="${BACKUP_ENCRYPTION_KEY:-${ENCRYPTION_KEY:-}}"

    if [[ -z "$encryption_key" ]]; then
        log_error "BACKUP_ENCRYPTION_KEY or ENCRYPTION_KEY required for encrypted backups"
        exit 1
    fi

    local encrypted_file="${input_file}.enc"

    # Encrypt using AES-256-CBC
    openssl enc -aes-256-cbc \
        -salt \
        -pbkdf2 \
        -iter 100000 \
        -in "$input_file" \
        -out "$encrypted_file" \
        -pass "pass:$encryption_key"

    # Securely delete unencrypted file
    shred -u "$input_file" 2>/dev/null || rm -f "$input_file"

    log_success "Backup encrypted: $encrypted_file"
    echo "$encrypted_file"
}

upload_to_s3() {
    local backup_file="$1"

    if [[ -z "$S3_BUCKET" ]]; then
        log_info "S3 backup not configured, skipping upload"
        return
    fi

    log_info "Uploading backup to S3..."

    local s3_path="s3://${S3_BUCKET}/${S3_PREFIX}/$(basename "$backup_file")"

    # Upload with server-side encryption
    aws s3 cp "$backup_file" "$s3_path" \
        --sse AES256 \
        --storage-class STANDARD_IA

    log_success "Backup uploaded to: $s3_path"
}

cleanup_old_backups() {
    log_info "Cleaning up backups older than $RETENTION_DAYS days..."

    # Local cleanup
    local deleted_count=0
    while IFS= read -r -d '' file; do
        rm -f "$file"
        ((deleted_count++))
    done < <(find "$BACKUP_DIR" -name "recovery_journey_*.sql*" -mtime +"$RETENTION_DAYS" -print0)

    if [[ $deleted_count -gt 0 ]]; then
        log_info "Deleted $deleted_count local backup(s)"
    fi

    # S3 cleanup (if configured)
    if [[ -n "$S3_BUCKET" ]]; then
        log_info "Cleaning up old S3 backups..."

        # List and delete old backups
        local cutoff_date
        cutoff_date=$(date -d "$RETENTION_DAYS days ago" +%Y-%m-%d 2>/dev/null || date -v-${RETENTION_DAYS}d +%Y-%m-%d)

        aws s3 ls "s3://${S3_BUCKET}/${S3_PREFIX}/" | while read -r line; do
            local file_date
            file_date=$(echo "$line" | awk '{print $1}')
            local file_name
            file_name=$(echo "$line" | awk '{print $4}')

            if [[ "$file_date" < "$cutoff_date" ]] && [[ -n "$file_name" ]]; then
                aws s3 rm "s3://${S3_BUCKET}/${S3_PREFIX}/${file_name}"
                log_info "Deleted S3 backup: $file_name"
            fi
        done
    fi

    log_success "Cleanup completed"
}

generate_backup_report() {
    local backup_file="$1"
    local backup_size
    backup_size=$(du -h "$backup_file" | cut -f1)

    log_info "Generating backup report..."

    local report_file="$BACKUP_DIR/${BACKUP_NAME}_report.json"

    cat > "$report_file" << EOF
{
    "backup_name": "$(basename "$backup_file")",
    "timestamp": "$(date -Iseconds)",
    "database": "$DB_NAME",
    "host": "$DB_HOST",
    "size": "$backup_size",
    "encrypted": $ENCRYPT_BACKUPS,
    "compression": "$COMPRESSION",
    "retention_days": $RETENTION_DAYS,
    "s3_bucket": "${S3_BUCKET:-null}",
    "checksum": "$(sha256sum "$backup_file" | cut -d' ' -f1)"
}
EOF

    log_success "Backup report: $report_file"
}

verify_backup() {
    local backup_file="$1"
    log_info "Verifying backup integrity..."

    # Check file exists and has content
    if [[ ! -f "$backup_file" ]] || [[ ! -s "$backup_file" ]]; then
        log_error "Backup file is missing or empty"
        return 1
    fi

    # Verify checksum
    local checksum
    checksum=$(sha256sum "$backup_file" | cut -d' ' -f1)
    log_info "Backup checksum (SHA-256): $checksum"

    log_success "Backup verification passed"
}

# Main function
main() {
    echo ""
    echo "=========================================="
    echo "  Recovery Journey Database Backup"
    echo "  Database: $DB_NAME@$DB_HOST"
    echo "  Timestamp: $TIMESTAMP"
    echo "=========================================="
    echo ""

    check_prerequisites

    # Create backup
    local backup_file
    backup_file=$(create_database_backup)

    # Compress
    backup_file=$(compress_backup "$backup_file")

    # Encrypt (HIPAA requirement)
    backup_file=$(encrypt_backup "$backup_file")

    # Verify
    verify_backup "$backup_file"

    # Upload to S3
    upload_to_s3 "$backup_file"

    # Generate report
    generate_backup_report "$backup_file"

    # Cleanup old backups
    cleanup_old_backups

    echo ""
    log_success "🗄️  Backup completed successfully!"
    log_info "Backup file: $backup_file"
    echo ""
}

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --no-encrypt)
            ENCRYPT_BACKUPS="false"
            shift
            ;;
        --retention)
            RETENTION_DAYS="$2"
            shift 2
            ;;
        --s3-bucket)
            S3_BUCKET="$2"
            shift 2
            ;;
        -h|--help)
            echo "Usage: $0 [options]"
            echo ""
            echo "Options:"
            echo "  --no-encrypt     Disable encryption (not recommended)"
            echo "  --retention N    Set retention days (default: 90)"
            echo "  --s3-bucket NAME Upload to S3 bucket"
            echo "  -h, --help       Show this help"
            exit 0
            ;;
        *)
            log_error "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Run main
main
