"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { useState } from "react";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { ChatWindow } from "@/components/chat/ChatWindow";

export function ChatLayout() {
    const [activeConversation, setActiveConversation] = useState<{
        id: Id<"conversations">;
        otherUser: { name: string; avatarUrl: string };
    } | null>(null);

    return (
        <div className="flex h-screen bg-zinc-50 dark:bg-zinc-950 overflow-hidden text-zinc-900 dark:text-zinc-100">
            <Sidebar onSelectConversation={(id, user) => setActiveConversation({ id, otherUser: user })} />

            <main className="flex-1 flex flex-col bg-white dark:bg-zinc-900 rounded-3xl m-4 border border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden shadow-zinc-200/50 dark:shadow-black/50 relative z-10">
                {activeConversation ? (
                    <ChatWindow
                        key={activeConversation.id}
                        conversationId={activeConversation.id}
                        otherUser={activeConversation.otherUser}
                    />
                ) : (
                    <div className="flex-1 flex items-center justify-center p-8 bg-zinc-50 dark:bg-zinc-950/50">
                        <div className="text-center max-w-md bg-white dark:bg-zinc-900 p-8 rounded-3xl shadow-sm border border-zinc-100 dark:border-zinc-800">
                            <div className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-full flex items-center justify-center w-16 h-16 mx-auto mb-6 shadow-inner">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600 dark:text-blue-400"><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z" /></svg>
                            </div>
                            <h2 className="text-2xl font-semibold mb-3 tracking-tight">Your Messages</h2>
                            <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed text-sm">
                                Select a user from the sidebar to start a new conversation or continue an existing one. Look up your friends by name!
                            </p>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
