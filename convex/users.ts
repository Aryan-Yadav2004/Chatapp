import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const store = mutation({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Called storeUser without authentication present");
        }

        const name = identity.name ?? identity.nickname ?? identity.email?.split("@")[0] ?? "Unknown User";
        const email = identity.email ?? "";
        const avatarUrl = identity.pictureUrl ?? "";

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (user !== null) {
            if (
                user.name !== name ||
                user.avatarUrl !== avatarUrl ||
                user.email !== email
            ) {
                await ctx.db.patch(user._id, {
                    name,
                    avatarUrl,
                    email,
                });
            }
            return user._id;
        }

        return await ctx.db.insert("users", {
            name,
            avatarUrl,
            email,
            clerkId: identity.subject,
        });
    },
});

export const getUsers = query({
    args: {
        searchTerm: v.optional(v.string())
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            return [];
        }

        let users = await ctx.db.query("users").collect();

        // Filter out the current user
        users = users.filter((user) => user.clerkId !== identity.subject);

        // Filter by search term if provided
        if (args.searchTerm) {
            const term = args.searchTerm.toLowerCase();
            users = users.filter((user) => user.name.toLowerCase().includes(term));
        }

        return users;
    },
});

export const getAll = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("users").collect();
    }
});

export const getUsersByIds = query({
    args: {
        clerkIds: v.array(v.string())
    },
    handler: async (ctx, args) => {
        const users = await Promise.all(
            args.clerkIds.map(id =>
                ctx.db
                    .query("users")
                    .withIndex("by_clerk_id", (q) => q.eq("clerkId", id))
                    .unique()
            )
        );

        // Filter out nulls and format as a dictionary
        return users.reduce((acc: Record<string, any>, user) => {
            if (user) {
                acc[user.clerkId] = user;
            }
            return acc;
        }, {});
    }
});
