import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const indexDocument = mutation({
  args: {
    path: v.string(),
    title: v.string(),
    content: v.string(),
    type: v.string(),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("documents")
      .withIndex("by_path")
      .filter((q) => q.eq(q.field("path"), args.path))
      .first();
    
    const contentPreview = args.content.slice(0, 500);
    
    if (existing) {
      await ctx.db.patch(existing._id, {
        title: args.title,
        content: args.content,
        contentPreview,
        type: args.type,
        lastModified: Date.now(),
        tags: args.tags,
      });
      return existing._id;
    }
    
    return await ctx.db.insert("documents", {
      path: args.path,
      title: args.title,
      content: args.content,
      contentPreview,
      type: args.type,
      lastModified: Date.now(),
      tags: args.tags,
    });
  },
});

export const search = query({
  args: {
    query: v.string(),
    type: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 20;
    
    let results = await ctx.db
      .query("documents")
      .withSearchIndex("search_content", (q) => {
        let search = q.search("content", args.query);
        if (args.type) {
          search = search.eq("type", args.type);
        }
        return search;
      })
      .take(limit);
    
    return results.map(doc => ({
      ...doc,
      content: undefined,
    }));
  },
});

export const getByPath = query({
  args: { path: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("documents")
      .withIndex("by_path")
      .filter((q) => q.eq(q.field("path"), args.path))
      .first();
  },
});

export const listByType = query({
  args: {
    type: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;
    
    return await ctx.db
      .query("documents")
      .withIndex("by_type")
      .filter((q) => q.eq(q.field("type"), args.type))
      .order("desc")
      .take(limit);
  },
});

export const remove = mutation({
  args: { path: v.string() },
  handler: async (ctx, args) => {
    const doc = await ctx.db
      .query("documents")
      .withIndex("by_path")
      .filter((q) => q.eq(q.field("path"), args.path))
      .first();
    
    if (doc) {
      await ctx.db.delete(doc._id);
      return true;
    }
    return false;
  },
});
