"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, Check } from "lucide-react";

export function CreateGroupModal({
    onGroupCreated
}: {
    onGroupCreated?: (conversationId: Id<"conversations">, groupInfo: { name: string, isGroup: boolean }) => void
}) {
    const [open, setOpen] = useState(false);
    const [groupName, setGroupName] = useState("");
    const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const users = useQuery(api.users.getUsers, { searchTerm: undefined });
    const createGroup = useMutation(api.conversations.createGroup);

    if (!mounted) return null;

    const toggleUser = (clerkId: string) => {
        const newSelected = new Set(selectedUsers);
        if (newSelected.has(clerkId)) {
            newSelected.delete(clerkId);
        } else {
            newSelected.add(clerkId);
        }
        setSelectedUsers(newSelected);
    };

    const handleCreate = async () => {
        if (!groupName.trim() || selectedUsers.size === 0) return;

        try {
            const conversationId = await createGroup({
                name: groupName.trim(),
                members: Array.from(selectedUsers),
            });

            setOpen(false);
            setGroupName("");
            setSelectedUsers(new Set());

            if (onGroupCreated) {
                onGroupCreated(conversationId, { name: groupName.trim(), isGroup: true });
            }
        } catch (error) {
            console.error("Failed to create group:", error);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="hover:bg-zinc-100 dark:hover:bg-zinc-800">
                    <Users className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create Group Chat</DialogTitle>
                </DialogHeader>

                <div className="py-4 space-y-4">
                    <Input
                        placeholder="Group Name"
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                    />

                    <div className="space-y-2">
                        <p className="text-sm font-medium text-zinc-500">Select Members</p>
                        <div className="h-60 overflow-y-auto border rounded-xl divide-y dark:border-zinc-800 dark:divide-zinc-800">
                            {users?.map((user: { _id: Id<"users">; clerkId: string; name: string; avatarUrl: string }) => (
                                <div
                                    key={user._id}
                                    className="flex items-center gap-3 p-3 hover:bg-zinc-50 dark:hover:bg-zinc-900 cursor-pointer"
                                    onClick={() => toggleUser(user.clerkId)}
                                >
                                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${selectedUsers.has(user.clerkId) ? 'bg-blue-600 border-blue-600 text-white' : 'border-zinc-300'}`}>
                                        {selectedUsers.has(user.clerkId) && <Check className="w-3 h-3" />}
                                    </div>
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={user.avatarUrl} alt={user.name} />
                                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <span className="text-sm font-medium">{user.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        disabled={!groupName.trim() || selectedUsers.size === 0}
                        onClick={handleCreate}
                    >
                        Create Group
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
