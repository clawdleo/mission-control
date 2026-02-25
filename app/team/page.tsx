import { Sidebar } from "@/components/Sidebar";

interface Agent {
  id: string;
  name: string;
  role: string;
  description: string;
  model: string;
  tags: string[];
  color: string;
  emoji: string;
  capabilities: string;
  status: 'active' | 'idle';
}

const agents: Agent[] = [
  {
    id: 'leo',
    name: 'Leo',
    role: 'Main Orchestrator',
    description: 'Primary execution lead - owns mission flow, drives daily momentum. Coordinates all sub-agents, maintains context, and ensures objectives move end-to-end.',
    model: 'claude-opus-4-5',
    tags: ['Orchestration', 'Strategy', 'Decisions'],
    color: 'from-orange-500 to-yellow-500',
    emoji: '🦁',
    capabilities: 'Full system access. Spawns and coordinates sub-agents. Maintains memory and context across sessions.',
    status: 'active',
  },
  {
    id: 'builder',
    name: 'Builder',
    role: 'Technical Dev',
    description: 'Technical development, prototypes, bug fixes, and code shipping. Autonomously builds features, fixes bugs, and creates PRs. Scopes work and monitors service health.',
    model: 'claude-sonnet-4-5',
    tags: ['Coding', 'Shipping', 'Quality'],
    color: 'from-blue-500 to-cyan-500',
    emoji: '🔧',
    capabilities: 'Full code access. Git operations. Deployment triggers. Can build and ship autonomously.',
    status: 'idle',
  },
  {
    id: 'researcher',
    name: 'Researcher',
    role: 'Market Intelligence',
    description: 'Market intelligence, research, and trend discovery. Autonomously researches topics, discovers opportunities, and surfaces important signals.',
    model: 'claude-sonnet-4-5',
    tags: ['Research', 'Trends', 'Analysis'],
    color: 'from-purple-500 to-pink-500',
    emoji: '🔍',
    capabilities: 'Web search. Data aggregation. Report generation. Competitive analysis.',
    status: 'idle',
  },
  {
    id: 'writer',
    name: 'Writer',
    role: 'Content Ops',
    description: 'Content execution engine for social posts, carousels, blogs, and scripts. Transforms strategy into production-ready content across all channels.',
    model: 'claude-sonnet-4-5',
    tags: ['Content', 'Carousels', 'Copy'],
    color: 'from-green-500 to-emerald-500',
    emoji: '✍️',
    capabilities: 'Content creation. Carousel design specs. Hook writing. Brand voice consistency.',
    status: 'idle',
  },
  {
    id: 'analyst',
    name: 'Analyst',
    role: 'Data & Trading',
    description: 'Data analysis, trading decisions, and quantitative work. Analyzes markets, backtests strategies, and provides data-driven insights.',
    model: 'claude-opus-4-5',
    tags: ['Data', 'Trading', 'Quant'],
    color: 'from-red-500 to-orange-500',
    emoji: '📊',
    capabilities: 'Market data access. Trading bot control. Backtesting. Financial analysis.',
    status: 'idle',
  },
  {
    id: 'scout',
    name: 'Scout',
    role: 'Assistant',
    description: 'Executive assistant - tracks todos, follow-ups, and pipelines. Runs check-ins, surfaces overdue items, and maintains tracking systems.',
    model: 'claude-sonnet-4-5',
    tags: ['Tracking', 'Reminders', 'Pipeline'],
    color: 'from-indigo-500 to-violet-500',
    emoji: '📋',
    capabilities: 'Task tracking. Reminder scheduling. Pipeline management. Status reports.',
    status: 'idle',
  },
];

export default function TeamPage() {
  return (
    <div className="min-h-screen bg-gray-900">
      <Sidebar />
      
      {/* Main Content */}
      <div className="ml-64 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-white">Team</h1>
            <p className="text-gray-400 mt-1">Leo's sub-agent specialists</p>
          </div>
          <div className="text-sm text-gray-500">
            {agents.filter(a => a.status === 'active').length} active · {agents.filter(a => a.status === 'idle').length} idle
          </div>
        </div>

        {/* Agents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map((agent) => (
            <div
              key={agent.id}
              className="bg-gray-800 border border-gray-700 rounded-xl p-6 hover:border-gray-600 transition"
            >
              {/* Header */}
              <div className="flex items-start gap-4 mb-4">
                <div className="relative">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${agent.color} flex items-center justify-center text-2xl`}>
                    {agent.emoji}
                  </div>
                  {/* Status indicator */}
                  <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-gray-800 ${
                    agent.status === 'active' ? 'bg-green-500' : 'bg-gray-500'
                  }`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-white">
                      {agent.name}
                    </h3>
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      agent.status === 'active' 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-gray-500/20 text-gray-400'
                    }`}>
                      {agent.status === 'active' ? '● Active' : '○ Idle'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400">{agent.role}</p>
                  <p className="text-xs text-gray-500 mt-1">{agent.model}</p>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {agent.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Description */}
              <p className="text-sm text-gray-400 mb-4 leading-relaxed">
                {agent.description}
              </p>

              {/* Capabilities */}
              <div className="pt-4 border-t border-gray-700">
                <p className="text-xs text-gray-500">
                  {agent.capabilities}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Note */}
        <div className="mt-8 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
          <p className="text-sm text-gray-400">
            <span className="text-yellow-500">💡</span> When Leo spawns a sub-agent for a task, 
            he selects the most appropriate specialist based on the work required. 
            Sub-agents run in isolated sessions and report results back to Leo.
          </p>
        </div>
      </div>
    </div>
  );
}
