"use client";

import { useRouter, useParams } from "next/navigation";
import { Check, ChevronsUpDown } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

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
        <div className="relative">
            <button
                onClick={() => setOpen(!open)}
                className="flex w-full items-center justify-between rounded-lg border bg-white px-3 py-2 text-sm hover:bg-gray-50"
            >
                <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded bg-gray-900 text-xs font-bold text-white">
                        {currentTenantData?.name.charAt(0) || "?"}
                    </div>
                    <span className="font-medium">
                        {currentTenantData?.name || currentTenant}
                    </span>
                </div>
                <ChevronsUpDown className="h-4 w-4 text-gray-500" />
            </button>

            {open && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setOpen(false)}
                    />

                    {/* Dropdown */}
                    <div className="absolute left-0 right-0 top-full z-20 mt-1 rounded-lg border bg-white shadow-lg">
                        <div className="p-1">
                            {MOCK_TENANTS.map((tenant) => (
                                <button
                                    key={tenant.id}
                                    onClick={() => handleTenantSwitch(tenant.slug)}
                                    className={cn(
                                        "flex w-full items-center gap-2 rounded px-2 py-2 text-sm hover:bg-gray-100",
                                        tenant.slug === currentTenant && "bg-gray-50"
                                    )}
                                >
                                    <div className="flex h-6 w-6 items-center justify-center rounded bg-gray-900 text-xs font-bold text-white">
                                        {tenant.name.charAt(0)}
                                    </div>
                                    <span className="flex-1 text-left">{tenant.name}</span>
                                    {tenant.slug === currentTenant && (
                                        <Check className="h-4 w-4 text-gray-900" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
