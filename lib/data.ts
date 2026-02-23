import { readFileSync, existsSync } from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface Project {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'planning';
  health: 'healthy' | 'warning' | 'critical';
  type: 'trading' | 'saas' | 'build';
  metrics: {
    revenue?: number;
    pnl?: number;
    progress?: number;
    uptime?: number;
  };
  lastActivity: string;
  nextMilestone?: string;
}

export interface System {
  id: string;
  name: string;
  type: 'bot' | 'cron' | 'deployment' | 'api';
  status: 'running' | 'stopped' | 'error';
  health: 'healthy' | 'degraded' | 'down';
  uptime?: string;
  lastCheck: string;
}

export interface Task {
  id: string;
  title: string;
  project?: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'todo' | 'in-progress' | 'blocked' | 'done';
  deadline?: string;
}

// Trading Bots Data
export async function getTradingBotsData(): Promise<Project[]> {
  const projects: Project[] = [];

  // Kalshi Weather Edge Bot
  try {
    const kalshiStatePath = '/home/clawd/clawd/projects/kalshi-bot/weather-state.json';
    if (existsSync(kalshiStatePath)) {
      const data = JSON.parse(readFileSync(kalshiStatePath, 'utf8'));
      const balance = data.paperBalance / 100;
      const pnl = data.stats.pnl / 100;
      const winRate = data.stats.total > 0 
        ? (data.stats.wins / data.stats.total * 100).toFixed(0) 
        : 0;

      projects.push({
        id: 'kalshi-bot',
        name: 'Kalshi Weather Edge',
        status: 'active',
        health: data.openPositions.length > 0 ? 'healthy' : 'warning',
        type: 'trading',
        metrics: {
          revenue: balance,
          pnl: pnl,
          uptime: data.stats.total,
        },
        lastActivity: data.openPositions[0]?.timestamp || new Date().toISOString(),
        nextMilestone: `${data.openPositions.length} positions settling`,
      });
    }
  } catch (e) {
    console.error('Error reading Kalshi data:', e);
  }

  // Crypto Bot
  try {
    const cryptoStatePath = '/home/clawd/clawd/projects/trading-bot/trader_state.json';
    if (existsSync(cryptoStatePath)) {
      const data = JSON.parse(readFileSync(cryptoStatePath, 'utf8'));
      const balance = parseFloat(data.wallet?.usdc_balance || '0');

      projects.push({
        id: 'crypto-bot',
        name: 'Crypto Trading Bot',
        status: 'active',
        health: balance > 30 ? 'healthy' : 'warning',
        type: 'trading',
        metrics: {
          revenue: balance,
          pnl: balance - 100,
        },
        lastActivity: data.last_check || new Date().toISOString(),
        nextMilestone: 'Waiting for entry signal',
      });
    }
  } catch (e) {
    console.error('Error reading crypto bot data:', e);
  }

  return projects;
}

// SaaS Projects Data
export async function getSaaSProjects(): Promise<Project[]> {
  return [
    {
      id: 'gazda',
      name: 'GAZDA',
      status: 'active',
      health: 'healthy',
      type: 'saas',
      metrics: {
        progress: 35,
      },
      lastActivity: new Date().toISOString(),
      nextMilestone: 'Business registration',
    },
    {
      id: 'patina',
      name: 'Patina',
      status: 'active',
      health: 'healthy',
      type: 'saas',
      metrics: {
        progress: 60,
      },
      lastActivity: new Date().toISOString(),
      nextMilestone: 'Valuation tool launch',
    },
    {
      id: 'verity',
      name: 'Verity V2',
      status: 'active',
      health: 'warning',
      type: 'saas',
      metrics: {
        progress: 20,
      },
      lastActivity: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      nextMilestone: 'Auth + Supabase',
    },
  ];
}

// Systems Status
export async function getSystemsStatus(): Promise<System[]> {
  const systems: System[] = [];

  // Check Kalshi bot process
  try {
    const { stdout } = await execAsync('pgrep -f "node weather-edge.js"');
    systems.push({
      id: 'kalshi-bot-process',
      name: 'Kalshi Weather Bot',
      type: 'bot',
      status: stdout.trim() ? 'running' : 'stopped',
      health: stdout.trim() ? 'healthy' : 'down',
      lastCheck: new Date().toISOString(),
    });
  } catch (e) {
    systems.push({
      id: 'kalshi-bot-process',
      name: 'Kalshi Weather Bot',
      type: 'bot',
      status: 'stopped',
      health: 'down',
      lastCheck: new Date().toISOString(),
    });
  }

  // Check crypto bot
  try {
    const { stdout } = await execAsync('pgrep -f "trading-bot"');
    systems.push({
      id: 'crypto-bot-process',
      name: 'Crypto Trading Bot',
      type: 'bot',
      status: stdout.trim() ? 'running' : 'stopped',
      health: stdout.trim() ? 'healthy' : 'down',
      lastCheck: new Date().toISOString(),
    });
  } catch (e) {
    systems.push({
      id: 'crypto-bot-process',
      name: 'Crypto Trading Bot',
      type: 'bot',
      status: 'stopped',
      health: 'down',
      lastCheck: new Date().toISOString(),
    });
  }

  // Cron jobs
  try {
    const { stdout } = await execAsync('openclaw cron list --json');
    const cronsData = JSON.parse(stdout);
    const crons = Array.isArray(cronsData) ? cronsData : (cronsData.jobs || []);
    
    for (const cron of crons.slice(0, 5)) {
      systems.push({
        id: cron.id,
        name: cron.name,
        type: 'cron',
        status: cron.enabled ? 'running' : 'stopped',
        health: cron.enabled ? 'healthy' : 'degraded',
        lastCheck: new Date(cron.updatedAtMs || Date.now()).toISOString(),
      });
    }
  } catch (e) {
    console.error('Error getting cron status:', e);
  }

  return systems;
}

// Tasks
export async function getTasks(): Promise<Task[]> {
  return [
    {
      id: '1',
      title: 'Build Mission Control dashboard',
      project: 'mission-control',
      priority: 'critical',
      status: 'in-progress',
      deadline: new Date().toISOString(),
    },
    {
      id: '2',
      title: 'GAZDA business registration',
      project: 'gazda',
      priority: 'high',
      status: 'todo',
    },
    {
      id: '3',
      title: 'Patina valuation tool marketing',
      project: 'patina',
      priority: 'medium',
      status: 'todo',
    },
  ];
}

// Aggregate all data
export async function getAllData() {
  const [tradingProjects, saasProjects, systems, tasks] = await Promise.all([
    getTradingBotsData(),
    getSaaSProjects(),
    getSystemsStatus(),
    getTasks(),
  ]);

  return {
    projects: [...tradingProjects, ...saasProjects],
    systems,
    tasks,
  };
}
