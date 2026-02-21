import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const setTyping = mutation({
    args: {
        conversationId: v.id("conversations"),
        isTyping: v.boolean(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            return;
        }

        const clerkId = identity.subject;

        const existing = await ctx.db
            .query("typing")
            .withIndex("by_conversation", (q) => q.eq("conversationId", args.conversationId))
            .filter((q) => q.eq(q.field("clerkId"), clerkId))
            .first();

        if (args.isTyping) {
            if (existing) {
                await ctx.db.patch(existing._id, { updated: Date.now() });
            } else {
                await ctx.db.insert("typing", {
                    conversationId: args.conversationId,
                    clerkId,
                    updated: Date.now(),
                });
            }
        } else {
            if (existing) {
                await ctx.db.delete(existing._id);
            }
        }
    },
});

export const getTypingUsers = query({
    args: {
        conversationId: v.id("conversations"),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            return [];
        }

        const now = Date.now();
        const THRESHOLD = 5000; // 5 seconds

        const typingRecords = await ctx.db
            .query("typing")
            .withIndex("by_conversation", (q) => q.eq("conversationId", args.conversationId))
            .collect();

        // Filter out expired records and return the clerkIds
        return typingRecords
            .filter((record) => now - record.updated < THRESHOLD)
            .map((record) => record.clerkId);
    },
});
