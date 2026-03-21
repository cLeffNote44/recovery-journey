#!/usr/bin/env node
/**
 * Pre-commit hook to prevent backup files from being committed
 *
 * This script runs before git commit to check for backup files.
 * If backup files are found in staged changes, the commit is blocked.
 *
 * Usage:
 * 1. Install husky: pnpm add -D husky
 * 2. Initialize: pnpm exec husky init
 * 3. Add to .husky/pre-commit: node scripts/pre-commit.js
 */

import { execSync } from 'child_process';

const BACKUP_PATTERNS = [
  /\.backup$/,
  /\.bak$/,
  /\.old$/,
  /\.orig$/,
  /~$/,
  /\.swp$/,
  /\.swo$/,
  /\.tmp$/,
  /\.temp$/
];

/**
 * Check if filename matches backup patterns
 */
function isBackupFile(filename) {
  return BACKUP_PATTERNS.some(pattern => pattern.test(filename));
}

/**
 * Get list of staged files
 */
function getStagedFiles() {
  try {
    const output = execSync('git diff --cached --name-only', { encoding: 'utf-8' });
    return output.trim().split('\n').filter(Boolean);
  } catch (error) {
    console.error('Error getting staged files:', error.message);
    return [];
  }
}

/**
 * Main function
 */
function main() {
  const stagedFiles = getStagedFiles();

  if (stagedFiles.length === 0) {
    // No files staged, allow commit
    process.exit(0);
  }

  const backupFiles = stagedFiles.filter(isBackupFile);

  if (backupFiles.length === 0) {
    // No backup files, allow commit
    process.exit(0);
  }

  console.error('\n❌ Commit blocked: Backup files detected in staged changes\n');
  backupFiles.forEach(file => {
    console.error(`   ${file}`);
  });

  console.error('\n⚠️  Backup files should not be in source control.');
  console.error('   Use git history instead: git log, git diff, git revert\n');
  console.error('💡 To fix:');
  console.error('   1. Unstage backup files: git reset HEAD <file>');
  console.error('   2. Delete backup files: rm <file>');
  console.error('   3. Use git for version control\n');
  console.error('   4. Add to .gitignore: *.backup, *.bak, etc.\n');

  process.exit(1);
}

main();
