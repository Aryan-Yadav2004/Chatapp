import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const store = mutation({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Called storeUser without authentication present");
        }

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (user !== null) {
            if (
                user.name !== identity.name ||
                user.avatarUrl !== identity.pictureUrl ||
                user.email !== identity.email
            ) {
                await ctx.db.patch(user._id, {
                    name: identity.name!,
                    avatarUrl: identity.pictureUrl!,
                    email: identity.email!,
                });
            }
            return user._id;
        }

        return await ctx.db.insert("users", {
            name: identity.name!,
            avatarUrl: identity.pictureUrl!,
            email: identity.email!,
            clerkId: identity.subject,
        });
    },
});
