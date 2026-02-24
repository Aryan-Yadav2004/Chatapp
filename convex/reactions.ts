import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Toggles a reaction. If the user already reacted with this emoji, it removes it.
export const toggleReaction = mutation({
    args: {
        messageId: v.id("messages"),
        reaction: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Unauthorized");
        }

        const clerkId = identity.subject;

        // Check if the user has *any* reaction on this message
        const existingReaction = await ctx.db
            .query("reactions")
            .withIndex("by_message", (q) => q.eq("messageId", args.messageId))
            .filter((q) => q.eq(q.field("clerkId"), clerkId))
            .first();

        if (existingReaction) {
            if (existingReaction.reaction === args.reaction) {
                // If they clicked the exact same reaction, remove it (toggle off)
                await ctx.db.delete(existingReaction._id);
            } else {
                // If they clicked a different reaction, replace the old one
                await ctx.db.patch(existingReaction._id, { reaction: args.reaction });
            }
            return;
        }

        // Otherwise, insert the new reaction
        await ctx.db.insert("reactions", {
            messageId: args.messageId,
            clerkId,
            reaction: args.reaction,
        });
    },
});

export const getMessageReactions = query({
    args: {
        messageId: v.id("messages"),
    },
    handler: async (ctx, args) => {
        const reactions = await ctx.db
            .query("reactions")
            .withIndex("by_message", (q) => q.eq("messageId", args.messageId))
            .collect();

        return reactions;
    }
});
