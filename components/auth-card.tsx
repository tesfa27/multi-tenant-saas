import { ReactNode } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

interface AuthCardProps {
    title: string;
    description: string;
    tenantName?: string;
    children: ReactNode;
}

export default function AuthCard({
    title,
    description,
    tenantName,
    children,
}: AuthCardProps) {
    return (
        <Card className="w-full max-w-md">
            <CardHeader className="space-y-4">
                {/* Tenant Branding */}
                {tenantName && (
                    <div className="flex items-center justify-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-xl font-bold text-primary-foreground">
                            {tenantName.charAt(0).toUpperCase()}
                        </div>
                    </div>
                )}

                <div className="space-y-2 text-center">
                    {tenantName && (
                        <p className="text-sm font-medium text-muted-foreground">
                            {tenantName}
                        </p>
                    )}
                    <CardTitle className="text-2xl">{title}</CardTitle>
                    <CardDescription>{description}</CardDescription>
                </div>
            </CardHeader>
            <CardContent>{children}</CardContent>
        </Card>
    );
}
