/**
 * Workflow Trigger - Optimized Version
 * Event-driven workflow orchestration with robust error handling
 */

const { execSync, execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Default settings
const DEFAULT_SETTINGS = {
  'github-automation': {
    enabled: true,
    autoPush: true,
    autoPr: true,
    autoReview: true,
    autoDocs: true,
    branchPatterns: ['feature/*', 'fix/*', 'bugfix/*', 'hotfix/*'],
    autoPrLabels: ['automated', 'claude-flow']
  }
};

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
    console.log('  ℹ️ Using default settings');
  }
  return DEFAULT_SETTINGS;
}

/**
 * Check if branch matches patterns
 */
function isFeatureBranch(branch, patterns) {
  if (!branch || !patterns) return false;
  return patterns.some(pattern => {
    const regex = new RegExp('^' + pattern.replace('*', '.*') + '$');
    return regex.test(branch);
  });
}

/**
 * Get git info with error handling
 */
function getGitInfo(cwd = process.cwd()) {
  try {
    const branch = execFileSync('git', ['rev-parse', '--abbrev-ref', 'HEAD'], { cwd, encoding: 'utf-8' }).trim();
    const commit = execFileSync('git', ['rev-parse', 'HEAD'], { cwd, encoding: 'utf-8' }).trim();
    const commitMsg = execFileSync('git', ['log', '-1', '--pretty=%B'], { cwd, encoding: 'utf-8' }).trim();

    let remote = null;
    try {
      remote = execFileSync('git', ['remote', 'get-url', 'origin'], { cwd, encoding: 'utf-8' }).trim();
    } catch (e) { /* no remote */ }

    return { branch, commit, commitMsg, remote };
  } catch (e) {
    return null;
  }
}

/**
 * Create pull request
 */
function createPR(branch, baseBranch = 'main', title, body) {
  try {
    // Check if gh is available
    if (!commandExists('gh')) {
      console.log('  ⚠️ GitHub CLI not installed');
      return null;
    }

    // Check auth
    try {
      execFileSync('gh', ['auth', 'status'], { encoding: 'utf-8' });
    } catch (e) {
      console.log('  ⚠️ Run "gh auth login" to authenticate');
      return null;
    }

    // Check if PR exists
    try {
      execFileSync('gh', ['pr', 'view', branch], { encoding: 'utf-8' });
      console.log('  ℹ️ PR already exists');
      return null;
    } catch (e) { /* doesn't exist */ }

    // Create PR
    const result = execFileSync(
      'gh',
      ['pr', 'create', '--title', title, '--body', body, '--base', baseBranch],
      { encoding: 'utf-8' }
    ).trim();

    return { url: result, number: parseInt(result.split('/pull/')[1]) };
  } catch (e) {
    console.log('  ⚠️ PR creation failed:', e.message);
    return null;
  }
}

/**
 * Add labels to PR
 */
function addPRLabels(prNumber, labels) {
  try {
    if (!Number.isInteger(prNumber) || prNumber <= 0) return;
    execFileSync('gh', ['pr', 'edit', String(prNumber), '--add-label', labels.join(',')], { encoding: 'utf-8' });
  } catch (e) { /* ignore */ }
}

/**
 * Check if command exists
 */
function commandExists(cmd) {
  try {
    execFileSync('which', [cmd], { encoding: 'utf-8' });
    return true;
  } catch (e) {
    return false;
  }
}

const ALLOWED_AGENT_TYPES = new Set(['code-review-swarm', 'docs-generator']);

/**
 * Spawn agent with graceful failure
 */
function spawnAgent(agentType, context) {
  if (!ALLOWED_AGENT_TYPES.has(agentType)) {
    console.log(`  ⚠️ Agent type not permitted: ${agentType}`);
    return false;
  }

  if (!commandExists('npx')) {
    console.log('  ⚠️ npx not available');
    return false;
  }

  try {
    execFileSync(
      'npx',
      ['claude-flow', 'agent', 'spawn', '-t', agentType, '--context', JSON.stringify(context)],
      { stdio: 'inherit', timeout: 60000 }
    );
    return true;
  } catch (e) {
    console.log(`  ⚠️ ${agentType} not available`);
    return false;
  }
}

/**
 * Main workflow
 */
async function runWorkflow(options = {}) {
  const settings = loadSettings();
  const automation = settings['github-automation'] || {};

  // Check if enabled
  if (!automation.enabled) {
    console.log('GitHub automation disabled');
    return;
  }

  const event = options.event || 'manual';
  const branch = options.branch || 'unknown';
  const commit = options.commit || 'unknown';

  console.log(`🔄 Workflow: ${event} | ${branch} | ${commit.substring(0, 7)}`);

  const branchPatterns = automation.branchPatterns || ['feature/*', 'fix/*'];
  const isFeature = isFeatureBranch(branch, branchPatterns);

  const context = { event, branch, commit, timestamp: new Date().toISOString() };

  // PR creation (only if pushed)
  if (isFeature && automation.autoPr && event === 'push') {
    console.log('  📝 Creating PR...');
    const gitInfo = getGitInfo();
    if (gitInfo) {
      const title = `[${branch}] ${gitInfo.commitMsg.split('\n')[0]}`;
      const body = `Automated PR from Claude Flow.

## Summary
- Branch: ${branch}
- Commit: ${commit}

🤖 Generated with [claude-flow](https://github.com/ruvnet/claude-flow)`;

      const pr = createPR(branch, 'main', title, body);
      if (pr && pr.number) {
        addPRLabels(pr.number, automation.autoPrLabels || ['automated']);
        context.prNumber = pr.number;
      }
    }
  }

  // Code review (feature branches or PRs)
  if (automation.autoReview && (isFeature || event === 'pull_request')) {
    console.log('  🐝 Spawning code review...');
    spawnAgent('code-review-swarm', context);
  }

  // Docs generation (docs: commits)
  if (automation.autoDocs && event === 'push') {
    const gitInfo = getGitInfo();
    if (gitInfo && gitInfo.commitMsg.toLowerCase().startsWith('docs:')) {
      console.log('  📚 Generating docs...');
      spawnAgent('docs-generator', context);
    }
  }

  console.log('✅ Done');
}

/**
 * CLI
 */
function main() {
  const args = process.argv.slice(2);

  if (args.includes('--help')) {
    console.log('Usage: workflow-trigger.js --event <push|pr> --branch <name> --commit <hash>');
    process.exit(0);
  }

  const options = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--event' && args[i + 1]) options.event = args[++i];
    if (args[i] === '--branch' && args[i + 1]) options.branch = args[++i];
    if (args[i] === '--commit' && args[i + 1]) options.commit = args[++i];
  }

  runWorkflow(options).catch(console.error);
}

if (require.main === module) {
  main();
}

module.exports = { runWorkflow, isFeatureBranch };
