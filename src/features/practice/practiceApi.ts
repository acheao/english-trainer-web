import { apiFetch } from "../../shared/api/client";
import type { QuestionDTO, GradingDTO } from "../../types";

export interface StartSessionRequest {
    batchSize: number;
    generatorMode: "hybrid" | "llm" | "db_only";
}

export interface StartSessionResponse {
    sessionId: string;
    questions: QuestionDTO[];
}

export interface SubmitAnswerRequest {
    questionId: string;
    userAnswer: string;
    timeSpentMs?: number;
}

export const practiceApi = {
    startSession: (data: StartSessionRequest) =>
        apiFetch<StartSessionResponse>("api/sessions", {
            method: "POST",
            json: data,
        }),

    submitAnswer: (data: SubmitAnswerRequest) =>
        apiFetch<GradingDTO>("api/answers", {
            method: "POST",
            json: data,
        }),

    nextBatch: (sessionId: string) =>
        apiFetch<{ questions: QuestionDTO[] }>(`api/sessions/${sessionId}/next`, {
            method: "POST",
        }),
};
