"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { useUser } from "@clerk/nextjs";
import { MessageInput } from "./MessageInput";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatMessageTime } from "@/lib/utils";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useRef } from "react";

export function ChatWindow({ conversationId, otherUser, onBack }: {
    conversationId: Id<"conversations">,
    otherUser: { name: string, avatarUrl: string },
    onBack?: () => void
}) {
    const { user } = useUser();
    const messages = useQuery(api.messages.getMessages, { conversationId });

    if (messages === undefined) {
        return <div className="flex-1 flex items-center justify-center p-8 text-zinc-500">Loading messages...</div>;
    }

    return (
        <div className="flex flex-col h-full bg-zinc-50 dark:bg-black md:rounded-r-3xl overflow-hidden">
            {/* Chat Header */}
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex items-center gap-3 shadow-sm z-10">
                <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden shrink-0 -ml-2"
                    onClick={onBack}
                >
                    <ChevronLeft className="h-5 w-5" />
                    <span className="sr-only">Back</span>
                </Button>

                <Avatar className="h-10 w-10">
                    <AvatarImage src={otherUser.avatarUrl} alt={otherUser.name} />
                    <AvatarFallback>{otherUser.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                    <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">{otherUser.name}</h3>
                    {/* Optional: Add online status here in phase 7 */}
                </div>
            </div>

            {/* Messages Area */}
            <ScrollArea className="flex-1 p-4">
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8">
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-full mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                        </div>
                        <p className="text-zinc-500 dark:text-zinc-400 font-medium">No messages here yet.</p>
                        <p className="text-sm text-zinc-400 dark:text-zinc-500 mt-1">Send a message to start the conversation with {otherUser.name}.</p>
                    </div>
                ) : (
                    <div className="space-y-4 pb-4">
                        {messages.map((message: { _id: Id<"messages">; sender: string; content: string; _creationTime: number }) => {
                            const isMine = message.sender === user?.id;

                            return (
                                <div
                                    key={message._id}
                                    className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                                >
                                    <div
                                        className={`max-w-[75%] px-4 py-2 rounded-2xl ${isMine
                                            ? "bg-blue-600 text-white rounded-br-sm"
                                            : "bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-bl-sm shadow-sm"
                                            }`}
                                    >
                                        <p className="whitespace-pre-wrap break-words text-sm sm:text-base">{message.content}</p>
                                        {/* Timestamp will go here in Phase 4 */}
                                        <div
                                            className={`text-[10px] sm:text-xs mt-1 text-right ${isMine ? "text-blue-100" : "text-zinc-400 dark:text-zinc-500"
                                                }`}
                                        >
                                            {formatMessageTime(message._creationTime)}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </ScrollArea>

            {/* Message Input Container */}
            <MessageInput conversationId={conversationId} />
        </div>
    );
}
