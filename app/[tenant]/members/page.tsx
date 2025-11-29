"use client";

import { UserPlus } from "lucide-react";

export default function MembersPage() {
    return (
        <div className="p-8">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Members</h1>
                    <p className="mt-2 text-gray-600">
                        Manage your team members and their roles
                    </p>
                </div>
                <button className="flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800">
                    <UserPlus className="h-4 w-4" />
                    Add Member
                </button>
            </div>

            {/* Members Table */}
            <div className="rounded-lg border bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="border-b bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                    Member
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                    Email
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                    Role
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                    Joined
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {/* Placeholder rows */}
                            {[
                                { name: "John Doe", email: "john@example.com", role: "OWNER" },
                                { name: "Jane Smith", email: "jane@example.com", role: "ADMIN" },
                                { name: "Bob Johnson", email: "bob@example.com", role: "USER" },
                                { name: "Alice Williams", email: "alice@example.com", role: "USER" },
                            ].map((member, i) => (
                                <tr key={i} className="hover:bg-gray-50">
                                    <td className="whitespace-nowrap px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-gray-300" />
                                            <div className="text-sm font-medium text-gray-900">
                                                {member.name}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                        {member.email}
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4">
                                        <span
                                            className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${member.role === "OWNER"
                                                    ? "bg-purple-100 text-purple-800"
                                                    : member.role === "ADMIN"
                                                        ? "bg-blue-100 text-blue-800"
                                                        : "bg-gray-100 text-gray-800"
                                                }`}
                                        >
                                            {member.role}
                                        </span>
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                        2024-01-{(i + 1).toString().padStart(2, "0")}
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                                        <button className="text-blue-600 hover:text-blue-800">
                                            Edit Role
                                        </button>
                                        {member.role !== "OWNER" && (
                                            <button className="ml-4 text-red-600 hover:text-red-800">
                                                Remove
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between border-t px-6 py-3">
                    <div className="text-sm text-gray-500">
                        Showing 1 to 4 of 4 members
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
