"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import AuthCard from "@/components/auth-card";
import { magicLogin } from "@/lib/api/auth";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function VerifyMagicLinkPage() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();

    const tenant = params.tenant as string;
    const token = searchParams.get("token");

    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!token) {
            setError("Invalid or missing login token.");
            return;
        }

        const verify = async () => {
            try {
                await magicLogin(tenant, token);
                router.replace(`/${tenant}`);
            } catch (err: any) {
                setError(err.message || "Magic link expired or invalid.");
            }
        };

        verify();
    }, [tenant, token, router]);

    return (
        <AuthCard
            title="Signing you in"
            description="Verifying your secure login link"
            tenantName={tenant}
        >
            {!error ? (
                <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                </div>
            ) : (
                <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
        </AuthCard>
    );
}
