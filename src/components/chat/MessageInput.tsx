"use client";

import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { useState } from "react";
import { SendHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";

export function MessageInput({ conversationId }: { conversationId: Id<"conversations"> }) {
    const [content, setContent] = useState("");
    const sendMessage = useMutation(api.messages.sendMessage);

    const handleSend = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!content.trim()) return;

        try {
            await sendMessage({ content, conversationId });
            setContent("");
        } catch (error) {
            console.error("Failed to send message:", error);
        }
    };

    return (
        <form
            onSubmit={handleSend}
            className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex items-center gap-2"
        >
            <Input
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 rounded-full bg-zinc-100 dark:bg-zinc-900 border-none focus-visible:ring-1 focus-visible:ring-zinc-400"
            />
            <button
                type="submit"
                disabled={!content.trim()}
                className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
            >
                <SendHorizontal className="w-5 h-5" />
            </button>
        </form>
    );
}
