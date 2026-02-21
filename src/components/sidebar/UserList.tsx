"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Search, MessageSquarePlus } from "lucide-react";
import { useState, useEffect } from "react";
import debounce from "lodash.debounce";
import { useMutation } from "convex/react";
import { Id } from "../../../convex/_generated/dataModel";

interface UserListProps {
    onSelectConversation?: (conversationId: Id<"conversations">, otherUser: { name: string, avatarUrl: string, clerkId: string }) => void;
}

export function UserList({ onSelectConversation }: UserListProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const createConversation = useMutation(api.conversations.getOrCreateConversation);

    // Debounce the search input so we don't hammer the database on every keystroke
    useEffect(() => {
        const handler = debounce((value: string) => {
            setDebouncedSearch(value);
        }, 300);

        handler(searchTerm);

        return () => {
            handler.cancel();
        };
    }, [searchTerm]);

    const users = useQuery(api.users.getUsers, {
        searchTerm: debouncedSearch || undefined,
    });

    const onlineStatuses = useQuery(api.presence.getOnlineUsers, {
        clerkIds: users ? users.map((u: { clerkId: string }) => u.clerkId) : [],
    });

    const unreadCounts = useQuery(api.readReceipts.getUnreadCounts);

    return (
        <div className="flex flex-col h-full border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
                <h2 className="mb-4 text-xl font-bold flex items-center gap-2">
                    <MessageSquarePlus className="w-5 h-5" />
                    Livechat
                </h2>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <Input
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                        className="pl-9 bg-zinc-100 dark:bg-zinc-900 border-none rounded-full"
                    />
                </div>
            </div>

            <ScrollArea className="flex-1">
                {users === undefined ? (
                    <div className="p-4 text-center text-sm text-zinc-500">Loading users...</div>
                ) : users.length === 0 ? (
                    <div className="p-8 justify-center text-center text-sm text-zinc-500 flex flex-col items-center gap-3">
                        <div className="bg-zinc-100 p-3 rounded-full dark:bg-zinc-900">
                            <Search className="w-6 h-6 text-zinc-400" />
                        </div>
                        {debouncedSearch
                            ? "No users match your search."
                            : "No other users found. Start by inviting some friends!"}
                    </div>
                ) : (
                    <div className="p-2 space-y-1">
                        {users.map((user: { _id: Id<"users">; clerkId: string; name: string; avatarUrl: string }) => (
                            <button
                                key={user._id}
                                className="w-full flex items-center gap-3 p-3 text-left rounded-xl transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-900"
                                onClick={async () => {
                                    if (onSelectConversation) {
                                        try {
                                            // Note: getOrCreateConversation uses the Clerk ID
                                            const conversationId = await createConversation({ otherUserId: user.clerkId });
                                            onSelectConversation(conversationId, { name: user.name, avatarUrl: user.avatarUrl, clerkId: user.clerkId });
                                        } catch (error) {
                                            console.error("Failed to create conversation:", error);
                                        }
                                    }
                                }}
                            >
                                <div className="relative">
                                    <Avatar>
                                        <AvatarImage src={user.avatarUrl} alt={user.name} />
                                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    {onlineStatuses?.[user.clerkId] && (
                                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-zinc-950 rounded-full"></div>
                                    )}
                                </div>
                                <div className="flex-1 overflow-hidden flex items-center justify-between">
                                    <p className="font-medium truncate">{user.name}</p>
                                    {unreadCounts?.[user.clerkId] ? (
                                        <div className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center justify-center min-w-[20px]">
                                            {unreadCounts[user.clerkId] > 99 ? "99+" : unreadCounts[user.clerkId]}
                                        </div>
                                    ) : null}
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </ScrollArea>
        </div>
    );
}
