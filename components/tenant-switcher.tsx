"use client";

import { useRouter, useParams } from "next/navigation";
import { Check, ChevronsUpDown } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// Mock data - in real app, fetch from API
const MOCK_TENANTS = [
    { id: "1", name: "Acme Corp", slug: "acme-corp" },
    { id: "2", name: "Tech Startup", slug: "tech-startup" },
    { id: "3", name: "Enterprise Inc", slug: "enterprise-inc" },
];

export default function TenantSwitcher() {
    const router = useRouter();
    const params = useParams();
    const currentTenant = params.tenant as string;
    const [open, setOpen] = useState(false);

    const currentTenantData = MOCK_TENANTS.find((t) => t.slug === currentTenant);

    const handleTenantSwitch = (slug: string) => {
        router.push(`/${slug}`);
        setOpen(false);
    };

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between"
                >
                    <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                            <AvatarFallback className="bg-primary text-xs text-primary-foreground">
                                {currentTenantData?.name.charAt(0) || "?"}
                            </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">
                            {currentTenantData?.name || currentTenant}
                        </span>
                    </div>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[240px]" align="start">
                {MOCK_TENANTS.map((tenant) => (
                    <DropdownMenuItem
                        key={tenant.id}
                        onSelect={() => handleTenantSwitch(tenant.slug)}
                        className="flex items-center gap-2"
                    >
                        <Avatar className="h-6 w-6">
                            <AvatarFallback className="bg-primary text-xs text-primary-foreground">
                                {tenant.name.charAt(0)}
                            </AvatarFallback>
                        </Avatar>
                        <span className="flex-1">{tenant.name}</span>
                        {tenant.slug === currentTenant && (
                            <Check className="h-4 w-4" />
                        )}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
