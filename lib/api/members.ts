import { apiClient } from "./client";

export interface Member {
    id: string;
    userId: string;
    tenantId: string;
    role: "OWNER" | "ADMIN" | "USER";
    createdAt: string;
    updatedAt: string;
    user: {
        id: string;
        name: string;
        email: string;
    };
}

export interface AddMemberData {
    email: string;
    role: "ADMIN" | "USER";
}

export interface UpdateMemberRoleData {
    role: "ADMIN" | "USER";
}

export interface MembersResponse {
    members: Member[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export const getMembers = async (
    tenantId: string,
    page = 1,
    limit = 10,
    search = ""
): Promise<MembersResponse> => {
    const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
    });
    if (search) params.append("search", search);

    return apiClient<MembersResponse>(
        `/api/${tenantId}/members?${params.toString()}`
    );
};

export const addMember = async (
    tenantId: string,
    data: AddMemberData
): Promise<Member> => {
    return apiClient<Member>(`/api/${tenantId}/members`, {
        method: "POST",
        body: JSON.stringify(data),
    });
};

export const updateMemberRole = async (
    tenantId: string,
    memberId: string,
    data: UpdateMemberRoleData
): Promise<Member> => {
    return apiClient<Member>(`/api/${tenantId}/members/${memberId}`, {
        method: "PUT",
        body: JSON.stringify(data),
    });
};

export const removeMember = async (
    tenantId: string,
    memberId: string
): Promise<void> => {
    return apiClient<void>(`/api/${tenantId}/members/${memberId}`, {
        method: "DELETE",
    });
};
