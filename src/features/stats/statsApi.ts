import { apiFetch } from "../../shared/api/client";

export interface StatsOverview {
    todayDone: number;
    todayAvgScore: number;
    todayAccuracy: number;
    dueCount: number;
}

export interface ErrorTypeStat {
    errorType: string;
    count: number;
    lastSeenAt: string;
}

export const statsApi = {
    getOverview: () =>
        apiFetch<StatsOverview>("api/stats/overview"),

    getErrorTypes: (range: "7d" | "30d" = "7d") =>
        apiFetch<{ items: ErrorTypeStat[] }>(`api/stats/error-types?range=${range}`),
};
