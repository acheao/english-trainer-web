export type UserProfile = {
  id: string;
  email: string;
  displayName?: string | null;
  dailyGoalMinutes: number;
  targetIeltsScore?: number | null;
  hasLlmConfig: boolean;
};

export type AuthResponse = {
  token: string;
  user: UserProfile;
};

export type ProviderCatalogItem = {
  key: string;
  label: string;
  defaultBaseUrl: string;
};

export type LlmConfig = {
  id: string;
  provider: string;
  displayName: string;
  model: string;
  baseUrl: string;
  enabled: boolean;
  isDefault: boolean;
  apiKeyPreview: string;
};

export type LessonSummary = {
  id: string;
  title: string;
  summary: string;
  sourceType: string;
  sourceUrl?: string | null;
  mediaType?: string | null;
  status: string;
  unitCount: number;
  estimatedMinutes: number;
  createdAt: string;
};

export type StudyUnit = {
  id: string;
  orderIndex: number;
  originalText: string;
  translationZh?: string | null;
  startSeconds?: number | null;
  endSeconds?: number | null;
  favorite: boolean;
  ignored: boolean;
  inPracticePool: boolean;
  masteryScore: number;
  attempts: number;
  difficulty: number;
};

export type LessonDetail = {
  id: string;
  title: string;
  summary: string;
  sourceType: string;
  sourceUrl?: string | null;
  mediaType?: string | null;
  mediaUrl?: string | null;
  estimatedMinutes: number;
  status: string;
  studyUnits: StudyUnit[];
};

export type QuestionType = "rewrite" | "correct" | "translate" | "cloze" | "compose";

export type QuestionDTO = {
  id: string;
  sessionId: string;
  materialId?: string;
  type: QuestionType;
  prompt: string;
  referenceAnswer?: string[];
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
  rawText?: string;
};

export type TodayPlan = {
  id: string;
  planDate: string;
  estimatedMinutes: number;
  majorFocus: string;
  focusSummary: string;
  status: string;
  selectedUnitCount: number;
  bucketCounts: Record<string, number>;
};

export type PracticeTask = {
  id: string;
  studyUnitId: string;
  lessonId: string;
  taskType: string;
  prompt: string;
  hintText?: string | null;
  shortContext?: string | null;
  startSeconds?: number | null;
  endSeconds?: number | null;
  mediaUrl?: string | null;
};

export type SessionView = {
  id: string;
  mode: string;
  status: string;
  focusSummary: string;
  estimatedMinutes: number;
  progress: {
    completedTasks: number;
    totalTasks: number;
    averageScore: number;
  };
  currentTask?: PracticeTask | null;
  completed: boolean;
};

export type SubmissionView = {
  id: string;
  score: number;
  correct: boolean;
  shortFeedback: string;
  detailedFeedback: string;
  suggestion: string;
  errorTypes: string[];
  sessionCompleted: boolean;
  nextTask?: PracticeTask | null;
};

export type AnswerResult = {
  submission: SubmissionView;
  session: SessionView;
};

export type StatsOverview = {
  dailyGoalMinutes: number;
  streakDays: number;
  studyUnits: number;
  masteredUnits: number;
  pendingReviewUnits: number;
  activeLessons: number;
  sessionsCompleted: number;
  recentAverageScore: number;
  practiceMinutesLast30Days: number;
  practiceMinutesLast7Days: number;
  hasLlmConfig: boolean;
  last7Days: DayProgress[];
};

export type DayProgress = {
  date: string;
  minutes: number;
  avgScore: number;
  answers: number;
};

export type ErrorTypeStat = {
  errorType: string;
  count: number;
  lastSeenAt?: string | null;
};
