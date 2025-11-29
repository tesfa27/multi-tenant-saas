"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function ProjectsPage() {
    return (
        <div className="p-8">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
                    <p className="text-muted-foreground">
                        Manage your tenant projects
                    </p>
                </div>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    New Project
                </Button>
            </div>

            {/* Projects Table */}
            <Card>
                <div className="relative w-full overflow-auto">
                    <table className="w-full caption-bottom text-sm">
                        <thead className="border-b">
                            <tr className="border-b transition-colors hover:bg-muted/50">
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                                    Name
                                </th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                                    Description
                                </th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                                    Created
                                </th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="[&_tr:last-child]:border-0">
                            {/* Placeholder rows */}
                            {[1, 2, 3, 4, 5].map((i) => (
                                <tr
                                    key={i}
                                    className="border-b transition-colors hover:bg-muted/50"
                                >
                                    <td className="p-4 align-middle font-medium">
                                        Project {i}
                                    </td>
                                    <td className="p-4 align-middle text-muted-foreground">
                                        Sample project description
                                    </td>
                                    <td className="p-4 align-middle text-muted-foreground">
                                        2024-01-{i.toString().padStart(2, "0")}
                                    </td>
                                    <td className="p-4 align-middle">
                                        <div className="flex gap-2">
                                            <Button variant="ghost" size="sm">
                                                Edit
                                            </Button>
                                            <Button variant="ghost" size="sm">
                                                Delete
                                            </Button>
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
                        Showing 1 to 5 of 5 results
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
