"use client";

import { UserList } from "./UserList";
import { UserButton } from "@clerk/nextjs";
import { Id } from "../../../convex/_generated/dataModel";

interface SidebarProps {
    onSelectConversation?: (conversationId: Id<"conversations">, otherUser: { name: string, avatarUrl: string, clerkId: string }) => void;
}

export function Sidebar({ onSelectConversation }: SidebarProps) {
    return (
        <aside className="w-full md:w-80 flex-shrink-0 flex flex-col h-full bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800">
            <div className="flex-1 overflow-hidden">
                <UserList onSelectConversation={onSelectConversation} />
            </div>
            <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                <span className="text-sm font-medium text-zinc-500">My Account</span>
                <UserButton afterSignOutUrl="/" />
            </div>
        </aside>
    );
}
