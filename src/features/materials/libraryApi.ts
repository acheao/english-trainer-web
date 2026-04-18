import { apiFetch, apiFetchBlob } from "../../shared/api/client";
import type { LessonDetail, LessonSummary, StudyUnit } from "../../types";

export type TextImportRequest = {
  title?: string;
  text: string;
  notes?: string;
};

export type ArticleImportRequest = {
  title?: string;
  url: string;
  notes?: string;
};

export type YoutubeImportRequest = {
  url: string;
};

export type StudyUnitPatch = {
  favorite?: boolean;
  ignored?: boolean;
  inPracticePool?: boolean;
  difficulty?: number;
};

export const libraryApi = {
  listLessons: () => apiFetch<LessonSummary[]>("/api/lessons"),
  getLessonDetail: (lessonId: string) => apiFetch<LessonDetail>(`/api/lessons/${lessonId}`),
  importText: (payload: TextImportRequest) => apiFetch<LessonSummary>("/api/import/text", { method: "POST", json: payload }),
  importArticle: (payload: ArticleImportRequest) =>
    apiFetch<LessonSummary>("/api/import/article", { method: "POST", json: payload }),
  importYoutube: (payload: YoutubeImportRequest) =>
    apiFetch<LessonSummary>("/api/import/youtube", { method: "POST", json: payload }),
  updateStudyUnit: (studyUnitId: string, payload: StudyUnitPatch) =>
    apiFetch<StudyUnit>(`/api/study-units/${studyUnitId}`, { method: "PATCH", json: payload }),
  fetchLessonMedia: (mediaPath: string) => apiFetchBlob(mediaPath),
};
