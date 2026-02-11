import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Activity Feed - logs every action Leo takes
  activities: defineTable({
    timestamp: v.number(),
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
  })
    .index("by_timestamp", ["timestamp"])
    .index("by_category", ["category"])
    .index("by_status", ["status"]),

  // Scheduled tasks from cron and Trello
  scheduledTasks: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    scheduledFor: v.number(),
    endTime: v.optional(v.number()),
    source: v.string(),
    sourceId: v.optional(v.string()),
    category: v.string(),
    priority: v.optional(v.string()),
    completed: v.boolean(),
    recurring: v.optional(v.string()),
  })
    .index("by_scheduled", ["scheduledFor"])
    .index("by_source", ["source"])
    .index("by_completed", ["completed"]),

  // Search index for memory and documents
  documents: defineTable({
    path: v.string(),
    title: v.string(),
    content: v.string(),
    contentPreview: v.string(),
    type: v.string(),
    lastModified: v.number(),
    tags: v.optional(v.array(v.string())),
  })
    .index("by_path", ["path"])
    .index("by_type", ["type"])
    .index("by_lastModified", ["lastModified"])
    .searchIndex("search_content", {
      searchField: "content",
      filterFields: ["type"],
    }),
});
