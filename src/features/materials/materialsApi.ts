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

    getList: (params: GetMaterialsParams) => {
        const searchParams = new URLSearchParams();
        if (params.query) searchParams.append("query", params.query);
        if (params.type) searchParams.append("type", params.type);
        if (params.enabled !== undefined) searchParams.append("enabled", String(params.enabled));
        if (params.page !== undefined) searchParams.append("page", String(params.page));
        if (params.size !== undefined) searchParams.append("size", String(params.size));

        return apiFetch<GetMaterialsResponse>(`api/materials?${searchParams.toString()}`);
    },

    update: (id: string, data: Partial<Pick<MaterialDTO, "enabled" | "type" | "tags" | "content">>) =>
        apiFetch<MaterialDTO>(`api/materials/${id}`, {
            method: "PATCH",
            json: data,
        }),
};
