"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

import AuthCard from "@/components/auth-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { loginSchema, type LoginFormData } from "@/lib/auth-schemas";

export default function LoginPage() {
    const router = useRouter();
    const params = useParams();
    const tenant = params.tenant as string;

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            rememberMe: false,
        },
    });

    const onSubmit = async (data: LoginFormData) => {
        setIsLoading(true);
        setError(null);

        try {
            // Mock API call - simulate network delay
            await new Promise((resolve) => setTimeout(resolve, 1500));

            // Mock validation - accept any email/password for demo
            if (data.email && data.password.length >= 6) {
                // Success - redirect to tenant dashboard
                router.push(`/${tenant}`);
            } else {
                throw new Error("Invalid credentials");
            }
        } catch (err: any) {
            setError(err.message || "Invalid email or password. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthCard
            title="Sign In"
            description="Enter your credentials to access your account"
            tenantName={tenant}
        >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Error Alert */}
                {error && (
                    <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {/* Email Field */}
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        {...register("email")}
                        disabled={isLoading}
                    />
                    {errors.email && (
                        <p className="text-sm text-destructive">{errors.email.message}</p>
                    )}
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="password">Password</Label>
                        <Link
                            href={`/auth/${tenant}/forgot-password`}
                            className="text-sm text-muted-foreground hover:text-primary"
                        >
                            Forgot password?
                        </Link>
                    </div>
                    <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        {...register("password")}
                        disabled={isLoading}
                    />
                    {errors.password && (
                        <p className="text-sm text-destructive">
                            {errors.password.message}
                        </p>
                    )}
                </div>

                {/* Remember Me Checkbox */}
                <div className="flex items-center space-x-2">
                    <input
                        id="rememberMe"
                        type="checkbox"
                        {...register("rememberMe")}
                        disabled={isLoading}
                        className="h-4 w-4 rounded border-gray-300"
                    />
                    <Label
                        htmlFor="rememberMe"
                        className="text-sm font-normal text-muted-foreground"
                    >
                        Remember me for 30 days
                    </Label>
                </div>

                {/* Submit Button */}
                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Signing in...
                        </>
                    ) : (
                        "Sign In"
                    )}
                </Button>

                {/* Register Link */}
                <div className="text-center text-sm text-muted-foreground">
                    Don't have an account?{" "}
                    <Link
                        href={`/auth/${tenant}/register`}
                        className="font-medium text-primary hover:underline"
                    >
                        Sign up
                    </Link>
                </div>
            </form>
        </AuthCard>
    );
}
