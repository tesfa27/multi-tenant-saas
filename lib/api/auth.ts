import { apiClient, buildApiUrl } from "./client";

/**
 * Authentication API Types
 */
export interface LoginRequest {
    email: string;
    password: string;
    rememberMe?: boolean;
}

export interface RegisterRequest {
    name: string;
    email: string;
    password: string;
}

export interface User {
    id: string;
    name: string;
    email: string;
    tenantId: string;
    role: string;
}

export interface LoginResponse {
    message: string;
    user: User;
}

export interface RegisterResponse {
    message: string;
    user: User;
}

export interface MeResponse {
    user: User;
}

/**
 * Authentication API Functions
 */

/**
 * Login user
 */
export async function loginUser(
    tenant: string,
    credentials: LoginRequest
): Promise<LoginResponse> {
    return apiClient<LoginResponse>(
        buildApiUrl(tenant, "/auth/login"),
        {
            method: "POST",
            body: JSON.stringify(credentials),
            skipAuth: true, // Don't redirect on 401 for login page
        }
    );
}

/**
 * Register new user
 */
export async function registerUser(
    tenant: string,
    data: RegisterRequest
): Promise<RegisterResponse> {
    return apiClient<RegisterResponse>(
        buildApiUrl(tenant, "/auth/register"),
        {
            method: "POST",
            body: JSON.stringify(data),
            skipAuth: true, // Don't redirect on 401 for register page
        }
    );
}

/**
 * Logout user
 */
export async function logoutUser(tenant: string): Promise<{ message: string }> {
    return apiClient<{ message: string }>(
        buildApiUrl(tenant, "/auth/logout"),
        {
            method: "POST",
        }
    );
}

/**
 * Get current user
 */
export async function getCurrentUser(tenant: string): Promise<MeResponse> {
    return apiClient<MeResponse>(buildApiUrl(tenant, "/auth/me"));
}

/**
 * Refresh access token
 */
export async function refreshToken(tenant: string): Promise<{ message: string }> {
    return apiClient<{ message: string }>(
        buildApiUrl(tenant, "/auth/refresh"),
        {
            method: "POST",
        }
    );
}

/**
 * Request password reset (placeholder - endpoint needs to be created)
 */
export async function requestPasswordReset(
    tenant: string,
    email: string
): Promise<{ message: string }> {
    return apiClient<{ message: string }>(
        buildApiUrl(tenant, "/auth/forgot-password"),
        {
            method: "POST",
            body: JSON.stringify({ email }),
            skipAuth: true,
        }
    );
}

/**
 * Validate password reset token (placeholder - endpoint needs to be created)
 */
export async function validateResetToken(
    tenant: string,
    token: string
): Promise<{ valid: boolean }> {
    return apiClient<{ valid: boolean }>(
        buildApiUrl(tenant, `/auth/validate-reset-token?token=${token}`),
        {
            skipAuth: true,
        }
    );
}

/**
 * Reset password (placeholder - endpoint needs to be created)
 */
export async function resetPassword(
    tenant: string,
    token: string,
    password: string
): Promise<{ message: string }> {
    return apiClient<{ message: string }>(
        buildApiUrl(tenant, "/auth/reset-password"),
        {
            method: "POST",
            body: JSON.stringify({ token, password }),
            skipAuth: true,
        }
    );
}
