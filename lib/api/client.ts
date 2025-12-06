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

// Token refresh queue handling
let isRefreshing = false;
let failedQueue: any[] = [];

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

        // Handle non-JSON responses (e.g., 204 No Content)
        if (response.status === 204) {
            return {} as T;
        }

        // Intercept 401s to refresh token
        if (response.status === 401 && !skipAuth && !_retry) {
            if (isRefreshing) {
                // If already refreshing, queue this request
                return new Promise(function (resolve, reject) {
                    failedQueue.push({ resolve, reject });
                })
                    .then(() => {
                        return apiClient<T>(url, { ...options, _retry: true });
                    })
                    .catch((err) => {
                        return Promise.reject(err);
                    });
            }

            // Extract tenant from current URL to call refresh endpoint
            const pathParts = window.location.pathname.split("/");
            const tenant = pathParts[1];

            if (tenant) {
                options._retry = true;
                isRefreshing = true;

                try {
                    // Call refresh endpoint directly (avoiding circular dependency)
                    const refreshResponse = await fetch(`/api/${tenant}/auth/refresh`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                    });

                    if (!refreshResponse.ok) {
                        throw new Error("Refresh failed");
                    }

                    // Refresh success - process queue
                    processQueue(null, true);
                    isRefreshing = false;

                    // Retry original request (with _retry=true to prevent infinite loop)
                    return apiClient<T>(url, { ...options, _retry: true });
                } catch (refreshError) {
                    // Refresh failed - reject queue
                    processQueue(refreshError, null);
                    isRefreshing = false;

                    // Proceed to legacy redirect logic below...
                }
            }
        }

        const data = await response.json();

        // Handle error responses
        if (!response.ok) {
            // 401 Unauthorized - redirect to login
            if (response.status === 401 && !skipAuth) {
                // Extract tenant from current URL
                const pathParts = window.location.pathname.split("/");
                const tenant = pathParts[1]; // Assumes /{tenant}/... structure

                if (tenant && !window.location.pathname.includes("/auth/")) {
                    window.location.href = `/auth/${tenant}/login`;
                }
            }

            throw new ApiError(
                data.error || data.message || "An error occurred",
                response.status,
                data
            );
        }

        return data;
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }

        // Network or other errors
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
