"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { useUser } from "@clerk/nextjs";
import { useEffect, useRef, useState } from "react";
import { MessageInput } from "./MessageInput";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatMessageTime } from "@/lib/utils";
import { ChevronLeft, MoreVertical, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ChatWindow({ conversationId, otherUser, onBack }: {
    conversationId: Id<"conversations">,
    otherUser: { name: string, avatarUrl: string; clerkId: string },
    onBack?: () => void
}) {
    const { user } = useUser();
    const messages = useQuery(api.messages.getMessages, { conversationId });
    const deleteMessage = useMutation(api.messages.deleteMessage);
    const onlineStatuses = useQuery(api.presence.getOnlineUsers, {
        clerkIds: [otherUser.clerkId]
    });
    const isOnline = onlineStatuses?.[otherUser.clerkId] ?? false;

    const typingUsers = useQuery(api.typing.getTypingUsers, { conversationId });
    const isOtherUserTyping = typingUsers?.includes(otherUser.clerkId) ?? false;

    // Auto-scroll state
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const scrollViewportRef = useRef<HTMLDivElement>(null);
    const [isUserScrolling, setIsUserScrolling] = useState(false);

    // Scroll handler to detect if the user has manually scrolled up
    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const target = e.currentTarget;
        // If we're within 50px of the bottom, consider it "at the bottom" so auto-scroll works
        const isAtBottom = target.scrollHeight - target.scrollTop - target.clientHeight < 50;
        setIsUserScrolling(!isAtBottom);
    };

    const scrollToBottom = () => {
        if (!isUserScrolling) {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    };

    const markRead = useMutation(api.readReceipts.markRead);

    useEffect(() => {
        if (messages) {
            markRead({ conversationId }).catch(console.error);
            // Scroll to bottom when new messages arrive if not manually scrolling
            scrollToBottom();
        }
    }, [conversationId, messages, markRead]); // Only auto-scroll when messages array changes

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

                <div className="relative">
                    <Avatar className="h-10 w-10">
                        <AvatarImage src={otherUser.avatarUrl} alt={otherUser.name} />
                        <AvatarFallback>{otherUser.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    {isOnline && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-zinc-950 rounded-full"></div>
                    )}
                </div>
                <div>
                    <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 leading-tight">{otherUser.name}</h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        {isOnline ? (
                            <span className="text-green-600 dark:text-green-400 font-medium">Online</span>
                        ) : (
                            "Offline"
                        )}
                    </p>
                </div>
            </div>

            {/* Messages Area - Ensure flexible flex-col behavior and passing the handler */}
            <ScrollArea
                className="flex-1 p-4"
                viewportRef={scrollViewportRef}
                onScrollCapture={handleScroll}
            >
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
                                    <div className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} max-w-[75%]`}>
                                        <div
                                            className={`px-4 py-2 rounded-2xl relative group flex items-start gap-2 ${isMine
                                                ? "bg-blue-600 text-white rounded-br-sm"
                                                : "bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-bl-sm shadow-sm"
                                                }`}
                                        >
                                            <div className="flex-1 min-w-0">
                                                <p className="whitespace-pre-wrap break-words text-sm sm:text-base">{message.content}</p>
                                                <div
                                                    className={`text-[10px] sm:text-xs mt-1 ${isMine ? "text-blue-100/80 text-right" : "text-zinc-400 dark:text-zinc-500 text-left"
                                                        }`}
                                                >
                                                    {formatMessageTime(message._creationTime)}
                                                </div>
                                            </div>

                                            {isMine && (
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-6 w-6 opacity-0 group-hover:opacity-100 hover:bg-white/20 hover:text-white shrink-0 -mr-2"
                                                        >
                                                            <MoreVertical className="h-4 w-4" />
                                                            <span className="sr-only">More options</span>
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem
                                                            onClick={() => deleteMessage({ messageId: message._id })}
                                                            className="text-red-600 dark:text-red-400 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/50"
                                                        >
                                                            <Trash className="mr-2 h-4 w-4" />
                                                            Delete Message
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>
                )}
            </ScrollArea>

            {/* Typing Indicator */}
            {isOtherUserTyping && (
                <div className="px-6 py-2 bg-zinc-50 dark:bg-black">
                    <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 text-sm">
                        <span className="font-medium">{otherUser.name}</span> is typing
                        <span className="flex gap-1 ml-1">
                            <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                            <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                            <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                        </span>
                    </div>
                </div>
            )}

            {/* Message Input Container */}
            <MessageInput conversationId={conversationId} />
        </div>
    );
}
