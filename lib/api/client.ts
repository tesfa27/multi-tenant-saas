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
}

/**
 * Base fetch wrapper with error handling
 */
export async function apiClient<T = any>(
    url: string,
    options: FetchOptions = {}
): Promise<T> {
    const { skipAuth, ...fetchOptions } = options;

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
