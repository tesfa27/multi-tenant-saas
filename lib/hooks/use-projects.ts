import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    getProjects,
    createProject,
    updateProject,
    deleteProject,
    type CreateProjectData,
    type UpdateProjectData,
} from "@/lib/api/projects";

export const useProjects = (
    tenantId: string,
    page = 1,
    limit = 10,
    search = ""
) => {
    return useQuery({
        queryKey: ["projects", tenantId, page, limit, search],
        queryFn: () => getProjects(tenantId, page, limit, search),
        placeholderData: (previousData) => previousData, // Keep previous data while fetching new page
    });
};

export const useCreateProject = (tenantId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateProjectData) => createProject(tenantId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["projects", tenantId] });
        },
    });
};

export const useUpdateProject = (tenantId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            projectId,
            data,
        }: {
            projectId: string;
            data: UpdateProjectData;
        }) => updateProject(tenantId, projectId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["projects", tenantId] });
        },
    });
};

export const useDeleteProject = (tenantId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (projectId: string) => deleteProject(tenantId, projectId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["projects", tenantId] });
        },
    });
};
