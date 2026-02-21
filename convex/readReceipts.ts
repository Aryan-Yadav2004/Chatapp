import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const markRead = mutation({
    args: {
        conversationId: v.id("conversations"),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            return;
        }

        const clerkId = identity.subject;

        const existing = await ctx.db
            .query("readReceipts")
            .withIndex("by_conversation_and_clerk", (q) =>
                q.eq("conversationId", args.conversationId).eq("clerkId", clerkId)
            )
            .unique();

        if (existing) {
            await ctx.db.patch(existing._id, { lastReadTime: Date.now() });
        } else {
            await ctx.db.insert("readReceipts", {
                conversationId: args.conversationId,
                clerkId,
                lastReadTime: Date.now(),
            });
        }
    },
});

export const getUnreadCounts = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            return {};
        }

        const clerkId = identity.subject;

        // 1. Get all conversations for the user
        const conversations = await ctx.db
            .query("conversations")
            .filter((q) =>
                q.or(
                    q.eq(q.field("participantOne"), clerkId),
                    q.eq(q.field("participantTwo"), clerkId)
                )
            )
            .collect();

        const unreadCounts: Record<string, number> = {};

        // 2. For each conversation, calculate unread messages
        for (const conv of conversations) {
            // Determine the OTHER participant's clerkId
            const otherClerkId = conv.participantOne === clerkId ? conv.participantTwo : conv.participantOne;

            // Get the user's read receipt for this conversation
            const receipt = await ctx.db
                .query("readReceipts")
                .withIndex("by_conversation_and_clerk", (q) =>
                    q.eq("conversationId", conv._id).eq("clerkId", clerkId)
                )
                .unique();

            const lastReadTime = receipt ? receipt.lastReadTime : 0;

            // Count messages in this conversation created AFTER lastReadTime
            // and NOT sent by the current user
            const messages = await ctx.db
                .query("messages")
                .withIndex("by_conversation", (q) => q.eq("conversationId", conv._id))
                .collect();

            let count = 0;
            for (const msg of messages) {
                if (msg._creationTime > lastReadTime && msg.sender !== clerkId) {
                    count++;
                }
            }

            // Map the count to the OTHER participant's clerkId so UserList can easily match it
            unreadCounts[otherClerkId] = count;
        }

        return unreadCounts;
    },
});
