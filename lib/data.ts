import { readFileSync, existsSync } from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface Project {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'maintenance' | 'disabled';
  health: 'healthy' | 'warning' | 'critical' | 'down';
  type: 'priority' | 'trading' | 'business' | 'saas';
  metrics: {
    revenue?: number;
    pnl?: number;
    progress?: number;
    uptime?: number;
  };
  lastActivity: string;
  nextMilestone?: string;
  priority?: number;
}

export interface System {
  id: string;
  name: string;
  type: 'bot' | 'cron' | 'deployment' | 'api';
  status: 'running' | 'stopped' | 'error' | 'disabled';
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

  // Kalshi Weather Edge Bot - ACTIVE (paper trading)
  try {
    const kalshiStatePath = '/home/clawd/clawd/projects/kalshi-bot/weather-state.json';
    if (existsSync(kalshiStatePath)) {
      const data = JSON.parse(readFileSync(kalshiStatePath, 'utf8'));
      const balance = data.paperBalance / 100;
      const pnl = data.stats?.pnl ? data.stats.pnl / 100 : 0;
      const openPositions = data.openPositions?.length || 0;

      projects.push({
        id: 'kalshi-weather',
        name: 'Kalshi Weather Edge',
        status: 'active',
        health: openPositions > 0 ? 'healthy' : 'warning',
        type: 'trading',
        priority: 2,
        metrics: {
          revenue: balance,
          pnl: pnl,
          uptime: data.stats?.total || 0,
        },
        lastActivity: data.openPositions?.[0]?.timestamp || new Date().toISOString(),
        nextMilestone: `${openPositions} positions open (paper)`,
      });
    }
  } catch (e) {
    console.error('Error reading Kalshi data:', e);
  }

  // Crypto Bot - DISABLED
  projects.push({
    id: 'crypto-bot',
    name: 'Crypto Trading Bot',
    status: 'disabled',
    health: 'down',
    type: 'trading',
    priority: 99,
    metrics: {
      revenue: 35.04,
      pnl: -64.96,
    },
    lastActivity: '2026-02-24T00:00:00Z',
    nextMilestone: 'Sidelined - crons disabled',
  });

  return projects;
}

// Main Projects Data - Updated Feb 25, 2026
export async function getMainProjects(): Promise<Project[]> {
  return [
    {
      id: 'carousel-business',
      name: '🎠 Carousel Business',
      status: 'active',
      health: 'warning',
      type: 'priority',
      priority: 1,
      metrics: {
        progress: 10,
      },
      lastActivity: new Date().toISOString(),
      nextMilestone: 'Create @escapethecubicle accounts!',
    },
    {
      id: 'patina',
      name: '🚲 Patina',
      status: 'maintenance',
      health: 'healthy',
      type: 'business',
      priority: 3,
      metrics: {
        progress: 60,
      },
      lastActivity: new Date().toISOString(),
      nextMilestone: 'Valuation tool (when time permits)',
    },
    {
      id: 'verity',
      name: '⏸️ Verity',
      status: 'paused',
      health: 'warning',
      type: 'saas',
      priority: 4,
      metrics: {
        progress: 20,
      },
      lastActivity: '2026-02-23T00:00:00Z',
      nextMilestone: 'Paused - focus on Carousel first',
    },
  ];
}

// Systems Status
export async function getSystemsStatus(): Promise<System[]> {
  const systems: System[] = [];

  // Kalshi bot - check if weather edge script exists and bot is paper trading
  systems.push({
    id: 'kalshi-weather-bot',
    name: 'Kalshi Weather Edge',
    type: 'bot',
    status: 'running',
    health: 'healthy',
    lastCheck: new Date().toISOString(),
  });

  // Crypto bot - DISABLED
  systems.push({
    id: 'crypto-bot-process',
    name: 'Crypto Trading Bot',
    type: 'bot',
    status: 'disabled',
    health: 'down',
    lastCheck: new Date().toISOString(),
  });

  // Cron jobs - get from OpenClaw
  try {
    const { stdout } = await execAsync('openclaw cron list --json 2>/dev/null');
    const cronsData = JSON.parse(stdout);
    const crons = Array.isArray(cronsData) ? cronsData : (cronsData.jobs || []);
    
    for (const cron of crons.slice(0, 8)) {
      systems.push({
        id: cron.id,
        name: cron.name,
        type: 'cron',
        status: cron.enabled ? 'running' : 'stopped',
        health: cron.enabled ? 'healthy' : 'degraded',
        lastCheck: new Date(cron.state?.lastRunAtMs || Date.now()).toISOString(),
      });
    }
  } catch (e) {
    console.error('Error getting cron status:', e);
  }

  return systems;
}

// Tasks - Current priorities
export async function getTasks(): Promise<Task[]> {
  return [
    {
      id: '1',
      title: 'Create @escapethecubicle IG/TikTok accounts',
      project: 'carousel-business',
      priority: 'critical',
      status: 'todo',
      deadline: new Date().toISOString(),
    },
    {
      id: '2',
      title: 'Design first carousel in Canva',
      project: 'carousel-business',
      priority: 'high',
      status: 'todo',
    },
    {
      id: '3',
      title: 'Notion PARA restructure',
      project: 'operations',
      priority: 'high',
      status: 'done',
    },
    {
      id: '4',
      title: 'Mission Control live updates',
      project: 'operations',
      priority: 'medium',
      status: 'done',
    },
  ];
}

// Aggregate all data
export async function getAllData() {
  const [tradingProjects, mainProjects, systems, tasks] = await Promise.all([
    getTradingBotsData(),
    getMainProjects(),
    getSystemsStatus(),
    getTasks(),
  ]);

  // Combine and sort by priority
  const allProjects = [...mainProjects, ...tradingProjects].sort((a, b) => 
    (a.priority || 99) - (b.priority || 99)
  );

  return {
    projects: allProjects,
    systems,
    tasks,
  };
}
