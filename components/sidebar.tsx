"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, FolderKanban, Users } from "lucide-react";
import TenantSwitcher from "./tenant-switcher";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

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
                <div className="flex items-center gap-3">
                    <Avatar>
                        <AvatarFallback>UN</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-sm">
                        <p className="font-medium">User Name</p>
                        <p className="text-muted-foreground">user@example.com</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
