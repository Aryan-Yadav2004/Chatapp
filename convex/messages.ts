import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const sendMessage = mutation({
    args: {
        conversationId: v.id("conversations"),
        content: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Unauthorized");
        }

        const myId = identity.subject;

        // Verify conversation exists and user is part of it
        const conversation = await ctx.db.get(args.conversationId);
        if (!conversation) {
            throw new Error("Conversation not found");
        }

        if (
            conversation.participantOne !== myId &&
            conversation.participantTwo !== myId
        ) {
            throw new Error("Not a participant in this conversation");
        }

        // Insert the message
        await ctx.db.insert("messages", {
            conversationId: args.conversationId,
            sender: myId,
            content: args.content,
        });
    },
});

export const getMessages = query({
    args: {
        conversationId: v.id("conversations"),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            return [];
        }

        const myId = identity.subject;

        // Verify user is part of the conversation
        const conversation = await ctx.db.get(args.conversationId);
        if (!conversation) {
            return []; // Return empty array if conversation doesn't exist yet
        }

        if (
            conversation.participantOne !== myId &&
            conversation.participantTwo !== myId
        ) {
            throw new Error("Not a participant in this conversation");
        }

        // Fetch messages
        const messages = await ctx.db
            .query("messages")
            .withIndex("by_conversation", (q) =>
                q.eq("conversationId", args.conversationId)
            )
            .collect();

        return messages;
    },
});

export const deleteMessage = mutation({
    args: {
        messageId: v.id("messages"),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Unauthorized");
        }

        const myId = identity.subject;

        const message = await ctx.db.get(args.messageId);
        if (!message) {
            throw new Error("Message not found");
        }

        if (message.sender !== myId) {
            throw new Error("You can only delete your own messages");
        }

        await ctx.db.delete(args.messageId);
    },
});
