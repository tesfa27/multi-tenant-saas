"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, FolderKanban, Users, LogOut, Loader2 } from "lucide-react";
import TenantSwitcher from "./tenant-switcher";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/lib/hooks/use-auth";

const navigation = [
    { name: "Dashboard", href: "", icon: LayoutDashboard },
    { name: "Projects", href: "/projects", icon: FolderKanban },
    { name: "Members", href: "/members", icon: Users },
];

export default function Sidebar() {
    const params = useParams();
    const pathname = usePathname();
    const tenant = params.tenant as string;
    const { user, isLoading, logout } = useAuth(tenant);

    // Get user initials
    const getUserInitials = (name?: string) => {
        if (!name) return "U";
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <div className="flex h-screen w-64 flex-col border-r bg-background">
            {/* Tenant Switcher */}
            <div className="p-4">
                <TenantSwitcher />
            </div>

            <Separator />

            {/* Navigation */}
            <nav className="flex-1 space-y-1 p-3">
                {navigation.map((item) => {
                    const href = `/${tenant}${item.href}`;
                    const isActive = pathname === href;

                    return (
                        <Button
                            key={item.name}
                            variant={isActive ? "secondary" : "ghost"}
                            className="w-full justify-start"
                            asChild
                        >
                            <Link href={href}>
                                <item.icon className="mr-2 h-4 w-4" />
                                {item.name}
                            </Link>
                        </Button>
                    );
                })}
            </nav>

            <Separator />

            {/* User Section */}
            <div className="p-4">
                {isLoading ? (
                    <div className="flex items-center gap-3">
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Loading...</span>
                    </div>
                ) : user ? (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                className="w-full justify-start px-2 py-6 h-auto"
                            >
                                <div className="flex items-center gap-3 w-full">
                                    <Avatar>
                                        <AvatarFallback>
                                            {getUserInitials(user.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 text-left text-sm">
                                        <p className="font-medium">{user.name}</p>
                                        <p className="text-muted-foreground truncate">
                                            {user.email}
                                        </p>
                                    </div>
                                </div>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel>My Account</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={logout}>
                                <LogOut className="mr-2 h-4 w-4" />
                                Logout
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                ) : (
                    <div className="text-sm text-muted-foreground">Not logged in</div>
                )}
            </div>
        </div>
    );
}
