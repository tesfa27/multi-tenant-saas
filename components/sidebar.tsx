"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, FolderKanban, Users } from "lucide-react";

const navigation = [
    { name: "Dashboard", href: "", icon: LayoutDashboard },
    { name: "Projects", href: "/projects", icon: FolderKanban },
    { name: "Members", href: "/members", icon: Users },
];

export default function Sidebar() {
    const params = useParams();
    const pathname = usePathname();
    const tenant = params.tenant as string;

    return (
        <div className="flex h-screen w-64 flex-col border-r bg-gray-50">
            {/* Logo/Tenant Name */}
            <div className="flex h-16 items-center border-b px-6">
                <h1 className="text-xl font-bold">{tenant}</h1>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 px-3 py-4">
                {navigation.map((item) => {
                    const href = `/${tenant}${item.href}`;
                    const isActive = pathname === href;

                    return (
                        <Link
                            key={item.name}
                            href={href}
                            className={cn(
                                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-gray-900 text-white"
                                    : "text-gray-700 hover:bg-gray-200"
                            )}
                        >
                            <item.icon className="h-5 w-5" />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            {/* User Section (Placeholder) */}
            <div className="border-t p-4">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-gray-300" />
                    <div className="text-sm">
                        <p className="font-medium">User Name</p>
                        <p className="text-gray-500">user@example.com</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
