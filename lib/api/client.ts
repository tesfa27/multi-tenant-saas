/**
 * Base API client with error handling and automatic redirects
 */

class ApiError extends Error {
    constructor(
        message: string,
        public status: number,
        public data?: any
    ) {
        super(message);
        this.name = "ApiError";
    }
}

interface FetchOptions extends RequestInit {
    skipAuth?: boolean;
    _retry?: boolean;
}

/**
 * Token refresh queue handling
 */
let isRefreshing = false;
let failedQueue: Array<{
    resolve: (value?: any) => void;
    reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: any = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

/**
 * Safely extract tenant from URL
 * Expected path: /{tenant}/...
 */
function getTenantFromPath(): string | null {
    if (typeof window === "undefined") return null;

    const parts = window.location.pathname.split("/").filter(Boolean);
    // parts[0] === tenant
    return parts.length > 0 ? parts[0] : null;
}

/**
 * Base fetch wrapper with error handling
 */
export async function apiClient<T = any>(
    url: string,
    options: FetchOptions = {}
): Promise<T> {
    const { skipAuth, _retry, ...fetchOptions } = options;

    try {
        const response = await fetch(url, {
            ...fetchOptions,
            headers: {
                "Content-Type": "application/json",
                ...fetchOptions.headers,
            },
            credentials: "include", // Include cookies for authentication
        });

        /**
         * 204 No Content
         */
        if (response.status === 204) {
            return {} as T;
        }

        /**
         * Intercept 401 → attempt token refresh
         */
        if (response.status === 401 && !skipAuth && !_retry) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(() => {
                    return apiClient<T>(url, { ...options, _retry: true });
                });
            }

            const tenant = getTenantFromPath();

            if (tenant) {
                isRefreshing = true;

                try {
                    const refreshResponse = await fetch(
                        `/api/${tenant}/auth/refresh`,
                        {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            credentials: "include",
                        }
                    );

                    if (!refreshResponse.ok) {
                        throw new Error("Token refresh failed");
                    }

                    processQueue(null, true);
                    isRefreshing = false;

                    return apiClient<T>(url, { ...options, _retry: true });
                } catch (refreshError) {
                    processQueue(refreshError, null);
                    isRefreshing = false;
                    // Fall through to redirect logic
                }
            }
        }

        /**
         * Parse JSON response
         */
        const data = await response.json();

        /**
         * Handle error responses
         */
        if (!response.ok) {
            if (response.status === 401 && !skipAuth) {
                const tenant = getTenantFromPath();
                const pathname = window.location.pathname;

                // Avoid redirect loops on auth pages
                const isAuthPage =
                    pathname.includes("/auth/login") ||
                    pathname.includes("/auth/register") ||
                    pathname.includes("/auth/verify");

                if (tenant && !isAuthPage) {
                    window.location.href = `/${tenant}/auth/login`;
                }
            }

            throw new ApiError(
                data?.error || data?.message || "An error occurred",
                response.status,
                data
            );
        }

        return data;
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }

        throw new ApiError(
            "Network error. Please check your connection.",
            0
        );
    }
}

/**
 * Helper to build API URLs
 */
export function buildApiUrl(tenant: string, path: string): string {
    return `/api/${tenant}${path}`;
}
