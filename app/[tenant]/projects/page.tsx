"use client";

import { Plus } from "lucide-react";

export default function ProjectsPage() {
    return (
        <div className="p-8">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
                    <p className="mt-2 text-gray-600">
                        Manage your tenant projects
                    </p>
                </div>
                <button className="flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800">
                    <Plus className="h-4 w-4" />
                    New Project
                </button>
            </div>

            {/* Projects Table */}
            <div className="rounded-lg border bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="border-b bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                    Name
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                    Description
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                    Created
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {/* Placeholder rows */}
                            {[1, 2, 3, 4, 5].map((i) => (
                                <tr key={i} className="hover:bg-gray-50">
                                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                                        Project {i}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        Sample project description
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                        2024-01-{i.toString().padStart(2, "0")}
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                                        <button className="text-blue-600 hover:text-blue-800">
                                            Edit
                                        </button>
                                        <button className="ml-4 text-red-600 hover:text-red-800">
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between border-t px-6 py-3">
                    <div className="text-sm text-gray-500">
                        Showing 1 to 5 of 5 results
                    </div>
                    <div className="flex gap-2">
                        <button className="rounded border px-3 py-1 text-sm hover:bg-gray-50">
                            Previous
                        </button>
                        <button className="rounded border px-3 py-1 text-sm hover:bg-gray-50">
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
