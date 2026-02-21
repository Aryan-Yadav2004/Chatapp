import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const heartbeat = mutation({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            return;
        }

        const clerkId = identity.subject;

        const existing = await ctx.db
            .query("presence")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
            .unique();

        if (existing) {
            await ctx.db.patch(existing._id, { updated: Date.now() });
        } else {
            await ctx.db.insert("presence", { clerkId, updated: Date.now() });
        }
    },
});

export const getOnlineUsers = query({
    args: { clerkIds: v.array(v.string()) },
    handler: async (ctx, args) => {
        const now = Date.now();
        const THRESHOLD = 30000; // 30 seconds

        const onlineStatuses: Record<string, boolean> = {};

        for (const clerkId of args.clerkIds) {
            const presence = await ctx.db
                .query("presence")
                .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
                .unique();

            if (presence && now - presence.updated < THRESHOLD) {
                onlineStatuses[clerkId] = true;
            } else {
                onlineStatuses[clerkId] = false;
            }
        }

        return onlineStatuses;
    },
});
