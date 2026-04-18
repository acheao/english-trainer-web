import { apiFetch } from "../../shared/api/client";
import type {
    DayProgress,
    ErrorTypeStat as SharedErrorTypeStat,
    StatsOverview as SharedStatsOverview,
} from "../../types";

export interface StatsOverview extends SharedStatsOverview {
    totalMaterialsCount: number;
    practicedMaterialsCount: number;
    practiceCoverage: number;
    unpracticedMaterialsCount: number;
}

export type ErrorTypeStat = SharedErrorTypeStat;

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

function toBoolean(value: unknown): boolean | undefined {
    return typeof value === "boolean" ? value : undefined;
}

function unwrapData(raw: unknown): unknown {
    if (isRecord(raw) && raw.data !== undefined && raw.data !== null) {
        return raw.data;
    }
    return raw;
}

function normalizeDayProgress(raw: unknown): DayProgress | null {
    if (!isRecord(raw)) return null;

    const date = toString(raw.date);
    const minutes = toNumber(raw.minutes) ?? 0;
    const avgScore = toNumber(raw.avgScore) ?? 0;
    const answers = toNumber(raw.answers) ?? 0;

    if (!date) return null;

    return {
        date,
        minutes,
        avgScore,
        answers,
    };
}

function normalizeOverview(raw: unknown): StatsOverview {
    const payload = unwrapData(raw);
    const record = isRecord(payload) ? payload : {};

    const totalMaterialsCount = toNumber(record.totalMaterialsCount) ?? toNumber(record.activeLessons) ?? 0;
    const practicedMaterialsCount = toNumber(record.practicedMaterialsCount) ?? toNumber(record.sessionsCompleted) ?? 0;
    const practiceCoverage =
        toNumber(record.practiceCoverage)
        ?? toNumber(record.todayAccuracy)
        ?? (totalMaterialsCount > 0 ? practicedMaterialsCount / totalMaterialsCount : 0);
    const last7Days = Array.isArray(record.last7Days)
        ? record.last7Days
            .map((item) => normalizeDayProgress(item))
            .filter((item): item is DayProgress => item !== null)
        : [];

    return {
        dailyGoalMinutes: toNumber(record.dailyGoalMinutes) ?? 30,
        streakDays: toNumber(record.streakDays) ?? 0,
        studyUnits: toNumber(record.studyUnits) ?? 0,
        masteredUnits: toNumber(record.masteredUnits) ?? 0,
        pendingReviewUnits: toNumber(record.pendingReviewUnits) ?? 0,
        activeLessons: toNumber(record.activeLessons) ?? totalMaterialsCount,
        sessionsCompleted: toNumber(record.sessionsCompleted) ?? practicedMaterialsCount,
        recentAverageScore: toNumber(record.recentAverageScore) ?? toNumber(record.todayAvgScore) ?? 0,
        practiceMinutesLast30Days: toNumber(record.practiceMinutesLast30Days) ?? 0,
        practiceMinutesLast7Days: toNumber(record.practiceMinutesLast7Days) ?? 0,
        hasLlmConfig: toBoolean(record.hasLlmConfig) ?? false,
        last7Days,
        totalMaterialsCount,
        practicedMaterialsCount,
        practiceCoverage,
        unpracticedMaterialsCount: Math.max(totalMaterialsCount - practicedMaterialsCount, 0),
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
