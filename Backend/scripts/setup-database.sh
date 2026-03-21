#!/bin/bash
#
# Recovery Journey - Database Setup Script
#
# This script helps you set up the database with proper migrations.
# Run this script after configuring your .env file.
#
# Usage:
#   ./scripts/setup-database.sh [command]
#
# Commands:
#   init      - Initialize database with first migration (new projects)
#   migrate   - Run pending migrations (existing projects)
#   reset     - Reset database and re-run all migrations (DESTROYS DATA)
#   seed      - Seed the database with test data
#   studio    - Open Prisma Studio to browse data
#

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo ""
echo "========================================"
echo "  Recovery Journey - Database Setup"
echo "========================================"
echo ""

# Check if .env exists
if [ ! -f ".env" ]; then
    echo -e "${RED}ERROR: .env file not found!${NC}"
    echo ""
    echo "Please copy .env.example to .env and configure your database:"
    echo "  cp .env.example .env"
    echo ""
    exit 1
fi

# Check if DATABASE_URL is set (not the placeholder)
if grep -q "YOUR_DB_USER:YOUR_DB_PASSWORD" .env 2>/dev/null; then
    echo -e "${RED}ERROR: Database credentials not configured!${NC}"
    echo ""
    echo "Please update DATABASE_URL in your .env file with real credentials."
    echo ""
    exit 1
fi

COMMAND=${1:-help}

case $COMMAND in
    init)
        echo -e "${YELLOW}Creating initial migration...${NC}"
        echo ""
        echo "This will create the initial database schema."
        echo "Migration name: 'init'"
        echo ""
        read -p "Continue? (y/n) " -n 1 -r
        echo ""
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            npx prisma migrate dev --name init
            echo ""
            echo -e "${GREEN}Initial migration created successfully!${NC}"
        fi
        ;;

    migrate)
        echo -e "${YELLOW}Running pending migrations...${NC}"
        echo ""
        npx prisma migrate dev
        echo ""
        echo -e "${GREEN}Migrations applied successfully!${NC}"
        ;;

    deploy)
        echo -e "${YELLOW}Deploying migrations (production mode)...${NC}"
        echo ""
        npx prisma migrate deploy
        echo ""
        echo -e "${GREEN}Migrations deployed successfully!${NC}"
        ;;

    reset)
        echo -e "${RED}WARNING: This will DELETE ALL DATA in the database!${NC}"
        echo ""
        read -p "Are you sure you want to reset? (type 'yes' to confirm) " CONFIRM
        if [ "$CONFIRM" = "yes" ]; then
            npx prisma migrate reset
            echo ""
            echo -e "${GREEN}Database reset complete!${NC}"
        else
            echo "Reset cancelled."
        fi
        ;;

    seed)
        echo -e "${YELLOW}Seeding database with test data...${NC}"
        echo ""
        npx prisma db seed
        echo ""
        echo -e "${GREEN}Database seeded successfully!${NC}"
        ;;

    studio)
        echo -e "${YELLOW}Opening Prisma Studio...${NC}"
        echo ""
        npx prisma studio
        ;;

    generate)
        echo -e "${YELLOW}Generating Prisma Client...${NC}"
        echo ""
        npx prisma generate
        echo ""
        echo -e "${GREEN}Prisma Client generated!${NC}"
        ;;

    status)
        echo -e "${YELLOW}Checking migration status...${NC}"
        echo ""
        npx prisma migrate status
        ;;

    help|*)
        echo "Usage: ./scripts/setup-database.sh [command]"
        echo ""
        echo "Commands:"
        echo "  init      - Create initial migration (new projects)"
        echo "  migrate   - Run pending migrations"
        echo "  deploy    - Deploy migrations (production, no prompts)"
        echo "  reset     - Reset database (DESTROYS ALL DATA)"
        echo "  seed      - Seed database with test data"
        echo "  studio    - Open Prisma Studio"
        echo "  generate  - Generate Prisma Client"
        echo "  status    - Check migration status"
        echo "  help      - Show this help message"
        echo ""
        echo "First-time setup:"
        echo "  1. Configure your .env file with DATABASE_URL"
        echo "  2. Run: ./scripts/setup-database.sh init"
        echo "  3. Run: ./scripts/setup-database.sh seed (optional)"
        echo ""
        ;;
esac

echo ""
