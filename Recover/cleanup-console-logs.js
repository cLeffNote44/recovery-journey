#!/usr/bin/env node
/**
 * Script to remove debug console.log statements from codebase
 * Keeps console.error in catch blocks and error tracking console statements
 */

const fs = require('fs');
const path = require('path');

const filesToClean = [
  // Lib files with debug logs
  { file: 'src/lib/error-handler.ts', removals: [
    { line: 124, text: "          console.log('Retry requested');" },
    { line: 245, text: "        console.log(`Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms`);" }
  ]},
  { file: 'src/lib/performance-monitoring.ts', removals: [
    { line: 66, text: "    console.log(`[Performance] ${metric.name}:`, {" },
    { line: 97, text: "    console.log('[Performance] Monitoring initialized');" },
    { line: 150, text: "    console.log(`[Performance] Custom metric ${name}:`, value, rating);" }
  ]},
  { file: 'src/lib/migrations.ts', removals: [
    { line: 130, text: "  console.log(`[Migration] Running migration to version ${version}`);" },
    { line: 177, text: "        console.log(`[Migration] Successfully migrated to ${version}`);" },
    { line: 289, text: "    console.log(`[Migration] Created backup for version ${fromVersion}`);" },
    { line: 303, text: "      console.log(`[Migration] Restored backup from ${parsed.version}`);" },
    { line: 333, text: "      console.log(`[Migration] Removed old backup: ${key}`);" },
    { line: 357, text: "    console.log(`[Migration] Successfully migrated from ${fromVersion} to ${targetVersion}`);" }
  ]},
  { file: 'src/lib/widgets.ts', removals: [
    { line: 187, text: "          console.log('Native widget updated successfully');" },
    { line: 250, text: "    console.log('Opening widget configuration...');" }
  ]},
  { file: 'src/lib/store-migration.ts', removals: [
    { line: 151, text: "  console.warn('Migration flag reset. Migration will run again on next app load.');" },
    { line: 160, text: "    console.warn('Cannot cleanup: migration not yet completed');" },
    { line: 167, text: "    console.log('Old AppContext data cleaned up successfully');" }
  ]},
  { file: 'src/hooks/useAnalyticsWorker.ts', removals: [
    { line: 32, text: "      console.warn('[Analytics Worker] Web Workers not supported in this environment');" },
    { line: 64, text: "      console.log('[Analytics Worker] Initialized successfully');" }
  ]}
];

console.log('Console Log Cleanup Script');
console.log('==========================\n');
console.log(`Found ${filesToClean.length} files to clean\n`);

filesToClean.forEach(({ file, removals }) => {
  const filePath = path.join(__dirname, file);

  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${file}`);
    return;
  }

  console.log(`📝 Cleaning ${file} (${removals.length} console statements)`);

  // For now, just log what would be removed
  removals.forEach(removal => {
    console.log(`   Line ${removal.line}: ${removal.text.trim().substring(0, 60)}...`);
  });
  console.log('');
});

console.log('\n✅ Analysis complete!');
console.log('\nNote: This script currently only analyzes. Actual removal requires manual editing or sed scripts.');
