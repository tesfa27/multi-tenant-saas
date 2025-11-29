import { ReactNode } from "react";
import Providers from "../providers";
import Sidebar from "@/components/sidebar";

export default function TenantLayout({
    children,
    params,
}: {
    children: ReactNode;
    params: Promise<{ tenant: string }>;
}) {
    return (
        <Providers>
            <div className="flex h-screen overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-y-auto bg-white">
                    {children}
                </main>
            </div>
        </Providers>
    );
}
