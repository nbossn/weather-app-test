/**
 * Status Line - Claude Code Status Display
 * Outputs a single-line status summary for the status bar
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Get memory usage percentage
 */
function getMemoryUsage() {
  try {
    if (process.platform === 'win32') {
      // Windows: use wmic
      const output = execSync('wmic OS get FreePhysicalMemory,TotalVisibleMemorySize /Value', { encoding: 'utf-8' });
      const lines = output.split('\n');
      let free = 0, total = 0;
      lines.forEach(line => {
        if (line.includes('FreePhysicalMemory=')) {
          free = parseInt(line.split('=')[1]) || 0;
        }
        if (line.includes('TotalVisibleMemorySize=')) {
          total = parseInt(line.split('=')[1]) || 0;
        }
      });
      if (total > 0) {
        const used = total - free;
        return Math.round((used / total) * 100);
      }
    } else {
      // Unix-like: read /proc/meminfo or use vm_stat on macOS
      if (fs.existsSync('/proc/meminfo')) {
        const meminfo = fs.readFileSync('/proc/meminfo', 'utf-8');
        const lines = meminfo.split('\n');
        let memTotal = 0, memAvailable = 0;
        lines.forEach(line => {
          if (line.startsWith('MemTotal:')) {
            memTotal = parseInt(line.split(/\s+/)[1]) || 0;
          }
          if (line.startsWith('MemAvailable:')) {
            memAvailable = parseInt(line.split(/\s+/)[1]) || 0;
          }
        });
        if (memTotal > 0) {
          const used = memTotal - memAvailable;
          return Math.round((used / memTotal) * 100);
        }
      }
    }
  } catch (e) {
    // Ignore errors, return null
  }
  return null;
}

/**
 * Get git branch and session info
 */
function getGitSession() {
  try {
    const cwd = process.cwd();
    // Check if it's a git repo
    execSync('git rev-parse --git-dir', { cwd, stdio: 'ignore' });
    const branch = execSync('git rev-parse --abbrev-ref HEAD', { cwd, encoding: 'utf-8' }).trim();

    // Get time since last commit (rough estimate via file modification)
    const lastCommit = execSync('git log -1 --format=%ct', { cwd, encoding: 'utf-8' }).trim();
    if (lastCommit) {
      const commitTime = parseInt(lastCommit) * 1000;
      const now = Date.now();
      const diffMs = now - commitTime;
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

      if (hours > 0) {
        return { branch, lastActive: `${hours}h` };
      } else if (minutes > 0) {
        return { branch, lastActive: `${minutes}m` };
      } else {
        return { branch, lastActive: 'now' };
      }
    }
    return { branch, lastActive: null };
  } catch (e) {
    return null;
  }
}

/**
 * Get swarm/agent status
 */
function getSwarmStatus() {
  try {
    // Check if there's a swarm active via claude-flow
    const result = execSync('npx claude-flow swarm status --json 2>/dev/null', {
      encoding: 'utf-8',
      timeout: 5000,
      stdio: ['pipe', 'pipe', 'ignore']
    }).trim();

    if (result) {
      const status = JSON.parse(result);
      if (status.active && status.agents > 0) {
        return { active: true, agents: status.agents };
      }
    }
  } catch (e) {
    // Claude Flow not available or no swarm
  }
  return { active: false, agents: 0 };
}

/**
 * Get task count from .claude/tasks
 */
function getTaskCount() {
  try {
    const tasksDir = path.join(process.cwd(), '.claude', 'tasks');
    if (fs.existsSync(tasksDir)) {
      const files = fs.readdirSync(tasksDir);
      const jsonFiles = files.filter(f => f.endsWith('.json'));
      return jsonFiles.length;
    }
  } catch (e) {
    // Ignore
  }
  return 0;
}

/**
 * Build and output status line
 */
function buildStatusLine() {
  const parts = [];

  // Swarm status
  const swarm = getSwarmStatus();
  if (swarm.active) {
    parts.push(`[swarm: ${swarm.agents} agents]`);
  } else {
    parts.push('[swarm: idle]');
  }

  // Memory usage
  const mem = getMemoryUsage();
  if (mem !== null) {
    parts.push(`[memory: ${mem}%]`);
  }

  // Git session info
  const session = getGitSession();
  if (session) {
    parts.push(`[branch: ${session.branch}]`);
    if (session.lastActive) {
      parts.push(`[active: ${session.lastActive}]`);
    }
  }

  // Task count
  const tasks = getTaskCount();
  if (tasks > 0) {
    parts.push(`[tasks: ${tasks}]`);
  }

  return parts.join(' ');
}

/**
 * Main
 */
function main() {
  try {
    const status = buildStatusLine();
    if (status) {
      console.log(status);
    } else {
      console.log('[status: ready]');
    }
  } catch (e) {
    // Graceful fallback - output nothing or simple default
    console.log('[status: ready]');
  }
}

if (require.main === module) {
  main();
}

module.exports = { getMemoryUsage, getGitSession, getSwarmStatus, buildStatusLine };
