'use client';

import { Sidebar } from "@/components/Sidebar";
import { useState, useEffect } from "react";

interface Idea {
  id: string;
  title: string;
  description: string;
  source: string;
  sourceUrl?: string;
  upvotes?: number;
  comments?: number;
  status: 'new' | 'building' | 'built' | 'removed';
  createdAt: string;
  buildLog?: string[];
}

export default function IdeasPage() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [filter, setFilter] = useState<'all' | 'new' | 'building' | 'built'>('all');
  const [building, setBuilding] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/ideas')
      .then(res => res.json())
      .then(data => {
        setIdeas(data.ideas || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filteredIdeas = ideas.filter(idea => {
    if (idea.status === 'removed') return false;
    if (filter === 'all') return true;
    return idea.status === filter;
  });

  const stats = {
    total: ideas.filter(i => i.status !== 'removed').length,
    new: ideas.filter(i => i.status === 'new').length,
    building: ideas.filter(i => i.status === 'building').length,
    built: ideas.filter(i => i.status === 'built').length,
  };

  const handleBuild = async (idea: Idea) => {
    setBuilding(idea.id);
    
    try {
      const res = await fetch('/api/ideas/build', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ideaId: idea.id }),
      });
      
      if (res.ok) {
        setIdeas(prev => prev.map(i => 
          i.id === idea.id ? { ...i, status: 'building' as const } : i
        ));
      }
    } catch (e) {
      console.error('Failed to start build:', e);
    }
    
    setBuilding(null);
  };

  const handleRemove = async (ideaId: string) => {
    try {
      await fetch('/api/ideas/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ideaId }),
      });
      
      setIdeas(prev => prev.map(i => 
        i.id === ideaId ? { ...i, status: 'removed' as const } : i
      ));
    } catch (e) {
      console.error('Failed to remove idea:', e);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <Sidebar />
      
      <div className="ml-64 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-white">Ideas Dashboard</h1>
            <p className="text-gray-400 mt-1">Reddit problems → Product opportunities</p>
          </div>
          <div className="text-sm text-gray-500">
            Auto-scraped from Reddit
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-5 gap-4 mb-8">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 text-center">
            <div className="text-gray-400 text-xs uppercase tracking-wider mb-1">Total Ideas</div>
            <div className="text-2xl font-bold text-white">{stats.total}</div>
          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 text-center">
            <div className="text-gray-400 text-xs uppercase tracking-wider mb-1">New</div>
            <div className="text-2xl font-bold text-blue-400">{stats.new}</div>
          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 text-center">
            <div className="text-gray-400 text-xs uppercase tracking-wider mb-1">Building</div>
            <div className="text-2xl font-bold text-yellow-400">{stats.building}</div>
          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 text-center">
            <div className="text-gray-400 text-xs uppercase tracking-wider mb-1">Built</div>
            <div className="text-2xl font-bold text-green-400">{stats.built}</div>
          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 text-center">
            <div className="text-gray-400 text-xs uppercase tracking-wider mb-1">AI Builds</div>
            <div className="text-2xl font-bold text-purple-400">{stats.built}</div>
          </div>
        </div>

        {/* Ideas Queue */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-medium text-white">Ideas Queue</h2>
            <div className="flex gap-1">
              {(['all', 'new', 'building', 'built'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1 text-sm rounded capitalize transition ${
                    filter === f
                      ? 'bg-gray-600 text-white'
                      : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="text-center text-gray-500 py-8">Loading ideas...</div>
          ) : filteredIdeas.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No ideas yet. I'll scrape Reddit for opportunities!
            </div>
          ) : (
            <div className="space-y-4">
              {filteredIdeas.map((idea) => (
                <div
                  key={idea.id}
                  className="bg-gray-900 border border-gray-700 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-1 text-xs font-medium rounded bg-purple-500/20 text-purple-400">
                          ✨ Feature
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded ${
                          idea.status === 'new' ? 'bg-blue-500/20 text-blue-400' :
                          idea.status === 'building' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-green-500/20 text-green-400'
                        }`}>
                          {idea.status === 'new' ? 'New' : 
                           idea.status === 'building' ? 'Building...' : 'Built'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(idea.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      
                      <p className="text-white mb-3">{idea.description}</p>
                      
                      <div className="flex items-center gap-4 text-xs">
                        {idea.sourceUrl ? (
                          <a 
                            href={idea.sourceUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 hover:underline"
                          >
                            📎 {idea.source}
                          </a>
                        ) : (
                          <span className="text-gray-500">{idea.source}</span>
                        )}
                        {idea.upvotes && (
                          <span className="text-orange-400">
                            ⬆️ {idea.upvotes.toLocaleString()}
                          </span>
                        )}
                        {idea.comments && (
                          <span className="text-gray-400">
                            💬 {idea.comments}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 ml-4">
                      {idea.status === 'new' && (
                        <>
                          <button
                            onClick={() => handleBuild(idea)}
                            disabled={building === idea.id}
                            className="px-3 py-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white text-sm rounded flex items-center gap-1 transition"
                          >
                            {building === idea.id ? '⏳' : '🔨'} 
                            {building === idea.id ? 'Starting...' : 'Build It'}
                          </button>
                          <button
                            onClick={() => handleRemove(idea.id)}
                            className="px-3 py-1 bg-gray-700 hover:bg-red-600 text-gray-300 hover:text-white text-sm rounded transition"
                          >
                            ✕
                          </button>
                        </>
                      )}
                      {idea.status === 'building' && (
                        <span className="px-3 py-1 bg-yellow-600/20 text-yellow-400 text-sm rounded animate-pulse">
                          🔧 Building...
                        </span>
                      )}
                      {idea.status === 'built' && (
                        <span className="px-3 py-1 bg-green-600/20 text-green-400 text-sm rounded">
                          ✅ Complete
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
