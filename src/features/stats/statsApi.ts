import { apiFetch } from "../../shared/api/client";

export interface StatsOverview {
    totalMaterialsCount: number;
    practicedMaterialsCount: number;
    practiceCoverage: number;
    unpracticedMaterialsCount: number;
}

export interface ErrorTypeStat {
    errorType: string;
    count: number;
    lastSeenAt?: string;
}

type RecordValue = Record<string, unknown>;

function isRecord(value: unknown): value is RecordValue {
    return typeof value === "object" && value !== null;
}

function toNumber(value: unknown): number | undefined {
    return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function toString(value: unknown): string | undefined {
    return typeof value === "string" ? value : undefined;
}

function unwrapData(raw: unknown): unknown {
    if (isRecord(raw) && raw.data !== undefined && raw.data !== null) {
        return raw.data;
    }
    return raw;
}

function normalizeOverview(raw: unknown): StatsOverview {
    const payload = unwrapData(raw);
    const record = isRecord(payload) ? payload : {};

    // Primary shape from current backend:
    // { totalMaterialsCount: number, practicedMaterialsCount: number }
    const total = toNumber(record.totalMaterialsCount) ?? 0;
    const practiced = toNumber(record.practicedMaterialsCount) ?? 0;

    // Backward-compatible fallback for older shape if backend changes later.
    const fallbackPracticed = toNumber(record.todayDone) ?? practiced;
    const fallbackCoverage = toNumber(record.todayAccuracy);
    const resolvedPracticed = practiced || fallbackPracticed;
    const resolvedTotal = total || Math.max(resolvedPracticed, 0);
    const coverage = fallbackCoverage ?? (resolvedTotal > 0 ? resolvedPracticed / resolvedTotal : 0);
    const unpracticed = Math.max(resolvedTotal - resolvedPracticed, 0);

    return {
        totalMaterialsCount: resolvedTotal,
        practicedMaterialsCount: resolvedPracticed,
        practiceCoverage: coverage,
        unpracticedMaterialsCount: unpracticed,
    };
}

function normalizeErrorTypes(raw: unknown): ErrorTypeStat[] {
    const payload = unwrapData(raw);

    // Preferred/legacy list shape: { items: [{ errorType, count, lastSeenAt? }] }
    if (isRecord(payload) && Array.isArray(payload.items)) {
        return payload.items
            .map((item): ErrorTypeStat | null => {
                if (!isRecord(item)) return null;
                const errorType = toString(item.errorType);
                const count = toNumber(item.count);
                if (!errorType || count === undefined) return null;
                return { errorType, count, lastSeenAt: toString(item.lastSeenAt) };
            })
            .filter((item): item is ErrorTypeStat => item !== null)
            .sort((a, b) => b.count - a.count);
    }

    // Current backend shape: { vocab_choice: 23, spelling: 5, ... }
    if (isRecord(payload)) {
        return Object.entries(payload)
            .map(([errorType, value]) => ({ errorType, count: toNumber(value) ?? 0 }))
            .filter((item) => item.count > 0)
            .sort((a, b) => b.count - a.count);
    }

    return [];
}

export const statsApi = {
    getOverview: async (): Promise<StatsOverview> => {
        const raw = await apiFetch<unknown>("api/stats/overview");
        return normalizeOverview(raw);
    },

    getErrorTypes: async (range: "7d" | "30d" = "7d"): Promise<ErrorTypeStat[]> => {
        const raw = await apiFetch<unknown>(`api/stats/error-types?range=${range}`);
        return normalizeErrorTypes(raw);
    },
};
