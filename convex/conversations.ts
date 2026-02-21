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

        // Sort to ensure consistent conversation finding regardless of who initiated
        const [user1, user2] = [myId, otherUserId].sort();

        // Check if conversation already exists where participantOne is user1 AND participantTwo is user2
        const existingConversation = await ctx.db
            .query("conversations")
            .withIndex("by_participantOne", (q) => q.eq("participantOne", user1))
            .filter((q) => q.eq(q.field("participantTwo"), user2))
            .first();

        if (existingConversation) {
            return existingConversation._id;
        }

        // Create a new conversation
        const newConversationId = await ctx.db.insert("conversations", {
            participantOne: user1,
            participantTwo: user2,
        });

        return newConversationId;
    },
});

export const getUserConversations = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Unauthorized");
        }

        const myId = identity.subject;

        // We have to query both indexed fields and combine them
        const conversationsAsParticipantOne = await ctx.db
            .query("conversations")
            .withIndex("by_participantOne", (q) => q.eq("participantOne", myId))
            .collect();

        const conversationsAsParticipantTwo = await ctx.db
            .query("conversations")
            .withIndex("by_participantTwo", (q) => q.eq("participantTwo", myId))
            .collect();

        const allConversations = [
            ...conversationsAsParticipantOne,
            ...conversationsAsParticipantTwo,
        ];

        // For each conversation, fetch the other user's details and the latest message
        const conversationsWithDetails = await Promise.all(
            allConversations.map(async (conv) => {
                const otherUserId =
                    conv.participantOne === myId
                        ? conv.participantTwo
                        : conv.participantOne;

                // Fetch other user
                const otherUser = await ctx.db
                    .query("users")
                    .withIndex("by_clerk_id", (q) => q.eq("clerkId", otherUserId))
                    .unique();

                // Fetch latest message
                const latestMessage = await ctx.db
                    .query("messages")
                    .withIndex("by_conversation", (q) => q.eq("conversationId", conv._id))
                    .order("desc")
                    .first();

                return {
                    id: conv._id,
                    otherUser,
                    latestMessage,
                    updatedAt: latestMessage ? latestMessage._creationTime : conv._creationTime,
                };
            })
        );

        // Sort by most recently updated
        return conversationsWithDetails.sort((a, b) => b.updatedAt - a.updatedAt);
    },
});
