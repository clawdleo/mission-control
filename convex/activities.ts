import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const log = mutation({
  args: {
    action: v.string(),
    details: v.string(),
    category: v.string(),
    status: v.string(),
    metadata: v.optional(v.object({
      source: v.optional(v.string()),
      target: v.optional(v.string()),
      duration: v.optional(v.number()),
      tags: v.optional(v.array(v.string())),
    })),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("activities", {
      timestamp: Date.now(),
      ...args,
    });
  },
});

export const list = query({
  args: {
    limit: v.optional(v.number()),
    category: v.optional(v.string()),
    status: v.optional(v.string()),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;
    
    let q = ctx.db.query("activities");
    
    if (args.category) {
      q = ctx.db.query("activities").withIndex("by_category", (q) => q.eq("category", args.category!));
    }
    
    let activities = await q.order("desc").take(limit * 2);
    
    if (args.status) {
      activities = activities.filter(a => a.status === args.status);
    }
    if (args.startDate) {
      activities = activities.filter(a => a.timestamp >= args.startDate!);
    }
    if (args.endDate) {
      activities = activities.filter(a => a.timestamp <= args.endDate!);
    }
    
    return activities.slice(0, limit);
  },
});

export const stats = query({
  args: { hours: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const hours = args.hours ?? 24;
    const since = Date.now() - (hours * 60 * 60 * 1000);
    
    const activities = await ctx.db
      .query("activities")
      .withIndex("by_timestamp")
      .filter((q) => q.gte(q.field("timestamp"), since))
      .collect();
    
    const byCategory: Record<string, number> = {};
    const byStatus: Record<string, number> = {};
    
    for (const activity of activities) {
      byCategory[activity.category] = (byCategory[activity.category] || 0) + 1;
      byStatus[activity.status] = (byStatus[activity.status] || 0) + 1;
    }
    
    return {
      total: activities.length,
      byCategory,
      byStatus,
      successRate: activities.length > 0 
        ? Math.round((byStatus["success"] || 0) / activities.length * 100) 
        : 100,
    };
  },
});

export const cleanup = mutation({
  args: { olderThanDays: v.number() },
  handler: async (ctx, args) => {
    const cutoff = Date.now() - (args.olderThanDays * 24 * 60 * 60 * 1000);
    
    const oldActivities = await ctx.db
      .query("activities")
      .withIndex("by_timestamp")
      .filter((q) => q.lt(q.field("timestamp"), cutoff))
      .take(100);
    
    for (const activity of oldActivities) {
      await ctx.db.delete(activity._id);
    }
    
    return { deleted: oldActivities.length };
  },
});
