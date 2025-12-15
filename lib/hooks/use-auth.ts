import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { getCurrentUser, logoutUser, refreshToken } from "@/lib/api/auth";
import type { User } from "@/lib/api/auth";

export const useAuth = (tenantId: string) => {
    const router = useRouter();
    const queryClient = useQueryClient();

    // Fetch current user
    const {
        data: user,
        isLoading,
        isError,
        refetch,
    } = useQuery<User | null>({
        queryKey: ["auth", "user", tenantId],
        queryFn: async () => {
            try {
                const response = await getCurrentUser(tenantId);
                return response.user;
            } catch (error) {
                return null;
            }
        },
        retry: false,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    // Logout mutation
    const logoutMutation = useMutation({
        mutationFn: async () => {
            await logoutUser(tenantId);
        },
        onSuccess: () => {
            // Clear all queries
            queryClient.clear();
            // Redirect to login
            router.push(`/${tenantId}/auth/login`);
        },
    });

    // Token refresh mutation
    const refreshMutation = useMutation({
        mutationFn: async () => {
            return await refreshToken(tenantId);
        },
        onSuccess: () => {
            // Refetch user data after token refresh
            refetch();
        },
        onError: () => {
            // If refresh fails, logout
            logoutMutation.mutate();
        },
    });

    // Auto-refresh token before expiry
    // This would typically be triggered by API error interceptor
    const handleTokenRefresh = async () => {
        try {
            await refreshMutation.mutateAsync();
        } catch (error) {
            console.error("Token refresh failed:", error);
        }
    };

    return {
        user,
        isLoading,
        isAuthenticated: !!user && !isError,
        isError,
        logout: () => logoutMutation.mutate(),
        refreshToken: handleTokenRefresh,
        refetch,
    };
};
