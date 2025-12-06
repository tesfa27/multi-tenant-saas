import { apiClient } from "./client";

export interface Project {
    id: string;
    name: string;
    description?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateProjectData {
    name: string;
    description?: string;
}

export interface UpdateProjectData {
    name?: string;
    description?: string;
}

export interface ProjectsResponse {
    projects: Project[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export const getProjects = async (
    tenantId: string,
    page = 1,
    limit = 10,
    search = ""
): Promise<ProjectsResponse> => {
    const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
    });
    if (search) params.append("search", search);

    return apiClient<ProjectsResponse>(
        `/api/${tenantId}/projects?${params.toString()}`
    );
};

export const createProject = async (
    tenantId: string,
    data: CreateProjectData
): Promise<Project> => {
    return apiClient<Project>(`/api/${tenantId}/projects`, {
        method: "POST",
        body: JSON.stringify(data),
    });
};

export const updateProject = async (
    tenantId: string,
    projectId: string,
    data: UpdateProjectData
): Promise<Project> => {
    return apiClient<Project>(`/api/${tenantId}/projects/${projectId}`, {
        method: "PUT",
        body: JSON.stringify(data),
    });
};

export const deleteProject = async (
    tenantId: string,
    projectId: string
): Promise<void> => {
    return apiClient<void>(`/api/${tenantId}/projects/${projectId}`, {
        method: "DELETE",
    });
};
