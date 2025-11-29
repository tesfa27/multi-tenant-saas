"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Check, X, AlertCircle } from "lucide-react";

import AuthCard from "@/components/auth-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { resetPasswordSchema, type ResetPasswordFormData } from "@/lib/auth-schemas";

// Password strength checker (reused from register)
const getPasswordStrength = (password: string): {
    score: number;
    label: string;
    color: string;
} => {
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;

    if (score <= 2) return { score, label: "Weak", color: "text-red-500" };
    if (score <= 3) return { score, label: "Fair", color: "text-yellow-500" };
    if (score <= 4) return { score, label: "Good", color: "text-blue-500" };
    return { score, label: "Strong", color: "text-green-500" };
};

export default function ResetPasswordPage() {
    const router = useRouter();
    const params = useParams();
    const searchParams = useSearchParams();
    const tenant = params.tenant as string;
    const token = searchParams.get("token");

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [tokenValid, setTokenValid] = useState<boolean | null>(null);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<ResetPasswordFormData>({
        resolver: zodResolver(resetPasswordSchema),
    });

    const password = watch("password", "");
    const passwordStrength = password ? getPasswordStrength(password) : null;

    // Validate token on mount
    useEffect(() => {
        const validateToken = async () => {
            if (!token) {
                setTokenValid(false);
                return;
            }

            // Mock token validation
            await new Promise((resolve) => setTimeout(resolve, 1000));

            // Placeholder: In real app, validate token via API
            // GET /api/[tenant]/auth/validate-reset-token?token=xyz

            // Mock: Accept any token that's at least 10 characters
            setTokenValid(token.length >= 10);
        };

        validateToken();
    }, [token]);

    const onSubmit = async (data: ResetPasswordFormData) => {
        setIsLoading(true);
        setError(null);

        try {
            // Mock API call - simulate network delay
            await new Promise((resolve) => setTimeout(resolve, 1500));

            // Placeholder: In real app, reset password via API
            // POST /api/[tenant]/auth/reset-password
            // Body: { token, password }

            setSuccess(true);

            // Redirect to login after 2s
            setTimeout(() => {
                router.push(`/auth/${tenant}/login`);
            }, 2000);
        } catch (err: any) {
            setError(err.message || "Failed to reset password. Please try again.");
            setIsLoading(false);
        }
    };

    // Loading state while validating token
    if (tokenValid === null) {
        return (
            <AuthCard
                title="Reset Password"
                description="Validating your reset link..."
                tenantName={tenant}
            >
                <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            </AuthCard>
        );
    }

    // Invalid token state
    if (!tokenValid) {
        return (
            <AuthCard
                title="Invalid Reset Link"
                description="This password reset link is invalid or has expired"
                tenantName={tenant}
            >
                <div className="space-y-4">
                    <div className="rounded-lg bg-destructive/10 p-4 text-center">
                        <AlertCircle className="mx-auto mb-2 h-12 w-12 text-destructive" />
                        <p className="text-sm text-muted-foreground">
                            The reset link you used is invalid or has expired.
                        </p>
                    </div>

                    <Button asChild className="w-full">
                        <Link href={`/auth/${tenant}/forgot-password`}>
                            Request New Reset Link
                        </Link>
                    </Button>

                    <div className="text-center">
                        <Link
                            href={`/auth/${tenant}/login`}
                            className="text-sm text-muted-foreground hover:text-primary"
                        >
                            Back to Sign In
                        </Link>
                    </div>
                </div>
            </AuthCard>
        );
    }

    // Success state
    if (success) {
        return (
            <AuthCard
                title="Password Reset!"
                description="Your password has been successfully reset"
                tenantName={tenant}
            >
                <div className="space-y-4 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                        <Check className="h-6 w-6 text-green-600" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Redirecting to login page...
                    </p>
                </div>
            </AuthCard>
        );
    }

    // Reset password form
    return (
        <AuthCard
            title="Reset Password"
            description="Enter your new password"
            tenantName={tenant}
        >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Error Alert */}
                {error && (
                    <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {/* New Password Field */}
                <div className="space-y-2">
                    <Label htmlFor="password">New Password</Label>
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

                    {/* Password Strength Indicator */}
                    {passwordStrength && (
                        <div className="space-y-2">
                            <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map((level) => (
                                    <div
                                        key={level}
                                        className={cn(
                                            "h-1 flex-1 rounded-full transition-colors",
                                            level <= passwordStrength.score
                                                ? passwordStrength.score <= 2
                                                    ? "bg-red-500"
                                                    : passwordStrength.score <= 3
                                                        ? "bg-yellow-500"
                                                        : passwordStrength.score <= 4
                                                            ? "bg-blue-500"
                                                            : "bg-green-500"
                                                : "bg-gray-200"
                                        )}
                                    />
                                ))}
                            </div>
                            <p className={cn("text-xs font-medium", passwordStrength.color)}>
                                Password strength: {passwordStrength.label}
                            </p>
                        </div>
                    )}

                    {/* Password Requirements */}
                    <div className="space-y-1 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                            {password.length >= 8 ? (
                                <Check className="h-3 w-3 text-green-500" />
                            ) : (
                                <X className="h-3 w-3 text-gray-400" />
                            )}
                            <span>At least 8 characters</span>
                        </div>
                        <div className="flex items-center gap-1">
                            {/[A-Z]/.test(password) && /[a-z]/.test(password) ? (
                                <Check className="h-3 w-3 text-green-500" />
                            ) : (
                                <X className="h-3 w-3 text-gray-400" />
                            )}
                            <span>Uppercase and lowercase letters</span>
                        </div>
                        <div className="flex items-center gap-1">
                            {/\d/.test(password) ? (
                                <Check className="h-3 w-3 text-green-500" />
                            ) : (
                                <X className="h-3 w-3 text-gray-400" />
                            )}
                            <span>At least one number</span>
                        </div>
                    </div>
                </div>

                {/* Confirm Password Field */}
                <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="••••••••"
                        {...register("confirmPassword")}
                        disabled={isLoading}
                    />
                    {errors.confirmPassword && (
                        <p className="text-sm text-destructive">
                            {errors.confirmPassword.message}
                        </p>
                    )}
                </div>

                {/* Submit Button */}
                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Resetting password...
                        </>
                    ) : (
                        "Reset Password"
                    )}
                </Button>

                {/* Back to Login Link */}
                <div className="text-center">
                    <Link
                        href={`/auth/${tenant}/login`}
                        className="text-sm text-muted-foreground hover:text-primary"
                    >
                        Back to Sign In
                    </Link>
                </div>
            </form>
        </AuthCard>
    );
}
