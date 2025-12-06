"use client";

import { useEffect } from "react";
import { useForm, ControllerRenderProps } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useUpdateMemberRole } from "@/lib/hooks/use-members";
import type { Member } from "@/lib/api/members";

const roleSchema = z.object({
    role: z.enum(["ADMIN", "USER"], {
        message: "Please select a role",
    }),
});

type RoleFormData = z.infer<typeof roleSchema>;

interface EditMemberRoleDialogProps {
    tenantId: string;
    member: Member | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function EditMemberRoleDialog({
    tenantId,
    member,
    open,
    onOpenChange,
}: EditMemberRoleDialogProps) {
    const updateMutation = useUpdateMemberRole(tenantId);

    const form = useForm<RoleFormData>({
        resolver: zodResolver(roleSchema),
        defaultValues: {
            role: "USER",
        },
    });

    // Reset form when member changes
    useEffect(() => {
        if (member && member.role !== "OWNER") {
            form.reset({
                role: member.role as "ADMIN" | "USER",
            });
        }
    }, [member, form]);

    const onSubmit = async (formData: RoleFormData) => {
        if (!member) return;

        try {
            await updateMutation.mutateAsync({
                memberId: member.id,
                data: formData,
            });
            onOpenChange(false);
        } catch (error: any) {
            console.error("Failed to update member role:", error);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Member Role</DialogTitle>
                    <DialogDescription>
                        Change the role for {member?.user.name} ({member?.user.email})
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="role"
                            render={({ field }: { field: ControllerRenderProps<RoleFormData, "role"> }) => (
                                <FormItem>
                                    <FormLabel>Role *</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        disabled={updateMutation.isPending}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a role" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="USER">User</SelectItem>
                                            <SelectItem value="ADMIN">Admin</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormDescription>
                                        Users can view data. Admins can manage members and settings.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                disabled={updateMutation.isPending}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={updateMutation.isPending}>
                                {updateMutation.isPending && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                Save Changes
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
