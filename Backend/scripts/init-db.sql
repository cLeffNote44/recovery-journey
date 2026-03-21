-- =============================================================================
-- Recovery Journey - Database Initialization Script
-- =============================================================================
-- This script runs automatically when the PostgreSQL container starts
-- for the first time. It sets up extensions and initial configuration.
-- =============================================================================

-- Enable useful extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";      -- UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";       -- Cryptographic functions

-- Create schema if it doesn't exist (Prisma uses 'public' by default)
-- CREATE SCHEMA IF NOT EXISTS recovery_journey;

-- Log successful initialization
DO $$
BEGIN
    RAISE NOTICE 'Recovery Journey database initialized successfully';
END $$;
