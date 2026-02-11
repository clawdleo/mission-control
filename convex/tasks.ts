import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const add = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    scheduledFor: v.number(),
    endTime: v.optional(v.number()),
    source: v.string(),
    sourceId: v.optional(v.string()),
    category: v.string(),
    priority: v.optional(v.string()),
    recurring: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("scheduledTasks", { ...args, completed: false });
  },
});

export const complete = mutation({
  args: {
    id: v.id("scheduledTasks"),
    completed: v.boolean(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { completed: args.completed });
  },
});

export const getForWeek = query({
  args: { weekStart: v.number() },
  handler: async (ctx, args) => {
    const weekEnd = args.weekStart + (7 * 24 * 60 * 60 * 1000);
    
    return await ctx.db
      .query("scheduledTasks")
      .withIndex("by_scheduled")
      .filter((q) => 
        q.and(
          q.gte(q.field("scheduledFor"), args.weekStart),
          q.lt(q.field("scheduledFor"), weekEnd)
        )
      )
      .collect();
  },
});

export const upcoming = query({
  args: {
    limit: v.optional(v.number()),
    includeCompleted: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 20;
    const now = Date.now();
    
    let tasks = await ctx.db
      .query("scheduledTasks")
      .withIndex("by_scheduled")
      .filter((q) => q.gte(q.field("scheduledFor"), now))
      .take(limit * 2);
    
    if (!args.includeCompleted) {
      tasks = tasks.filter(t => !t.completed);
    }
    
    return tasks.slice(0, limit);
  },
});

export const syncFromSource = mutation({
  args: {
    source: v.string(),
    tasks: v.array(v.object({
      title: v.string(),
      description: v.optional(v.string()),
      scheduledFor: v.number(),
      endTime: v.optional(v.number()),
      sourceId: v.string(),
      category: v.string(),
      priority: v.optional(v.string()),
      recurring: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("scheduledTasks")
      .withIndex("by_source")
      .filter((q) => q.eq(q.field("source"), args.source))
      .collect();
    
    const newIds = new Set(args.tasks.map(t => t.sourceId));
    let added = 0, updated = 0;
    
    for (const task of args.tasks) {
      const existingTask = existing.find(e => e.sourceId === task.sourceId);
      
      if (existingTask) {
        await ctx.db.patch(existingTask._id, { ...task });
        updated++;
      } else {
        await ctx.db.insert("scheduledTasks", { ...task, source: args.source, completed: false });
        added++;
      }
    }
    
    for (const existingTask of existing) {
      if (existingTask.sourceId && !newIds.has(existingTask.sourceId)) {
        await ctx.db.patch(existingTask._id, { completed: true });
      }
    }
    
    return { added, updated };
  },
});
