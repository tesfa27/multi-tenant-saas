"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { UserPlus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useMembers } from "@/lib/hooks/use-members";
import type { Member } from "@/lib/api/members";
import { AddMemberDialog } from "@/components/members/add-member-dialog";
import { EditMemberRoleDialog } from "@/components/members/edit-member-role-dialog";
import { RemoveMemberDialog } from "@/components/members/remove-member-dialog";

export default function MembersPage() {
    const params = useParams();
    const tenant = params.tenant as string;
    const [page, setPage] = useState(1);
    const [editingMember, setEditingMember] = useState<Member | null>(null);
    const [removingMember, setRemovingMember] = useState<Member | null>(null);


    const { data, isLoading, isError } = useMembers(tenant, page, 10, "");

    return (
        <div className="p-8">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Members</h1>
                    <p className="text-muted-foreground">
                        Manage your team members and their roles
                    </p>
                </div>
                <AddMemberDialog tenantId={tenant} />
            </div>

            {/* Members Table */}
            <Card>
                <div className="relative w-full overflow-auto">
                    <table className="w-full caption-bottom text-sm">
                        <thead className="border-b">
                            <tr className="border-b transition-colors hover:bg-muted/50">
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                                    Member
                                </th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                                    Email
                                </th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                                    Role
                                </th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                                    Joined
                                </th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="[&_tr:last-child]:border-0">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="h-24 text-center">
                                        <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                                    </td>
                                </tr>
                            ) : isError ? (
                                <tr>
                                    <td colSpan={5} className="h-24 text-center text-destructive">
                                        Failed to load members.
                                    </td>
                                </tr>
                            ) : data?.members.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="h-24 text-center text-muted-foreground">
                                        No members found.
                                    </td>
                                </tr>
                            ) : (
                                data?.members.map((member: Member) => (
                                    <tr
                                        key={member.id}
                                        className="border-b transition-colors hover:bg-muted/50"
                                    >
                                        <td className="p-4 align-middle">
                                            <div className="flex items-center gap-3">
                                                <Avatar>
                                                    <AvatarFallback>
                                                        {member.user.name
                                                            .split(" ")
                                                            .map((n) => n[0])
                                                            .join("")}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="font-medium">{member.user.name}</div>
                                            </div>
                                        </td>
                                        <td className="p-4 align-middle text-muted-foreground">
                                            {member.user.email}
                                        </td>
                                        <td className="p-4 align-middle">
                                            <Badge
                                                variant={
                                                    member.role === "OWNER"
                                                        ? "default"
                                                        : member.role === "ADMIN"
                                                            ? "secondary"
                                                            : "outline"
                                                }
                                            >
                                                {member.role}
                                            </Badge>
                                        </td>
                                        <td className="p-4 align-middle text-muted-foreground">
                                            {new Date(member.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="p-4 align-middle">
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setEditingMember(member)}
                                                    disabled={member.role === "OWNER"}
                                                >
                                                    Edit Role
                                                </Button>
                                                {member.role !== "OWNER" && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => setRemovingMember(member)}
                                                    >
                                                        Remove
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between border-t px-4 py-4">
                    <div className="text-sm text-muted-foreground">
                        {data?.pagination && (
                            <>
                                Showing {(data.pagination.page - 1) * data.pagination.limit + 1} to{" "}
                                {Math.min(
                                    data.pagination.page * data.pagination.limit,
                                    data.pagination.total
                                )}{" "}
                                of {data.pagination.total} members
                            </>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page === 1 || isLoading}
                        >
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage((p) => p + 1)}
                            disabled={
                                !data?.pagination ||
                                page >= data.pagination.totalPages ||
                                isLoading
                            }
                        >
                            Next
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Edit Member Role Dialog */}
            <EditMemberRoleDialog
                tenantId={tenant}
                member={editingMember}
                open={!!editingMember}
                onOpenChange={(open: boolean) => !open && setEditingMember(null)}
            />

            {/* Remove Member Dialog */}
            <RemoveMemberDialog
                tenantId={tenant}
                member={removingMember}
                open={!!removingMember}
                onOpenChange={(open: boolean) => !open && setRemovingMember(null)}
            />
        </div>
    );
}
