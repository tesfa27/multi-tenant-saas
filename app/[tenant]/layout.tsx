import { ReactNode } from "react";
import Providers from "../providers";
import Sidebar from "@/components/sidebar";
import { AuthGuard } from "@/components/auth-guard";

export default async function TenantLayout({
    children,
    params,
}: {
    children: ReactNode;
    params: Promise<{ tenant: string }>;
}) {
    const { tenant } = await params;

    return (
        <Providers>
            <AuthGuard tenantId={tenant}>
                <div className="flex h-screen overflow-hidden">
                    <Sidebar />
                    <main className="flex-1 overflow-y-auto bg-white">
                        {children}
                    </main>
                </div>
            </AuthGuard>
        </Providers>
    );
}
