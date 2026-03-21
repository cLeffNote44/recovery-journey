#!/usr/bin/env node
/**
 * Check for backup files in the repository
 *
 * Backup files should not be in source control - use git history instead!
 * This script helps catch them before they're committed.
 */

import { readdirSync, statSync } from 'fs';
import { join } from 'path';

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

const IGNORE_DIRS = [
  'node_modules',
  '.git',
  'dist',
  'build',
  '.next',
  'out',
  '.vercel',
  'coverage'
];

/**
 * Check if filename matches backup patterns
 */
function isBackupFile(filename) {
  return BACKUP_PATTERNS.some(pattern => pattern.test(filename));
}

/**
 * Recursively scan directory for backup files
 */
function scanDirectory(dir, results = []) {
  const files = readdirSync(dir);

  for (const file of files) {
    const filePath = join(dir, file);
    const stat = statSync(filePath);

    // Skip ignored directories
    if (stat.isDirectory() && IGNORE_DIRS.includes(file)) {
      continue;
    }

    if (stat.isDirectory()) {
      scanDirectory(filePath, results);
    } else if (isBackupFile(file)) {
      results.push(filePath);
    }
  }

  return results;
}

/**
 * Main function
 */
function main() {
  console.log('🔍 Checking for backup files...\n');

  const startDir = process.cwd();
  const backupFiles = scanDirectory(startDir);

  if (backupFiles.length === 0) {
    console.log('✅ No backup files found!\n');
    process.exit(0);
  }

  console.error('❌ Backup files detected:\n');
  backupFiles.forEach(file => {
    const relativePath = file.replace(startDir, '.').replace(/\\/g, '/');
    console.error(`   ${relativePath}`);
  });

  console.error('\n⚠️  Backup files should not be in source control.');
  console.error('   Use git history instead: git log, git diff, git revert\n');
  console.error('💡 To fix:');
  console.error('   1. Delete backup files: rm *.backup');
  console.error('   2. Add to .gitignore if needed');
  console.error('   3. Use git for version control\n');

  process.exit(1);
}

main();
