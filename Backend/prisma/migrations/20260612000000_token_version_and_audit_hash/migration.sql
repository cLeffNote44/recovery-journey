-- Access-token revocation: bump to invalidate all previously-issued tokens
ALTER TABLE "staff" ADD COLUMN "token_version" INTEGER NOT NULL DEFAULT 0;

-- Audit-log tamper evidence: keyed HMAC over the row contents
ALTER TABLE "audit_logs" ADD COLUMN "hash" TEXT;
