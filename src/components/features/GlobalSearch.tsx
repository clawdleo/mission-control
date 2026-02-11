"use client";

import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { 
  Search, 
  FileText, 
  Brain, 
  Calendar,
  Trello,
  ExternalLink,
  ChevronRight,
  Clock,
  Tag
} from "lucide-react";
import { clsx } from "clsx";

const typeConfig: Record<string, { icon: any; color: string; label: string }> = {
  memory: { icon: Brain, color: "text-pink-400 bg-pink-500/10", label: "Memory" },
  note: { icon: FileText, color: "text-blue-400 bg-blue-500/10", label: "Note" },
  log: { icon: Calendar, color: "text-green-400 bg-green-500/10", label: "Log" },
  config: { icon: FileText, color: "text-orange-400 bg-orange-500/10", label: "Config" },
  trello: { icon: Trello, color: "text-sky-400 bg-sky-500/10", label: "Trello" },
};

interface GlobalSearchProps {
  initialQuery?: string;
}

export function GlobalSearch({ initialQuery = "" }: GlobalSearchProps) {
  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [selectedType, setSelectedType] = useState<string>("all");

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const searchResults = useQuery(
    api.search.search,
    debouncedQuery.length >= 2
      ? {
          query: debouncedQuery,
          type: selectedType === "all" ? undefined : selectedType,
          limit: 50,
        }
      : "skip"
  );

  const recentDocs = useQuery(api.search.listByType, {
    type: "memory",
    limit: 10,
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Search Header */}
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search memory, notes, tasks, and more..."
              autoFocus
              className="w-full pl-12 pr-4 py-4 bg-slate-800/50 border border-slate-700/50 rounded-xl 
                         text-white text-lg placeholder-slate-500 focus:outline-none focus:border-primary-500/50 
                         focus:ring-2 focus:ring-primary-500/20 transition-all"
            />
          </div>
        </div>

        {/* Type Filters */}
        <div className="flex flex-wrap gap-2 mt-4">
          <FilterButton
            active={selectedType === "all"}
            onClick={() => setSelectedType("all")}
          >
            All
          </FilterButton>
          {Object.entries(typeConfig).map(([type, config]) => {
            const Icon = config.icon;
            return (
              <FilterButton
                key={type}
                active={selectedType === type}
                onClick={() => setSelectedType(type)}
              >
                <Icon className="w-4 h-4" />
                {config.label}
              </FilterButton>
            );
          })}
        </div>
      </div>

      {/* Search Results */}
      {debouncedQuery.length >= 2 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">
              {searchResults?.length ?? 0} results for &quot;{debouncedQuery}&quot;
            </h2>
          </div>

          {searchResults && searchResults.length > 0 ? (
            <div className="space-y-3">
              {searchResults.map((result) => (
                <SearchResultCard key={result._id} result={result} query={debouncedQuery} />
              ))}
            </div>
          ) : (
            <div className="glass rounded-2xl p-12 text-center">
              <Search className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No results found</h3>
              <p className="text-slate-400">
                Try different keywords or check your filters
              </p>
            </div>
          )}
        </div>
      ) : (
        /* Recent & Suggested */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Memory Files */}
          <div className="glass rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-slate-400" />
              Recent Memory
            </h2>
            <div className="space-y-2">
              {recentDocs?.slice(0, 5).map((doc) => (
                <div
                  key={doc._id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 transition-colors cursor-pointer"
                >
                  <Brain className="w-5 h-5 text-pink-400" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{doc.title}</p>
                    <p className="text-xs text-slate-500">{doc.path}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </div>
              ))}
              {!recentDocs?.length && (
                <div className="text-center py-6 text-slate-500 text-sm">
                  No memory files indexed yet
                </div>
              )}
            </div>
          </div>

          {/* Quick Search Suggestions */}
          <div className="glass rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Search className="w-5 h-5 text-slate-400" />
              Quick Searches
            </h2>
            <div className="space-y-2">
              {[
                { query: "today's tasks", icon: Calendar },
                { query: "important notes", icon: FileText },
                { query: "MEMORY.md", icon: Brain },
                { query: "email actions", icon: Trello },
                { query: "heartbeat", icon: Clock },
              ].map((suggestion) => {
                const Icon = suggestion.icon;
                return (
                  <button
                    key={suggestion.query}
                    onClick={() => setQuery(suggestion.query)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 transition-colors text-left"
                  >
                    <Icon className="w-5 h-5 text-primary-400" />
                    <span className="text-sm text-white">{suggestion.query}</span>
                    <ChevronRight className="w-4 h-4 text-slate-500 ml-auto" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FilterButton({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
        active
          ? "bg-primary-500/20 text-primary-400 border border-primary-500/30"
          : "bg-slate-700/30 text-slate-400 hover:bg-slate-700/50 border border-transparent"
      )}
    >
      {children}
    </button>
  );
}

interface SearchResultCardProps {
  result: any;
  query: string;
}

function SearchResultCard({ result, query }: SearchResultCardProps) {
  const config = typeConfig[result.type] || typeConfig.note;
  const Icon = config.icon;

  // Highlight matching text
  const highlightText = (text: string) => {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, "gi");
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="bg-primary-500/30 text-primary-300 rounded px-0.5">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div className="glass rounded-xl p-4 hover:bg-slate-700/30 transition-all cursor-pointer group">
      <div className="flex items-start gap-4">
        <div className={clsx("p-2 rounded-lg", config.color)}>
          <Icon className="w-5 h-5" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-medium text-white">
              {highlightText(result.title)}
            </h3>
            <span className={clsx(
              "px-2 py-0.5 rounded-full text-xs font-medium",
              config.color
            )}>
              {config.label}
            </span>
          </div>
          
          <p className="text-sm text-slate-400 mb-2 line-clamp-2">
            {highlightText(result.contentPreview)}
          </p>
          
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <FileText className="w-3 h-3" />
              {result.path}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatDate(result.lastModified)}
            </span>
            {result.tags && result.tags.length > 0 && (
              <span className="flex items-center gap-1">
                <Tag className="w-3 h-3" />
                {result.tags.slice(0, 3).join(", ")}
              </span>
            )}
          </div>
        </div>

        <ExternalLink className="w-5 h-5 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </div>
  );
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
