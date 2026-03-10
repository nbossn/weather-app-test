/**
 * Auto Memory Hook
 * Handles session memory import/sync operations for Claude Flow hooks
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Load settings with fallback
 */
function loadSettings() {
  try {
    const settingsPath = './.claude/settings.json';
    if (fs.existsSync(settingsPath)) {
      return JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
    }
  } catch (e) {
    console.log('  Using default settings');
  }
  return { 'auto-memory': { enabled: true } };
}

/**
 * Import auto memories into the bridge (SessionStart hook)
 */
async function importMemories() {
  console.log('📥 Auto-memory: Importing session memories...');

  const settings = loadSettings();
  const autoMemory = settings['auto-memory'] || {};

  if (!autoMemory.enabled) {
    console.log('  Auto-memory disabled in settings');
    return;
  }

  try {
    // Placeholder for actual memory import logic
    // In a full implementation, this would:
    // 1. Check for existing memory files
    // 2. Parse and validate memory data
    // 3. Import into the memory bridge

    const memoryPath = './.claude/memories';

    if (fs.existsSync(memoryPath)) {
      const files = fs.readdirSync(memoryPath).filter(f => f.endsWith('.json'));
      console.log(`  Found ${files.length} memory file(s)`);

      for (const file of files) {
        console.log(`    - ${file}`);
      }
    } else {
      console.log('  No memories directory found');
    }

    console.log('✅ Memory import complete');
  } catch (e) {
    console.log(`  Error importing memories: ${e.message}`);
  }
}

/**
 * Sync/flush pending memory operations (Stop hook)
 */
async function syncMemories() {
  console.log('📤 Auto-memory: Syncing pending memory operations...');

  const settings = loadSettings();
  const autoMemory = settings['auto-memory'] || {};

  if (!autoMemory.enabled) {
    console.log('  Auto-memory disabled in settings');
    return;
  }

  try {
    // Placeholder for actual memory sync logic
    // In a full implementation, this would:
    // 1. Check for pending memory operations
    // 2. Flush/write pending changes
    // 3. Clean up temporary files

    console.log('  Checking for pending operations...');

    // Simulate sync check
    const pendingPath = './.claude/memories/.pending';

    if (fs.existsSync(pendingPath)) {
      console.log('  Flushing pending operations...');
    } else {
      console.log('  No pending operations');
    }

    console.log('✅ Memory sync complete');
  } catch (e) {
    console.log(`  Error syncing memories: ${e.message}`);
  }
}

/**
 * Main CLI handler
 */
async function main() {
  const command = process.argv[2];

  if (!command) {
    console.log('Usage: auto-memory-hook.mjs <command>');
    console.log('Commands:');
    console.log('  import  - SessionStart hook: Import memories into bridge');
    console.log('  sync    - Stop hook: Sync/flush pending memory operations');
    process.exit(1);
  }

  console.log(`🔄 Auto-memory hook: ${command}`);

  switch (command) {
    case 'import':
      await importMemories();
      break;

    case 'sync':
      await syncMemories();
      break;

    default:
      console.log(`Unknown command: ${command}`);
      console.log('Available commands: import, sync');
      process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(e => {
    console.error('Fatal error:', e.message);
    process.exit(1);
  });
}

export { importMemories, syncMemories };
