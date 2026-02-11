"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ReactNode, useMemo } from "react";

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  
  const client = useMemo(() => {
    if (!convexUrl) return null;
    return new ConvexReactClient(convexUrl);
  }, [convexUrl]);

  if (!client) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-900 to-slate-950">
        <div className="glass rounded-2xl p-8 max-w-md text-center">
          <div className="text-4xl mb-4">🚀</div>
          <h1 className="text-2xl font-bold text-white mb-4">Mission Control</h1>
          <p className="text-slate-400 mb-4">
            Convex is not configured. Run the following to set up:
          </p>
          <div className="bg-slate-800/50 rounded-lg p-4 text-left font-mono text-sm text-primary-400">
            npx convex dev
          </div>
          <p className="text-xs text-slate-500 mt-4">
            Then set NEXT_PUBLIC_CONVEX_URL in your environment
          </p>
        </div>
      </div>
    );
  }

  return <ConvexProvider client={client}>{children}</ConvexProvider>;
}
