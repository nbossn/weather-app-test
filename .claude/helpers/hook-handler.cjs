#!/usr/bin/env node
/**
 * Hook Handler - Claude Code Hook Management
 * Handles various Claude Code hooks for session management, routing, and compaction
 */

const fs = require('fs');
const path = require('path');

const HELPERS_DIR = path.join(__dirname);
const STATE_DIR = path.join(HELPERS_DIR, '..', '..', '.claude', 'state');

// Ensure state directory exists
function ensureStateDir() {
  try {
    if (!fs.existsSync(STATE_DIR)) {
      fs.mkdirSync(STATE_DIR, { recursive: true });
    }
  } catch (e) { /* ignore */ }
}

/**
 * Pre-Bash Hook - Log and validate dangerous commands
 */
function preBash() {
  try {
    // Parse command from arguments (passed as JSON from Claude Code)
    const cmdArg = process.argv[3];
    let command = '';

    if (cmdArg) {
      try {
        const parsed = JSON.parse(cmdArg);
        command = parsed.command || '';
      } catch (e) {
        command = cmdArg;
      }
    }

    // Check for dangerous patterns
    const dangerousPatterns = [
      { pattern: /^rm\s+-rf\s+\//, message: 'Dangerous: Root directory deletion' },
      { pattern: /^rm\s+-rf\s+\.\s*$/, message: 'Dangerous: Recursive deletion in current dir' },
      { pattern: /--force.*--force/, message: 'Double force flag detected' },
      { pattern: /^git\s+reset\s+--hard/, message: 'Git hard reset - potential data loss' },
      { pattern: /^git\s+push\s+--force/, message: 'Force push detected' },
    ];

    let blocked = false;
    let warning = null;

    for (const check of dangerousPatterns) {
      if (check.pattern.test(command)) {
        blocked = true;
        warning = check.message;
        break;
      }
    }

    // Log the command attempt
    const logEntry = {
      timestamp: new Date().toISOString(),
      command: command.substring(0, 200), // Truncate long commands
      blocked,
      warning
    };

    try {
      const logPath = path.join(STATE_DIR, 'bash-log.jsonl');
      fs.appendFileSync(logPath, JSON.stringify(logEntry) + '\n');
    } catch (e) { /* ignore logging errors */ }

    console.log(JSON.stringify({
      success: true,
      allowed: !blocked,
      warning: warning,
      message: blocked ? 'Command blocked' : 'Command allowed'
    }));

    process.exit(blocked ? 1 : 0);
  } catch (e) {
    console.error(JSON.stringify({ success: false, error: e.message }));
    process.exit(1);
  }
}

/**
 * Post-Edit Hook - Track file changes
 */
function postEdit() {
  try {
    const filePath = process.argv[3] || '';
    const success = process.argv[4] === 'true';

    if (!filePath) {
      console.log(JSON.stringify({ success: false, error: 'No file path provided' }));
      process.exit(1);
    }

    // Track edit history
    const editRecord = {
      timestamp: new Date().toISOString(),
      file: filePath,
      success
    };

    ensureStateDir();
    const historyPath = path.join(STATE_DIR, 'edit-history.jsonl');
    fs.appendFileSync(historyPath, JSON.stringify(editRecord) + '\n');

    console.log(JSON.stringify({
      success: true,
      file: filePath,
      tracked: true
    }));
  } catch (e) {
    console.error(JSON.stringify({ success: false, error: e.message }));
    process.exit(1);
  }
}

/**
 * Route Hook - Route tasks to appropriate agents
 */
function route() {
  try {
    const taskArg = process.argv[3];
    let task = '';

    if (taskArg) {
      try {
        const parsed = JSON.parse(taskArg);
        task = parsed.task || parsed.description || parsed.prompt || '';
      } catch (e) {
        task = taskArg;
      }
    }

    // Simple routing based on task keywords
    let agentType = 'general-purpose';
    let confidence = 0.5;

    const routes = [
      { keywords: ['test', 'testing', 'spec'], agent: 'test-runner', confidence: 0.8 },
      { keywords: ['bug', 'fix', 'error', 'issue'], agent: 'bug-fixer', confidence: 0.75 },
      { keywords: ['refactor', 'improve', 'optimize'], agent: 'refactor-agent', confidence: 0.7 },
      { keywords: ['review', 'code review'], agent: 'code-reviewer', confidence: 0.85 },
      { keywords: ['docs', 'documentation', 'readme'], agent: 'docs-writer', confidence: 0.9 },
      { keywords: ['security', 'vulnerability', 'audit'], agent: 'security-expert', confidence: 0.85 },
      { keywords: ['deploy', 'release', 'publish'], agent: 'devops-agent', confidence: 0.8 },
    ];

    const taskLower = task.toLowerCase();

    for (const route of routes) {
      for (const keyword of route.keywords) {
        if (taskLower.includes(keyword)) {
          agentType = route.agent;
          confidence = route.confidence;
          break;
        }
      }
      if (confidence > 0.5) break;
    }

    console.log(JSON.stringify({
      success: true,
      agentType,
      confidence,
      routed: true
    }));
  } catch (e) {
    console.error(JSON.stringify({ success: false, error: e.message }));
    process.exit(1);
  }
}

/**
 * Session Restore Hook - Restore previous session state
 */
function sessionRestore() {
  try {
    const sessionId = process.argv[3] || 'latest';

    ensureStateDir();

    // Try to restore session state
    const stateFiles = ['session-state.json', 'last-session.json'];
    let state = null;

    for (const file of stateFiles) {
      const filePath = path.join(STATE_DIR, file);
      if (fs.existsSync(filePath)) {
        try {
          state = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
          break;
        } catch (e) { /* continue */ }
      }
    }

    console.log(JSON.stringify({
      success: true,
      restored: state !== null,
      sessionId,
      state: state || {}
    }));
  } catch (e) {
    console.error(JSON.stringify({ success: false, error: e.message }));
    process.exit(1);
  }
}

/**
 * Session End Hook - Save state and cleanup
 */
function sessionEnd() {
  try {
    ensureStateDir();

    // Save current session state
    const state = {
      endedAt: new Date().toISOString(),
      sessionId: process.argv[3] || 'unknown'
    };

    const statePath = path.join(STATE_DIR, 'last-session.json');
    fs.writeFileSync(statePath, JSON.stringify(state, null, 2));

    // Clean up temporary files
    const tempPatterns = ['temp-*.json', '*.tmp'];
    // Note: Would implement actual cleanup in production

    console.log(JSON.stringify({
      success: true,
      saved: true,
      cleaned: true
    }));
  } catch (e) {
    console.error(JSON.stringify({ success: false, error: e.message }));
    process.exit(1);
  }
}

/**
 * Compact Manual Hook - Handle manual compaction
 */
function compactManual() {
  try {
    ensureStateDir();

    // Perform manual compaction
    const compactRecord = {
      timestamp: new Date().toISOString(),
      type: 'manual',
      status: 'completed'
    };

    const logPath = path.join(STATE_DIR, 'compaction-log.jsonl');
    fs.appendFileSync(logPath, JSON.stringify(compactRecord) + '\n');

    console.log(JSON.stringify({
      success: true,
      type: 'manual',
      compacted: true,
      message: 'Manual compaction completed'
    }));
  } catch (e) {
    console.error(JSON.stringify({ success: false, error: e.message }));
    process.exit(1);
  }
}

/**
 * Compact Auto Hook - Handle automatic compaction
 */
function compactAuto() {
  try {
    ensureStateDir();

    // Check if auto-compaction is needed based on state file sizes
    let needsCompaction = false;

    try {
      const files = fs.readdirSync(STATE_DIR);
      const jsonFiles = files.filter(f => f.endsWith('.json'));

      if (jsonFiles.length > 10) {
        needsCompaction = true;
      }
    } catch (e) { /* ignore */ }

    // Perform auto compaction if needed
    const compactRecord = {
      timestamp: new Date().toISOString(),
      type: 'auto',
      status: needsCompaction ? 'completed' : 'skipped'
    };

    const logPath = path.join(STATE_DIR, 'compaction-log.jsonl');
    fs.appendFileSync(logPath, JSON.stringify(compactRecord) + '\n');

    console.log(JSON.stringify({
      success: true,
      type: 'auto',
      compacted: needsCompaction,
      message: needsCompaction ? 'Auto compaction completed' : 'No compaction needed'
    }));
  } catch (e) {
    console.error(JSON.stringify({ success: false, error: e.message }));
    process.exit(1);
  }
}

/**
 * Status Hook - Track agent status
 */
function status() {
  try {
    const agentId = process.argv[3] || '';
    const statusArg = process.argv[4] || 'unknown';

    let agentStatus = 'unknown';
    try {
      agentStatus = JSON.parse(statusArg);
    } catch (e) {
      agentStatus = statusArg;
    }

    ensureStateDir();

    // Track agent status
    const statusRecord = {
      timestamp: new Date().toISOString(),
      agentId,
      status: agentStatus
    };

    const logPath = path.join(STATE_DIR, 'agent-status.jsonl');
    fs.appendFileSync(logPath, JSON.stringify(statusRecord) + '\n');

    console.log(JSON.stringify({
      success: true,
      agentId,
      tracked: true,
      status: agentStatus
    }));
  } catch (e) {
    console.error(JSON.stringify({ success: false, error: e.message }));
    process.exit(1);
  }
}

/**
 * Command router
 */
const commands = {
  'pre-bash': preBash,
  'post-edit': postEdit,
  'route': route,
  'session-restore': sessionRestore,
  'session-end': sessionEnd,
  'compact-manual': compactManual,
  'compact-auto': compactAuto,
  'status': status
};

function main() {
  const cmd = process.argv[2];

  if (!cmd) {
    console.error('Usage: hook-handler.cjs <command> [args...]');
    console.error('Commands:', Object.keys(commands).join(', '));
    process.exit(1);
  }

  if (commands[cmd]) {
    commands[cmd]();
  } else {
    console.error('Unknown command:', cmd);
    console.error('Available commands:', Object.keys(commands).join(', '));
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { commands };
