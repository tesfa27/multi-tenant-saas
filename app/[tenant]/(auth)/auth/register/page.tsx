"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Check, X } from "lucide-react";

import AuthCard from "@/components/auth-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { registerSchema, type RegisterFormData } from "@/lib/auth-schemas";
import { registerUser } from "@/lib/api/auth";

// Password strength checker
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

export default function RegisterPage() {
    const router = useRouter();
    const params = useParams();
    const tenant = params.tenant as string;

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
    });

    const password = watch("password", "");
    const passwordStrength = password ? getPasswordStrength(password) : null;

    const onSubmit = async (data: RegisterFormData) => {
        setIsLoading(true);
        setError(null);

        try {
            await registerUser(tenant, {
                name: data.name,
                email: data.email,
                password: data.password,
            });

            // Success
            setSuccess(true);

            // Wait 1.5s to show success message, then redirect
            setTimeout(() => {
                router.push(`/auth/${tenant}/login`);
            }, 1500);
        } catch (err: any) {
            setError(err.message || "Registration failed. Please try again.");
            setIsLoading(false);
        }
    };

    if (success) {
        return (
            <AuthCard
                title="Account Created!"
                description="Your account has been successfully created"
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

    return (
        <AuthCard
            title="Create Account"
            description="Sign up to get started with your team"
            tenantName={tenant}
        >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Error Alert */}
                {error && (
                    <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {/* Name Field */}
                <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                        id="name"
                        type="text"
                        placeholder="John Doe"
                        {...register("name")}
                        disabled={isLoading}
                    />
                    {errors.name && (
                        <p className="text-sm text-destructive">{errors.name.message}</p>
                    )}
                </div>

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
                    <Label htmlFor="password">Password</Label>
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
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
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
                            Creating account...
                        </>
                    ) : (
                        "Create Account"
                    )}
                </Button>

                {/* Login Link */}
                <div className="text-center text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <Link
                        href={`/auth/${tenant}/login`}
                        className="font-medium text-primary hover:underline"
                    >
                        Sign in
                    </Link>
                </div>
            </form>
        </AuthCard>
    );
}
