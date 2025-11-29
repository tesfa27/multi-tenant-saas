"use client";

import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export default function MembersPage() {
    return (
        <div className="p-8">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Members</h1>
                    <p className="text-muted-foreground">
                        Manage your team members and their roles
                    </p>
                </div>
                <Button>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Add Member
                </Button>
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
                            {/* Placeholder rows */}
                            {[
                                { name: "John Doe", email: "john@example.com", role: "OWNER" },
                                { name: "Jane Smith", email: "jane@example.com", role: "ADMIN" },
                                { name: "Bob Johnson", email: "bob@example.com", role: "USER" },
                                { name: "Alice Williams", email: "alice@example.com", role: "USER" },
                            ].map((member, i) => (
                                <tr
                                    key={i}
                                    className="border-b transition-colors hover:bg-muted/50"
                                >
                                    <td className="p-4 align-middle">
                                        <div className="flex items-center gap-3">
                                            <Avatar>
                                                <AvatarFallback>
                                                    {member.name.split(" ").map(n => n[0]).join("")}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="font-medium">{member.name}</div>
                                        </div>
                                    </td>
                                    <td className="p-4 align-middle text-muted-foreground">
                                        {member.email}
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
                                        2024-01-{(i + 1).toString().padStart(2, "0")}
                                    </td>
                                    <td className="p-4 align-middle">
                                        <div className="flex gap-2">
                                            <Button variant="ghost" size="sm">
                                                Edit Role
                                            </Button>
                                            {member.role !== "OWNER" && (
                                                <Button variant="ghost" size="sm">
                                                    Remove
                                                </Button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between border-t px-4 py-4">
                    <div className="text-sm text-muted-foreground">
                        Showing 1 to 4 of 4 members
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                            Previous
                        </Button>
                        <Button variant="outline" size="sm">
                            Next
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
}
