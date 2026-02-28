import { apiFetch } from "../../shared/api/client";
import type { MaterialDTO } from "../../types";

export interface ImportMaterialsRequest {
    type?: "auto" | "sentence" | "phrase" | "word";
    tags?: string[];
    lines: string[];
}

export interface ImportMaterialsResponse {
    successCount: number;
    failCount: number;
    fails?: { line: string; reason: string }[];
}

export interface GetMaterialsParams {
    query?: string;
    type?: string;
    enabled?: boolean;
    page?: number;
    size?: number;
}

export interface GetMaterialsResponse {
    items: MaterialDTO[];
    total: number;
}

export const materialsApi = {
    import: (data: ImportMaterialsRequest) =>
        apiFetch<ImportMaterialsResponse>("api/materials/import", {
            method: "POST",
            json: data,
        }),

    getList: async (params: GetMaterialsParams): Promise<GetMaterialsResponse> => {
        const res = await apiFetch<MaterialDTO[]>(`api/materials`);
        let filtered = res;

        if (params.query) {
            const q = params.query.toLowerCase();
            filtered = filtered.filter(m =>
                m.content.toLowerCase().includes(q) ||
                (m.tags && m.tags.some(t => t.toLowerCase().includes(q)))
            );
        }
        if (params.type) {
            filtered = filtered.filter(m => m.type === params.type);
        }
        if (params.enabled !== undefined) {
            filtered = filtered.filter(m => m.enabled === params.enabled);
        }

        const total = filtered.length;
        const page = params.page || 1;
        const size = params.size || 10;

        // 1-indexed to 0-indexed slicing
        const items = filtered.slice((page - 1) * size, page * size);

        return { items, total };
    },

    update: (id: string, data: Partial<Pick<MaterialDTO, "enabled" | "type" | "tags" | "content">>) =>
        apiFetch<MaterialDTO>(`api/materials/${id}`, {
            method: "PATCH",
            json: data,
        }),
};
