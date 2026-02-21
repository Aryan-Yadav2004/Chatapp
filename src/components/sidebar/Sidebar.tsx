"use client";

import { UserList } from "./UserList";
import { UserButton } from "@clerk/nextjs";

export function Sidebar() {
    return (
        <aside className="w-80 flex-shrink-0 flex flex-col h-full bg-white dark:bg-zinc-950">
            <div className="flex-1 overflow-hidden">
                <UserList />
            </div>
            <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                <span className="text-sm font-medium text-zinc-500">My Account</span>
                <UserButton afterSignOutUrl="/" />
            </div>
        </aside>
    );
}
