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
import { useDeleteProject } from "@/lib/hooks/use-projects";
import type { Project } from "@/lib/api/projects";

interface DeleteProjectDialogProps {
    tenantId: string;
    project: Project | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function DeleteProjectDialog({
    tenantId,
    project,
    open,
    onOpenChange,
}: DeleteProjectDialogProps) {
    const [confirmText, setConfirmText] = useState("");
    const deleteMutation = useDeleteProject(tenantId);

    const handleOpenChange = (newOpen: boolean) => {
        if (!newOpen) {
            setConfirmText("");
        }
        onOpenChange(newOpen);
    };

    const handleDelete = async () => {
        if (!project || confirmText.trim() !== project.name.trim()) return;

        try {
            await deleteMutation.mutateAsync(project.id);
            setConfirmText("");
            onOpenChange(false);
        } catch (error: any) {
            console.error("Failed to delete project:", error);
        }
    };

    const isConfirmValid = confirmText.trim() === project?.name.trim();

    return (
        <AlertDialog open={open} onOpenChange={handleOpenChange}>
            <AlertDialogContent className="max-w-lg">
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete Project</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the project and remove all associated data.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="space-y-3 px-6 pb-6">
                    <div className="rounded-md bg-muted border p-3">
                        <div className="text-sm font-medium">
                            Warning: You are about to delete
                        </div>
                        <div className="text-sm font-mono font-semibold text-foreground mt-1">
                            {project?.name.trim()}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="confirm-name" className="text-sm font-medium">
                            Please type <span className="font-mono font-semibold">{project?.name.trim()}</span> to confirm
                        </Label>
                        <Input
                            id="confirm-name"
                            value={confirmText}
                            onChange={(e) => setConfirmText(e.target.value)}
                            placeholder="Type project name here"
                            disabled={deleteMutation.isPending}
                            className="font-mono"
                            autoComplete="off"
                        />
                        
                    </div>
                </div>

                <AlertDialogFooter>
                    <AlertDialogCancel disabled={deleteMutation.isPending}>
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDelete}
                        disabled={!isConfirmValid || deleteMutation.isPending}
                        className="bg-foreground text-background hover:bg-foreground/90"
                    >
                        {deleteMutation.isPending && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Delete Project
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
