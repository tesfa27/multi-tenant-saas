"use client";

import { useState } from "react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useRemoveMember } from "@/lib/hooks/use-members";
import type { Member } from "@/lib/api/members";

interface RemoveMemberDialogProps {
    tenantId: string;
    member: Member | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function RemoveMemberDialog({
    tenantId,
    member,
    open,
    onOpenChange,
}: RemoveMemberDialogProps) {
    const [confirmText, setConfirmText] = useState("");
    const removeMutation = useRemoveMember(tenantId);

    const handleOpenChange = (newOpen: boolean) => {
        if (!newOpen) {
            setConfirmText("");
        }
        onOpenChange(newOpen);
    };

    const handleRemove = async () => {
        if (!member || confirmText.trim() !== member.user.email.trim()) return;

        try {
            await removeMutation.mutateAsync(member.id);
            setConfirmText("");
            onOpenChange(false);
        } catch (error: any) {
            console.error("Failed to remove member:", error);
        }
    };

    const isConfirmValid = confirmText.trim() === member?.user.email.trim();

    return (
        <AlertDialog open={open} onOpenChange={handleOpenChange}>
            <AlertDialogContent className="max-w-lg">
                <AlertDialogHeader>
                    <AlertDialogTitle>Remove Member</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently remove the member from this tenant.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="space-y-3 px-6 pb-6">
                    <div className="rounded-md bg-muted border p-3">
                        <div className="text-sm font-medium">
                            Warning: You are about to remove
                        </div>
                        <div className="text-sm font-semibold text-foreground mt-1">
                            {member?.user.name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                            {member?.user.email}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="confirm-email" className="text-sm font-medium">
                            Please type <span className="font-mono font-semibold">{member?.user.email.trim()}</span> to confirm
                        </Label>
                        <Input
                            id="confirm-email"
                            value={confirmText}
                            onChange={(e) => setConfirmText(e.target.value)}
                            placeholder="Type member email here"
                            disabled={removeMutation.isPending}
                            className="font-mono"
                            autoComplete="off"
                        />
                    </div>
                </div>

                <AlertDialogFooter>
                    <AlertDialogCancel disabled={removeMutation.isPending}>
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleRemove}
                        disabled={!isConfirmValid || removeMutation.isPending}
                        className="bg-foreground text-background hover:bg-foreground/90"
                    >
                        {removeMutation.isPending && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Remove Member
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
