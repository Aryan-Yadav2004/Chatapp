"use client";

import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { useState, useRef, useEffect } from "react";
import { SendHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export function MessageInput({ conversationId }: { conversationId: Id<"conversations"> }) {
    const [content, setContent] = useState("");
    const sendMessage = useMutation(api.messages.sendMessage);
    const setTyping = useMutation(api.typing.setTyping);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Clean up timeout on unmount
    useEffect(() => {
        return () => {
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
        };
    }, []);

    const handleSend = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!content.trim()) return;

        try {
            await sendMessage({ content, conversationId });
            setContent("");
            // Clear typing state immediately on send
            await setTyping({ conversationId, isTyping: false });
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
        } catch (error) {
            console.error("Failed to send message:", error);
            toast.error("Failed to send message. Please try again.");
        }
    };

    const handleKeyDown = () => {
        // Set typing to true
        setTyping({ conversationId, isTyping: true }).catch(console.error);

        // Clear existing timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // Set a new timeout to clear typing state after 2 seconds
        typingTimeoutRef.current = setTimeout(() => {
            setTyping({ conversationId, isTyping: false }).catch(console.error);
        }, 2000);
    };

    return (
        <form
            onSubmit={handleSend}
            className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex items-center gap-2"
        >
            <Input
                value={content}
                onChange={(e) => {
                    setContent(e.target.value);
                    handleKeyDown();
                }}
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
