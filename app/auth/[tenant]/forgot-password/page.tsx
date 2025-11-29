"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Mail, ArrowLeft } from "lucide-react";

import AuthCard from "@/components/auth-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { forgotPasswordSchema, type ForgotPasswordFormData } from "@/lib/auth-schemas";

export default function ForgotPasswordPage() {
    const params = useParams();
    const tenant = params.tenant as string;

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [submittedEmail, setSubmittedEmail] = useState("");

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ForgotPasswordFormData>({
        resolver: zodResolver(forgotPasswordSchema),
    });

    const onSubmit = async (data: ForgotPasswordFormData) => {
        setIsLoading(true);
        setError(null);

        try {
            // Mock API call - simulate network delay
            await new Promise((resolve) => setTimeout(resolve, 1500));

            // Placeholder: In real app, send reset email via API
            // POST /api/[tenant]/auth/forgot-password

            setSubmittedEmail(data.email);
            setSuccess(true);
        } catch (err: any) {
            setError(err.message || "Failed to send reset link. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    if (success) {
        return (
            <AuthCard
                title="Check Your Email"
                description="We've sent you a password reset link"
                tenantName={tenant}
            >
                <div className="space-y-4">
                    <div className="rounded-lg bg-muted p-4 text-center">
                        <Mail className="mx-auto mb-2 h-12 w-12 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                            We've sent a password reset link to
                        </p>
                        <p className="mt-1 font-medium">{submittedEmail}</p>
                    </div>

                    <div className="space-y-2 text-sm text-muted-foreground">
                        <p>Please check your email and click the link to reset your password.</p>
                        <p>If you don't see the email, check your spam folder.</p>
                    </div>

                    <Button asChild className="w-full" variant="outline">
                        <Link href={`/auth/${tenant}/login`}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Sign In
                        </Link>
                    </Button>

                    <div className="text-center text-sm text-muted-foreground">
                        Didn't receive the email?{" "}
                        <button
                            onClick={() => setSuccess(false)}
                            className="font-medium text-primary hover:underline"
                        >
                            Try again
                        </button>
                    </div>
                </div>
            </AuthCard>
        );
    }

    return (
        <AuthCard
            title="Forgot Password?"
            description="Enter your email to receive a reset link"
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

                {/* Submit Button */}
                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Sending reset link...
                        </>
                    ) : (
                        "Send Reset Link"
                    )}
                </Button>

                {/* Back to Login Link */}
                <div className="text-center">
                    <Link
                        href={`/auth/${tenant}/login`}
                        className="text-sm text-muted-foreground hover:text-primary"
                    >
                        <ArrowLeft className="mr-1 inline h-3 w-3" />
                        Back to Sign In
                    </Link>
                </div>
            </form>
        </AuthCard>
    );
}
