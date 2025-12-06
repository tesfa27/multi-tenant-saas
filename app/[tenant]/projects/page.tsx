"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Project } from "@/lib/api/projects";
import { useProjects } from "@/lib/hooks/use-projects";
import { CreateProjectDialog } from "@/components/projects/create-project-dialog";
import { EditProjectDialog } from "@/components/projects/edit-project-dialog";
import { DeleteProjectDialog } from "@/components/projects/delete-project-dialog";

export default function ProjectsPage() {
    const params = useParams();
    const tenant = params.tenant as string;
    const [page, setPage] = useState(1);
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [deletingProject, setDeletingProject] = useState<Project | null>(null);

    const { data, isLoading, isError } = useProjects(tenant, page, 10, "");

    return (
        <div className="p-8">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
                    <p className="text-muted-foreground">
                        Manage your tenant projects
                    </p>
                </div>
                <CreateProjectDialog tenantId={tenant} />
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
                            {isLoading ? (
                                <tr>
                                    <td colSpan={4} className="h-24 text-center">
                                        <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                                    </td>
                                </tr>
                            ) : isError ? (
                                <tr>
                                    <td colSpan={4} className="h-24 text-center text-destructive">
                                        Failed to load projects.
                                    </td>
                                </tr>
                            ) : data?.projects.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="h-24 text-center text-muted-foreground">
                                        No projects found.
                                    </td>
                                </tr>
                            ) : (
                                data?.projects.map((project) => (
                                    <tr
                                        key={project.id}
                                        className="border-b transition-colors hover:bg-muted/50"
                                    >
                                        <td className="p-4 align-middle font-medium">
                                            {project.name}
                                        </td>
                                        <td className="p-4 align-middle text-muted-foreground">
                                            {project.description || "-"}
                                        </td>
                                        <td className="p-4 align-middle text-muted-foreground">
                                            {new Date(project.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="p-4 align-middle">
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setEditingProject(project)}
                                                >
                                                    Edit
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setDeletingProject(project)}
                                                >
                                                    Delete
                                                </Button>
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
                                of {data.pagination.total} results
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
                         {/* Page Numbers */}
                        <div className="flex items-center gap-1">
                            {data?.pagination && (() => {
                                const totalPages = data.pagination.totalPages;
                                const currentPage = page;
                                const pages: (number | string)[] = [];

                                if (totalPages <= 7) {
                                    // Show all pages if 7 or fewer
                                    for (let i = 1; i <= totalPages; i++) {
                                        pages.push(i);
                                    }
                                } else {
                                    // Always show first page
                                    pages.push(1);

                                    if (currentPage > 3) {
                                        pages.push("...");
                                    }

                                    // Show pages around current page
                                    const start = Math.max(2, currentPage - 1);
                                    const end = Math.min(totalPages - 1, currentPage + 1);

                                    for (let i = start; i <= end; i++) {
                                        pages.push(i);
                                    }

                                    if (currentPage < totalPages - 2) {
                                        pages.push("...");
                                    }

                                    // Always show last page
                                    pages.push(totalPages);
                                }

                                return pages.map((pageNum, idx) => {
                                    if (pageNum === "...") {
                                        return (
                                            <span key={`ellipsis-${idx}`} className="px-2 text-muted-foreground">
                                                ...
                                            </span>
                                        );
                                    }

                                    return (
                                        <Button
                                            key={pageNum}
                                            variant={currentPage === pageNum ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => setPage(pageNum as number)}
                                            disabled={isLoading}
                                            className="min-w-[2.5rem]"
                                        >
                                            {pageNum}
                                        </Button>
                                    );
                                });
                            })()}
                        </div>

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
            
            {/* Edit Project Dialog */}
            <EditProjectDialog
                tenantId={tenant}
                project={editingProject}
                open={!!editingProject}
                onOpenChange={(open: boolean) => !open && setEditingProject(null)}
            />

             {/* Delete Project Dialog */}
            <DeleteProjectDialog
                tenantId={tenant}
                project={deletingProject}
                open={!!deletingProject}
                onOpenChange={(open: boolean) => !open && setDeletingProject(null)}
            />
        </div>
    );
}
