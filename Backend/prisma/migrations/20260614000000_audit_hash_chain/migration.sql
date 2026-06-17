-- Audit-log hash chaining: each row links to the previous row's hash so that
-- deletions, reordering, and forged insertions are detectable (the existing
-- `hash` column already detects in-place edits). Additive / non-breaking;
-- existing rows keep prev_hash = NULL and remain verifiable by content.
ALTER TABLE "audit_logs" ADD COLUMN "prev_hash" TEXT;
