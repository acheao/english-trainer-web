import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { PlayCircleRounded, SyncRounded } from "@mui/icons-material";
import { libraryApi } from "./libraryApi";
import { useNotice } from "../../shared/ui/useNotice";
import { useI18n } from "../../shared/i18n/I18nProvider";
import { getErrorMessage } from "../../shared/i18n/message";
import { getDifficultyLabel, getLessonStatusLabel, getSourceTypeLabel } from "../../shared/i18n/domain";
import type { LessonDetail, StudyUnit } from "../../types";

function statusTone(status: string) {
  switch (status) {
    case "READY":
      return "bg-emerald-50 text-emerald-700 ring-emerald-200";
    case "FAILED":
      return "bg-rose-50 text-rose-700 ring-rose-200";
    default:
      return "bg-amber-50 text-amber-700 ring-amber-200";
  }
}

export default function LessonDetailPage() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const { pushNotice } = useNotice();
  const { locale, isZh } = useI18n();

  const [lesson, setLesson] = useState<LessonDetail | null>(null);
  const [audioSrc, setAudioSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingUnits, setSavingUnits] = useState<Record<string, boolean>>({});

  const text = isZh
      ? {
        loadFailed: "加载材料失败。",
        audioFailed: "音频加载失败。",
        updateSuccess: "学习单元已更新。",
        updateFailed: "更新失败。",
        loadingTitle: "正在加载材料详情...",
        missingTitle: "没有找到这份材料",
        back: "返回材料库",
        sourceUrl: "来源链接",
        manualImport: "手动导入",
        studyUnits: "学习单元",
        processingHint: "YouTube 的字幕和音频仍在后台处理中，页面会自动刷新。",
        lessonAudio: "材料音频",
        unitsTitle: "进入练习池的最小单元",
        empty: "当前还没有可用的学习单元。导入完成后它们会自动出现在这里。",
        mastery: (value: number) => `掌握度 ${value}`,
        attempts: (value: number) => `尝试 ${value}`,
        favoriteOn: "已收藏",
        favoriteOff: "加入收藏",
        poolOn: "已在练习池",
        poolOff: "加入练习池",
        ignoredOn: "已忽略",
        ignoredOff: "忽略此项",
        difficulty: "难度",
        items: (count: number) => `${count} 项`,
        count: (count: number) => `${count} 个`,
      }
    : {
        loadFailed: "Failed to load the lesson.",
        audioFailed: "Failed to load audio.",
        updateSuccess: "Study unit updated.",
        updateFailed: "Failed to update the study unit.",
        loadingTitle: "Loading lesson details...",
        missingTitle: "Lesson not found",
        back: "Back to Materials",
        sourceUrl: "Source URL",
        manualImport: "Manual import",
        studyUnits: "Study Units",
        processingHint: "YouTube subtitles and audio are still being processed in the background. This page will refresh automatically.",
        lessonAudio: "Lesson Audio",
        unitsTitle: "The smallest units that enter your practice pool",
        empty: "No study units are available yet. They will appear here automatically when the import finishes.",
        mastery: (value: number) => `Mastery ${value}`,
        attempts: (value: number) => `Attempts ${value}`,
        favoriteOn: "Favorited",
        favoriteOff: "Add to Favorites",
        poolOn: "In Practice Pool",
        poolOff: "Add to Practice Pool",
        ignoredOn: "Ignored",
        ignoredOff: "Ignore This Item",
        difficulty: "Difficulty",
        items: (count: number) => `${count} items`,
        count: (count: number) => `${count}`,
      };

  useEffect(() => {
    if (!lessonId) {
      return undefined;
    }

    const currentLessonId = lessonId;
    let cancelled = false;

    async function loadDetail() {
      try {
        const detail = await libraryApi.getLessonDetail(currentLessonId);
        if (!cancelled) {
          setLesson(detail);
          setLoading(false);
        }
      } catch (error) {
        if (!cancelled) {
          pushNotice(getErrorMessage(error, text.loadFailed), "error");
          setLoading(false);
        }
      }
    }

    void loadDetail();

    const interval = window.setInterval(() => {
      void loadDetail();
    }, 4500);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [lessonId, pushNotice, text.loadFailed]);

  useEffect(() => {
    const mediaUrl = lesson?.mediaUrl;

    if (!mediaUrl || lesson?.status !== "READY") {
      setAudioSrc((current) => {
        if (current) {
          URL.revokeObjectURL(current);
        }
        return null;
      });
      return undefined;
    }

    let cancelled = false;
    let objectUrl: string | null = null;
    const currentMediaUrl = mediaUrl;

    async function loadAudio() {
      try {
        const blob = await libraryApi.fetchLessonMedia(currentMediaUrl);
        if (cancelled) {
          return;
        }
        objectUrl = URL.createObjectURL(blob);
        setAudioSrc(objectUrl);
      } catch (error) {
        if (!cancelled) {
          pushNotice(getErrorMessage(error, text.audioFailed), "warning");
        }
      }
    }

    void loadAudio();

    return () => {
      cancelled = true;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [lesson?.mediaUrl, lesson?.status, pushNotice, text.audioFailed]);

  async function handleUnitUpdate(unit: StudyUnit, patch: Partial<StudyUnit>) {
    setSavingUnits((current) => ({ ...current, [unit.id]: true }));
    try {
      const updated = await libraryApi.updateStudyUnit(unit.id, {
        favorite: patch.favorite,
        ignored: patch.ignored,
        inPracticePool: patch.inPracticePool,
        difficulty: patch.difficulty,
      });
      setLesson((current) =>
        current
          ? {
              ...current,
              studyUnits: current.studyUnits.map((item) => (item.id === updated.id ? updated : item)),
            }
          : current
      );
      pushNotice(text.updateSuccess, "success");
    } catch (error) {
      pushNotice(getErrorMessage(error, text.updateFailed), "error");
    } finally {
      setSavingUnits((current) => ({ ...current, [unit.id]: false }));
    }
  }

  if (loading) {
    return (
      <div className="rounded-[2rem] border border-[var(--line)] bg-white/85 p-10 shadow-[var(--shadow)]">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[var(--brand-ink-soft)]">
          {isZh ? "材料" : "Lesson"}
        </p>
        <h1 className="mt-4 text-3xl font-bold text-[var(--brand-ink)]">{text.loadingTitle}</h1>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="rounded-[2rem] border border-[var(--line)] bg-white/85 p-10 shadow-[var(--shadow)]">
        <h1 className="text-3xl font-bold text-[var(--brand-ink)]">{text.missingTitle}</h1>
        <Link to="/library" className="mt-4 inline-flex text-sm font-semibold text-[var(--brand-red)]">
          {text.back}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] border border-[var(--line)] bg-white/90 p-6 shadow-[var(--shadow)] md:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-4">
            <Link to="/library" className="text-sm font-semibold text-[var(--brand-red)]">
              {text.back}
            </Link>
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full border border-[var(--line)] bg-[var(--canvas)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--brand-ink-soft)]">
                {getSourceTypeLabel(lesson.sourceType, locale)}
              </span>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${statusTone(lesson.status)}`}>
                {getLessonStatusLabel(lesson.status, locale)}
              </span>
            </div>
            <div className="space-y-3">
              <h1 className="text-3xl font-bold text-[var(--brand-ink)] md:text-4xl">{lesson.title}</h1>
              <p className="max-w-3xl text-sm leading-7 text-slate-600 md:text-base">{lesson.summary}</p>
            </div>
          </div>

          <div className="grid gap-3 text-sm text-slate-600 sm:grid-cols-2 lg:min-w-[20rem]">
            <div className="rounded-2xl bg-[var(--canvas)] px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--brand-ink-soft)]">{text.sourceUrl}</p>
              <p className="mt-2 break-all text-[var(--brand-ink)]">{lesson.sourceUrl ?? text.manualImport}</p>
            </div>
            <div className="rounded-2xl bg-[var(--canvas)] px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--brand-ink-soft)]">{text.studyUnits}</p>
              <p className="mt-2 text-[var(--brand-ink)]">{text.count(lesson.studyUnits.length)}</p>
            </div>
          </div>
        </div>

        {lesson.status === "PROCESSING" ? (
          <div className="mt-6 flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-800">
            <SyncRounded className="animate-spin" fontSize="small" />
            {text.processingHint}
          </div>
        ) : null}

        {lesson.status === "READY" && audioSrc ? (
          <div className="mt-6 rounded-[1.5rem] border border-[var(--line)] bg-[var(--surface-strong)] p-5">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-[var(--brand-ink)]">
              <PlayCircleRounded fontSize="small" />
              {text.lessonAudio}
            </div>
            <audio src={audioSrc} controls className="w-full" preload="metadata" />
          </div>
        ) : null}
      </div>

      <section className="rounded-[2rem] border border-[var(--line)] bg-white/90 p-6 shadow-[var(--shadow)] md:p-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--brand-ink-soft)]">{text.studyUnits}</p>
            <h2 className="mt-2 text-2xl font-bold text-[var(--brand-ink)]">{text.unitsTitle}</h2>
          </div>
          <p className="text-sm text-slate-500">{text.items(lesson.studyUnits.length)}</p>
        </div>

        <div className="mt-6 space-y-4">
          {lesson.studyUnits.length === 0 ? (
            <div className="rounded-[1.5rem] border border-dashed border-[var(--line)] bg-[var(--canvas)] px-5 py-8 text-sm leading-6 text-slate-600">
              {text.empty}
            </div>
          ) : (
            lesson.studyUnits.map((unit) => (
              <article key={unit.id} className="rounded-[1.5rem] border border-[var(--line)] bg-[var(--surface-strong)] p-5">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand-ink-soft)]">
                      <span>#{unit.orderIndex + 1}</span>
                      {unit.startSeconds != null && unit.endSeconds != null ? (
                        <span>
                          {unit.startSeconds.toFixed(1)}s - {unit.endSeconds.toFixed(1)}s
                        </span>
                      ) : null}
                    </div>
                    <p className="text-base leading-7 text-[var(--brand-ink)]">{unit.originalText}</p>
                    {isZh && unit.translationZh ? <p className="text-sm text-slate-500">{unit.translationZh}</p> : null}
                    <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                      <span className="rounded-full bg-[var(--canvas)] px-3 py-1">{text.mastery(unit.masteryScore)}</span>
                      <span className="rounded-full bg-[var(--canvas)] px-3 py-1">{text.attempts(unit.attempts)}</span>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 xl:w-[22rem]">
                    <button
                      type="button"
                      disabled={Boolean(savingUnits[unit.id])}
                      onClick={() => void handleUnitUpdate(unit, { favorite: !unit.favorite })}
                      className={`rounded-2xl px-4 py-3 text-left text-sm font-semibold ${
                        unit.favorite ? "bg-rose-100 text-rose-800" : "bg-[var(--canvas)] text-[var(--brand-ink)]"
                      }`}
                    >
                      {unit.favorite ? text.favoriteOn : text.favoriteOff}
                    </button>
                    <button
                      type="button"
                      disabled={Boolean(savingUnits[unit.id])}
                      onClick={() => void handleUnitUpdate(unit, { inPracticePool: !unit.inPracticePool })}
                      className={`rounded-2xl px-4 py-3 text-left text-sm font-semibold ${
                        unit.inPracticePool
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-[var(--canvas)] text-[var(--brand-ink)]"
                      }`}
                    >
                      {unit.inPracticePool ? text.poolOn : text.poolOff}
                    </button>
                    <button
                      type="button"
                      disabled={Boolean(savingUnits[unit.id])}
                      onClick={() => void handleUnitUpdate(unit, { ignored: !unit.ignored })}
                      className={`rounded-2xl px-4 py-3 text-left text-sm font-semibold ${
                        unit.ignored ? "bg-slate-200 text-slate-700" : "bg-[var(--canvas)] text-[var(--brand-ink)]"
                      }`}
                    >
                      {unit.ignored ? text.ignoredOn : text.ignoredOff}
                    </button>
                    <label className="rounded-2xl bg-[var(--canvas)] px-4 py-3 text-sm font-semibold text-[var(--brand-ink)]">
                      <span className="mb-2 block">{text.difficulty}</span>
                      <select
                        value={unit.difficulty}
                        disabled={Boolean(savingUnits[unit.id])}
                        onChange={(event) => void handleUnitUpdate(unit, { difficulty: Number(event.target.value) })}
                        className="app-select bg-white"
                      >
                        {[1, 2, 3, 4, 5].map((level) => (
                          <option key={level} value={level}>
                            {getDifficultyLabel(level, locale)}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
