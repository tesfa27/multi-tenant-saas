"use client";

import { useState } from "react";
import { useForm, ControllerRenderProps } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { UserPlus, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
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
import { useAddMember } from "@/lib/hooks/use-members";

const memberSchema = z.object({
    email: z.string().email("Invalid email address"),
    role: z.enum(["ADMIN", "USER"], {
         message: "Please select a role",
    }),
});

type MemberFormData = z.infer<typeof memberSchema>;

interface AddMemberDialogProps {
    tenantId: string;
}

export function AddMemberDialog({ tenantId }: AddMemberDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const addMutation = useAddMember(tenantId);

    const form = useForm<MemberFormData>({
        resolver: zodResolver(memberSchema),
        defaultValues: {
            email: "",
            role: "USER",
        },
    });

    const onSubmit = async (formData: MemberFormData) => {
        try {
            await addMutation.mutateAsync(formData);
            setIsOpen(false);
            form.reset();
        } catch (error: any) {
            console.error("Failed to add member:", error);
            // You can add toast notification here
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Add Member
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add Team Member</DialogTitle>
                    <DialogDescription>
                        Invite a new member to your team. They must already have an account in this tenant.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }: { field: ControllerRenderProps<MemberFormData, "email"> }) => (
                                <FormItem>
                                    <FormLabel>Email Address *</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="email"
                                            placeholder="member@example.com"
                                            {...field}
                                            disabled={addMutation.isPending}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Enter the email of an existing user in this tenant
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="role"
                            render={({ field }: { field: ControllerRenderProps<MemberFormData, "role"> }) => (
                                <FormItem>
                                    <FormLabel>Role *</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        disabled={addMutation.isPending}
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
                                onClick={() => setIsOpen(false)}
                                disabled={addMutation.isPending}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={addMutation.isPending}>
                                {addMutation.isPending && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                Add Member
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
