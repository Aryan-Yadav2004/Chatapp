import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    avatarUrl: v.string(),
    clerkId: v.string(),
  }).index("by_clerk_id", ["clerkId"]),

  conversations: defineTable({
    participantOne: v.string(), // Clerk ID
    participantTwo: v.string(), // Clerk ID
  })
    .index("by_participantOne", ["participantOne"])
    .index("by_participantTwo", ["participantTwo"]),

  messages: defineTable({
    conversationId: v.id("conversations"),
    sender: v.string(), // Clerk ID
    content: v.string(),
  }).index("by_conversation", ["conversationId"]),
  presence: defineTable({
    clerkId: v.string(),
    updated: v.number(),
  }).index("by_clerk_id", ["clerkId"]),
});
