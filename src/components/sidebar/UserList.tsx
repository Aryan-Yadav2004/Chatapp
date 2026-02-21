"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Search, MessageSquarePlus } from "lucide-react";
import { useState, useCallback, useEffect } from "react";
import debounce from "lodash.debounce";

export function UserList() {
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    // Debounce the search input so we don't hammer the database on every keystroke
    const updateSearch = useCallback(
        debounce((value: string) => {
            setDebouncedSearch(value);
        }, 300),
        []
    );

    useEffect(() => {
        updateSearch(searchTerm);
        return () => updateSearch.cancel();
    }, [searchTerm, updateSearch]);

    const users = useQuery(api.users.getUsers, {
        searchTerm: debouncedSearch || undefined,
    });

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
                        onChange={(e) => setSearchTerm(e.target.value)}
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
                        {users.map((user) => (
                            <button
                                key={user._id}
                                className="w-full flex items-center gap-3 p-3 text-left rounded-xl transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-900"
                                onClick={() => {
                                    // Phase 3: Create conversation when clicked
                                    console.log("Create conversation with", user.name);
                                }}
                            >
                                <Avatar>
                                    <AvatarImage src={user.avatarUrl} alt={user.name} />
                                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 overflow-hidden">
                                    <p className="font-medium truncate">{user.name}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </ScrollArea>
        </div>
    );
}
