import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getOrCreateConversation = mutation({
    args: {
        otherUserId: v.string(), // The clerkId of the other user
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Unauthorized");
        }

        const myId = identity.subject;
        const { otherUserId } = args;

        if (myId === otherUserId) {
            throw new Error("Cannot create conversation with yourself");
        }

        // Fetch all conversations
        const allConversations = await ctx.db.query("conversations").collect();

        // Find an existing one-on-one conversation between these two exact users
        const existingConversation = allConversations.find(
            (conv) => {
                const parts = conv.participants || [];
                return !conv.isGroup &&
                    parts.length === 2 &&
                    parts.includes(myId) &&
                    parts.includes(otherUserId)
            }
        );

        if (existingConversation) {
            return existingConversation._id;
        }

        // Create a new direct conversation
        const newConversationId = await ctx.db.insert("conversations", {
            isGroup: false,
            participants: [myId, otherUserId],
        });

        return newConversationId;
    },
});

export const createGroup = mutation({
    args: {
        name: v.string(),
        members: v.array(v.string()), // Array of clerkIds
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Unauthorized");
        }

        const myId = identity.subject;

        // Ensure the creator is in the members array
        const finalMembers = args.members.includes(myId)
            ? args.members
            : [...args.members, myId];

        const newConversationId = await ctx.db.insert("conversations", {
            isGroup: true,
            groupName: args.name,
            participants: finalMembers,
        });

        return newConversationId;
    }
});

export const getUserConversations = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            return [];
        }

        const myId = identity.subject;

        // Fetch all conversations and filter to ones where this user is a participant
        const allConversations = await ctx.db.query("conversations").collect();
        const myConversations = allConversations.filter(
            (conv) => (conv.participants || []).includes(myId)
        );

        // For each conversation, fetch details
        const conversationsWithDetails = await Promise.all(
            myConversations.map(async (conv) => {
                let otherUser = null;

                if (!conv.isGroup) {
                    // For 1-on-1, find the other participant
                    const parts = conv.participants || [];
                    const otherUserId = parts.find((id) => id !== myId);
                    if (otherUserId) {
                        otherUser = await ctx.db
                            .query("users")
                            .withIndex("by_clerk_id", (q) => q.eq("clerkId", otherUserId))
                            .unique();
                    }
                }

                // Fetch latest message
                const latestMessage = await ctx.db
                    .query("messages")
                    .withIndex("by_conversation", (q) => q.eq("conversationId", conv._id))
                    .order("desc")
                    .first();

                return {
                    id: conv._id,
                    isGroup: conv.isGroup || false,
                    groupName: conv.groupName,
                    participants: conv.participants,
                    otherUser, // Only populated for 1-on-1 chats
                    latestMessage,
                    updatedAt: latestMessage ? latestMessage._creationTime : conv._creationTime,
                };
            })
        );

        // Sort by most recently updated
        return conversationsWithDetails.sort((a, b) => b.updatedAt - a.updatedAt);
    },
});
