"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/lib/hooks/use-auth";

interface AuthGuardProps {
    children: React.ReactNode;
    tenantId: string;
}

export function AuthGuard({ children, tenantId }: AuthGuardProps) {
    const router = useRouter();
    const { isAuthenticated, isLoading } = useAuth(tenantId);

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push(`/auth/${tenantId}/login`);
        }
    }, [isAuthenticated, isLoading, router, tenantId]);

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="text-center">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return null; // Will redirect in useEffect
    }

    return <>{children}</>;
}
