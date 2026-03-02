import { apiFetch } from "../../shared/api/client";
import { ApiError } from "../../shared/api/errors";
import { getApiBaseUrl } from "../../shared/config/runtime";
import type { GradingDTO, QuestionDTO } from "../../types";

export type GeneratorMode = "new" | "wrong" | "review" | "smart";

export interface StartSessionRequest {
    batchSize: number;
    generatorMode: GeneratorMode;
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

export interface NextBatchRequest {
    batchSize?: number;
    generatorMode?: GeneratorMode;
}

export interface SubmitAnswerStreamOptions {
    onTextChunk?: (chunk: string) => void;
    signal?: AbortSignal;
}

type RecordValue = Record<string, unknown>;

const QUESTION_TYPES: QuestionDTO["type"][] = ["rewrite", "correct", "translate", "cloze", "compose"];

function isRecord(value: unknown): value is RecordValue {
    return typeof value === "object" && value !== null;
}

function unwrapApiData<T = unknown>(raw: unknown): T {
    if (isRecord(raw) && raw.data !== undefined && raw.data !== null) {
        return raw.data as T;
    }
    return raw as T;
}

function getString(value: unknown): string | undefined {
    return typeof value === "string" ? value : undefined;
}

function getNumber(value: unknown): number | undefined {
    return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function getBoolean(value: unknown): boolean | undefined {
    return typeof value === "boolean" ? value : undefined;
}

function normalizeQuestionType(value: unknown): QuestionDTO["type"] {
    const candidate = typeof value === "string" ? value.toLowerCase() : "";
    return QUESTION_TYPES.includes(candidate as QuestionDTO["type"])
        ? (candidate as QuestionDTO["type"])
        : "rewrite";
}

function parseJsonArrayString(value: string): string[] | null {
    const trimmed = value.trim();
    if (!(trimmed.startsWith("[") && trimmed.endsWith("]"))) {
        return null;
    }

    try {
        const parsed = JSON.parse(trimmed);
        if (!Array.isArray(parsed)) return null;
        return parsed.map((item) => String(item).trim()).filter(Boolean);
    } catch {
        return null;
    }
}

function parseReferenceAnswers(value: unknown): string[] {
    if (Array.isArray(value)) {
        return value.map((item) => String(item).trim()).filter(Boolean);
    }

    if (typeof value !== "string") return [];

    const parsedJsonArray = parseJsonArrayString(value);
    if (parsedJsonArray) return parsedJsonArray;

    const trimmed = value.trim();
    return trimmed ? [trimmed] : [];
}

function parseStringList(value: unknown, splitComma: boolean): string[] {
    if (Array.isArray(value)) {
        return value.map((item) => String(item).trim()).filter(Boolean);
    }

    if (typeof value !== "string") return [];

    const parsedJsonArray = parseJsonArrayString(value);
    if (parsedJsonArray) return parsedJsonArray;

    const trimmed = value.trim();
    if (!trimmed) return [];

    const separators = splitComma ? /[\n;；，,、|]+/ : /[\n;；|]+/;
    const chunks = trimmed.split(separators).map((item) => item.trim()).filter(Boolean);

    return chunks.length > 0 ? chunks : [trimmed];
}

function normalizeQuestion(raw: unknown, index: number, fallbackSessionId: string): QuestionDTO {
    const payload = isRecord(raw) ? raw : {};
    const referenceAnswer = parseReferenceAnswers(payload.referenceAnswer);
    const targetErrorTypes = parseStringList(payload.targetErrorTypes, true);
    const difficulty = getNumber(payload.difficulty);
    const prompt =
        getString(payload.prompt)
        ?? getString(payload.question)
        ?? getString(payload.content)
        ?? "";
    const id =
        getString(payload.id)
        ?? getString(payload.questionId)
        ?? `${fallbackSessionId || "question"}-${index + 1}`;
    const sessionId =
        getString(payload.sessionId)
        ?? fallbackSessionId;

    return {
        id,
        sessionId,
        materialId: getString(payload.materialId),
        type: normalizeQuestionType(payload.type ?? payload.questionType),
        prompt: prompt || "No prompt provided",
        ...(referenceAnswer.length > 0 ? { referenceAnswer } : {}),
        ...(difficulty !== undefined ? { difficulty } : {}),
        ...(targetErrorTypes.length > 0 ? { targetErrorTypes } : {}),
    };
}

function normalizeSessionResponse(raw: unknown, requireSessionId = true): StartSessionResponse {
    const payload = isRecord(unwrapApiData<RecordValue>(raw))
        ? unwrapApiData<RecordValue>(raw)
        : {};
    const session = isRecord(payload.session) ? payload.session : {};
    const sessionId = getString(payload.sessionId) ?? getString(session.id) ?? "";

    const rawQuestions = Array.isArray(payload.questions)
        ? payload.questions
        : Array.isArray(payload.items)
            ? payload.items
            : [];

    const normalizedQuestions = rawQuestions.map((question, index) => normalizeQuestion(question, index, sessionId));
    const questionSessionId = normalizedQuestions[0]?.sessionId;

    const resolvedSessionId = sessionId || questionSessionId;
    if (!resolvedSessionId && requireSessionId) {
        throw new Error("Invalid session response: missing session id");
    }

    return {
        sessionId: resolvedSessionId ?? "",
        questions: normalizedQuestions,
    };
}

function normalizeGrading(raw: unknown): GradingDTO {
    const payload = isRecord(unwrapApiData<RecordValue>(raw))
        ? unwrapApiData<RecordValue>(raw)
        : {};
    const score = getNumber(payload.score) ?? 0;
    const explicitCorrect = getBoolean(payload.isCorrect) ?? getBoolean(payload.correct);

    return {
        score,
        isCorrect: explicitCorrect ?? score >= 90,
        correctedAnswer: getString(payload.correctedAnswer) ?? "",
        errorTypes: parseStringList(payload.errorTypes, true),
        explanationZh: getString(payload.explanationZh) ?? "",
        suggestions: parseStringList(payload.suggestions, false),
        rawText: getString(payload.rawText) ?? getString(payload.rawLlmResponse),
    };
}

function toApiErrorMessage(status: number, statusText: string, bodyText: string): string {
    try {
        const parsed = JSON.parse(bodyText) as RecordValue;
        if (typeof parsed.message === "string" && parsed.message.trim()) {
            return parsed.message.trim();
        }
    } catch {
        // Keep fallback message below.
    }

    if (bodyText.trim()) {
        return bodyText.trim();
    }

    return `http ${status} ${statusText}`;
}

function parseSseDataBlock(rawEvent: string): string | null {
    const dataLines = rawEvent
        .split("\n")
        .filter((line) => line.startsWith("data:"))
        .map((line) => line.slice(5).trimStart());

    if (dataLines.length > 0) {
        const joined = dataLines.join("\n").trim();
        return joined || null;
    }

    const trimmed = rawEvent.trim();
    return trimmed || null;
}

function safeJsonParse(value: string): unknown | null {
    try {
        return JSON.parse(value);
    } catch {
        return null;
    }
}

function unwrapStreamPayload(payload: unknown): unknown {
    if (isRecord(payload) && payload.data !== undefined && payload.data !== null) {
        return payload.data;
    }
    return payload;
}

function looksLikeGrading(payload: RecordValue): boolean {
    return (
        payload.score !== undefined
        || payload.correctedAnswer !== undefined
        || payload.errorTypes !== undefined
        || payload.suggestions !== undefined
        || payload.correct !== undefined
        || payload.isCorrect !== undefined
    );
}

function getTextFromPayload(payload: RecordValue): string | null {
    const fields = ["delta", "chunk", "text", "content", "message"];
    for (const field of fields) {
        const value = payload[field];
        if (typeof value === "string" && value) {
            return value;
        }
    }

    if (isRecord(payload.choices) && typeof payload.choices.delta === "string") {
        return payload.choices.delta;
    }

    return null;
}

function getExplanationSnapshot(payload: RecordValue): string | null {
    const candidates = [payload.explanationZh, payload.explanation];
    for (const value of candidates) {
        if (typeof value === "string") {
            return value;
        }
    }
    return null;
}

function buildNextBatchUrl(sessionId: string, req?: NextBatchRequest): string {
    const query = new URLSearchParams();

    if (req?.batchSize !== undefined) {
        query.set("batchSize", String(req.batchSize));
    }
    if (req?.generatorMode) {
        query.set("generatorMode", req.generatorMode);
    }

    const queryString = query.toString();
    return queryString
        ? `api/sessions/${sessionId}/next?${queryString}`
        : `api/sessions/${sessionId}/next`;
}

function getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
}

export const practiceApi = {
    startSession: async (data: StartSessionRequest): Promise<StartSessionResponse> => {
        const raw = await apiFetch<unknown>("api/sessions", {
            method: "POST",
            json: data,
        });
        return normalizeSessionResponse(raw);
    },

    submitAnswer: async (data: SubmitAnswerRequest): Promise<GradingDTO> => {
        const raw = await apiFetch<unknown>("api/answers", {
            method: "POST",
            json: data,
        });
        return normalizeGrading(raw);
    },

    submitAnswerStream: async (data: SubmitAnswerRequest, options: SubmitAnswerStreamOptions = {}): Promise<GradingDTO> => {
        const url = `${getApiBaseUrl()}/api/answers/stream`;
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "content-type": "application/json",
                "accept": "text/event-stream",
                ...getAuthHeaders(),
            },
            body: JSON.stringify(data),
            signal: options.signal,
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new ApiError(
                response.status,
                toApiErrorMessage(response.status, response.statusText, errorText),
                errorText
            );
        }

        if (!response.body) {
            throw new Error("Streaming response body is empty");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let streamedText = "";
        let explanationSnapshot = "";
        const streamState: { finalGrading: GradingDTO | null } = {
            finalGrading: null,
        };

        const pushStreamText = (text: string) => {
            if (!text) return;
            streamedText += text;
            options.onTextChunk?.(text);
        };

        const handleEvent = (rawEvent: string) => {
            const payloadText = parseSseDataBlock(rawEvent);
            if (!payloadText || payloadText === "[DONE]") return;

            const parsed = safeJsonParse(payloadText);
            if (parsed === null) {
                pushStreamText(payloadText);
                return;
            }

            const unwrapped = unwrapStreamPayload(parsed);

            if (typeof unwrapped === "string") {
                pushStreamText(unwrapped);
                return;
            }

            if (!isRecord(unwrapped)) return;

            if (looksLikeGrading(unwrapped)) {
                streamState.finalGrading = normalizeGrading(unwrapped);
                return;
            }

            const snapshot = getExplanationSnapshot(unwrapped);
            if (snapshot !== null) {
                const delta = snapshot.startsWith(explanationSnapshot)
                    ? snapshot.slice(explanationSnapshot.length)
                    : snapshot;
                explanationSnapshot = snapshot;
                pushStreamText(delta);
            }

            const deltaText = getTextFromPayload(unwrapped);
            if (deltaText) {
                pushStreamText(deltaText);
            }
        };

        while (true) {
            const { value, done } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true }).replace(/\r\n/g, "\n");

            let separatorIndex = buffer.indexOf("\n\n");
            while (separatorIndex !== -1) {
                const rawEvent = buffer.slice(0, separatorIndex);
                buffer = buffer.slice(separatorIndex + 2);
                if (rawEvent.trim()) {
                    handleEvent(rawEvent);
                }
                separatorIndex = buffer.indexOf("\n\n");
            }
        }

        buffer += decoder.decode().replace(/\r\n/g, "\n");
        if (buffer.trim()) {
            handleEvent(buffer);
        }

        const finalGrading = streamState.finalGrading;
        if (finalGrading) {
            if (!finalGrading.explanationZh && streamedText.trim()) {
                return {
                    ...finalGrading,
                    explanationZh: streamedText.trim(),
                };
            }
            return finalGrading;
        }

        const fallbackText = streamedText.trim();
        return {
            score: 0,
            isCorrect: false,
            correctedAnswer: "",
            errorTypes: [],
            explanationZh: fallbackText || "Streaming ended without structured grading payload.",
            suggestions: [],
            rawText: fallbackText || undefined,
        };
    },

    nextBatch: async (sessionId: string, req?: NextBatchRequest): Promise<{ questions: QuestionDTO[] }> => {
        const raw = await apiFetch<unknown>(buildNextBatchUrl(sessionId, req), {
            method: "POST",
        });
        return { questions: normalizeSessionResponse(raw, false).questions };
    },
};
