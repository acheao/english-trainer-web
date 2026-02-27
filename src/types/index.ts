export type MaterialDTO = {
    id: string;
    type: "sentence" | "phrase" | "word" | "auto";
    content: string;
    tags: string[];
    enabled: boolean;
    createdAt: string;
};

export type QuestionDTO = {
    id: string;
    sessionId: string;
    materialId?: string;
    type: "rewrite" | "correct" | "translate" | "cloze" | "compose";
    prompt: string;
    referenceAnswer?: string[]; // optional for UI
    difficulty?: number;
    targetErrorTypes?: string[];
};

export type GradingDTO = {
    score: number;
    isCorrect: boolean;
    correctedAnswer: string;
    errorTypes: string[];
    explanationZh: string;
    suggestions: string[];
    confidence?: number;
    rawText?: string; // fallback
};
