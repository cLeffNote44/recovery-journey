#!/bin/bash
#
# Recovery Journey Backend - Complete Local Setup
#
# This script sets up everything needed to run the backend locally:
# 1. Creates PostgreSQL database
# 2. Generates Prisma client
# 3. Runs initial migration
# 4. Seeds the database (optional)
# 5. Starts the development server
#
# Prerequisites:
# - Node.js 20+
# - PostgreSQL installed and running
# - npm dependencies installed (run `npm install` first)
#

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo ""
echo -e "${BLUE}======================================${NC}"
echo -e "${BLUE}  Recovery Journey - Local Setup${NC}"
echo -e "${BLUE}======================================${NC}"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}ERROR: Run this script from the Backend directory${NC}"
    exit 1
fi

# Check for .env file
if [ ! -f ".env" ]; then
    echo -e "${RED}ERROR: .env file not found!${NC}"
    echo "Please ensure .env exists with your configuration."
    exit 1
fi

# Load environment variables
export $(grep -v '^#' .env | xargs)

echo -e "${YELLOW}Step 1: Checking PostgreSQL connection...${NC}"

# Extract database name from DATABASE_URL
DB_NAME=$(echo $DATABASE_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')
echo "Database name: $DB_NAME"

# Try to create the database (ignore error if it exists)
echo "Creating database if it doesn't exist..."
createdb $DB_NAME 2>/dev/null || echo "Database already exists or could not be created"

echo -e "${GREEN}✓ Database ready${NC}"
echo ""

echo -e "${YELLOW}Step 2: Installing dependencies...${NC}"
npm install
echo -e "${GREEN}✓ Dependencies installed${NC}"
echo ""

echo -e "${YELLOW}Step 3: Generating Prisma Client...${NC}"
npx prisma generate
echo -e "${GREEN}✓ Prisma client generated${NC}"
echo ""

echo -e "${YELLOW}Step 4: Running database migrations...${NC}"
# Check if migrations exist
if [ -d "prisma/migrations" ] && [ "$(ls -A prisma/migrations 2>/dev/null)" ]; then
    echo "Applying existing migrations..."
    npx prisma migrate deploy
else
    echo "Creating initial migration..."
    npx prisma migrate dev --name init
fi
echo -e "${GREEN}✓ Migrations complete${NC}"
echo ""

echo -e "${YELLOW}Step 5: Seeding database (optional)...${NC}"
read -p "Do you want to seed the database with test data? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    npx prisma db seed
    echo -e "${GREEN}✓ Database seeded${NC}"
else
    echo "Skipping seed"
fi
echo ""

echo -e "${GREEN}======================================${NC}"
echo -e "${GREEN}  Setup Complete!${NC}"
echo -e "${GREEN}======================================${NC}"
echo ""
echo "To start the development server, run:"
echo -e "  ${BLUE}npm run dev${NC}"
echo ""
echo "The server will be available at:"
echo -e "  ${BLUE}http://localhost:8000${NC}"
echo ""
echo "API documentation:"
echo -e "  Health check: ${BLUE}http://localhost:8000/health${NC}"
echo -e "  API base:     ${BLUE}http://localhost:8000/api/v1${NC}"
echo ""
