import { apiFetch } from "../../shared/api/client";
import type { AnswerResult, SessionView, TodayPlan } from "../../types";

export type SessionMode = "DAILY" | "EXTRA";

export interface StartSessionRequest {
  mode?: SessionMode;
  desiredTaskCount?: number;
}

export interface SubmitAnswerRequest {
  taskId: string;
  answerText: string;
  durationSeconds?: number;
  usedHint?: boolean;
  skipped?: boolean;
  uncertain?: boolean;
}

export const practiceApi = {
  getTodayPlan: () => apiFetch<TodayPlan>("/api/daily-plan/today"),

  startSession: (payload: StartSessionRequest) =>
    apiFetch<SessionView>("/api/practice/sessions", {
      method: "POST",
      json: payload,
    }),

  getSession: (sessionId: string) => apiFetch<SessionView>(`/api/practice/sessions/${sessionId}`),

  submitAnswer: (payload: SubmitAnswerRequest) =>
    apiFetch<AnswerResult>("/api/practice/answers", {
      method: "POST",
      json: {
        taskId: payload.taskId,
        answerText: payload.answerText,
        durationSeconds: payload.durationSeconds ?? 0,
        usedHint: Boolean(payload.usedHint),
        skipped: Boolean(payload.skipped),
        uncertain: Boolean(payload.uncertain),
      },
    }),
};
