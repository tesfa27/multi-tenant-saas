import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    getMembers,
    addMember,
    updateMemberRole,
    removeMember,
    type AddMemberData,
    type UpdateMemberRoleData,
} from "@/lib/api/members";

export const useMembers = (
    tenantId: string,
    page = 1,
    limit = 10,
    search = ""
) => {
    return useQuery({
        queryKey: ["members", tenantId, page, limit, search],
        queryFn: () => getMembers(tenantId, page, limit, search),
        placeholderData: (previousData) => previousData, // Keep previous data while fetching new page
    });
};

export const useAddMember = (tenantId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: AddMemberData) => addMember(tenantId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["members", tenantId] });
        },
    });
};

export const useUpdateMemberRole = (tenantId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            memberId,
            data,
        }: {
            memberId: string;
            data: UpdateMemberRoleData;
        }) => updateMemberRole(tenantId, memberId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["members", tenantId] });
        },
    });
};

export const useRemoveMember = (tenantId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (memberId: string) => removeMember(tenantId, memberId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["members", tenantId] });
        },
    });
};
