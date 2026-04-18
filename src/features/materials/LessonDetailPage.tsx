import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { PlayCircleRounded, SyncRounded } from "@mui/icons-material";
import { libraryApi } from "./libraryApi";
import { useNotice } from "../../shared/ui/useNotice";
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

  const [lesson, setLesson] = useState<LessonDetail | null>(null);
  const [audioSrc, setAudioSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingUnits, setSavingUnits] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!lessonId) return undefined;
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
          const message = error instanceof Error ? error.message : "Failed to load lesson";
          pushNotice(`加载失败 / ${message}`, "error");
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
  }, [lessonId, pushNotice]);

  useEffect(() => {
    const mediaUrl = lesson?.mediaUrl;

    if (!mediaUrl || lesson.status !== "READY") {
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

    void (async () => {
      try {
        const blob = await libraryApi.fetchLessonMedia(mediaUrl);
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setAudioSrc(objectUrl);
      } catch (error) {
        if (!cancelled) {
          const message = error instanceof Error ? error.message : "Failed to load audio";
          pushNotice(`音频加载失败 / ${message}`, "warning");
        }
      }
    })();

    return () => {
      cancelled = true;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [lesson?.mediaUrl, lesson?.status, pushNotice]);

  const progressLabel = useMemo(() => {
    if (!lesson) return "";
    return `${lesson.studyUnits.length} study units`;
  }, [lesson]);

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
      pushNotice("已更新学习单元 / Study unit updated", "success");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update study unit";
      pushNotice(`更新失败 / ${message}`, "error");
    } finally {
      setSavingUnits((current) => ({ ...current, [unit.id]: false }));
    }
  }

  if (loading) {
    return (
      <div className="rounded-[2rem] border border-[var(--line)] bg-white/85 p-10 shadow-[var(--shadow)]">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[var(--brand-ink-soft)]">
          Loading Lesson
        </p>
        <h1 className="mt-4 text-3xl font-bold text-[var(--brand-ink)]">正在加载资料详情...</h1>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="rounded-[2rem] border border-[var(--line)] bg-white/85 p-10 shadow-[var(--shadow)]">
        <h1 className="text-3xl font-bold text-[var(--brand-ink)]">未找到该材料 / Lesson not found</h1>
        <Link to="/library" className="mt-4 inline-flex text-sm font-semibold text-[var(--brand-red)]">
          返回资料库 / Back to library
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
              ← 返回资料库 / Back to Library
            </Link>
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full border border-[var(--line)] bg-[var(--canvas)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--brand-ink-soft)]">
                {lesson.sourceType}
              </span>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${statusTone(lesson.status)}`}>
                {lesson.status}
              </span>
            </div>
            <div className="space-y-3">
              <h1 className="text-3xl font-bold text-[var(--brand-ink)] md:text-4xl">{lesson.title}</h1>
              <p className="max-w-3xl text-sm leading-7 text-slate-600 md:text-base">{lesson.summary}</p>
            </div>
          </div>

          <div className="grid gap-3 text-sm text-slate-600 sm:grid-cols-2 lg:min-w-[20rem]">
            <div className="rounded-2xl bg-[var(--canvas)] px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--brand-ink-soft)]">Source URL</p>
              <p className="mt-2 break-all text-[var(--brand-ink)]">{lesson.sourceUrl ?? "Manual import"}</p>
            </div>
            <div className="rounded-2xl bg-[var(--canvas)] px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--brand-ink-soft)]">Plan Size</p>
              <p className="mt-2 text-[var(--brand-ink)]">{progressLabel}</p>
            </div>
          </div>
        </div>

        {lesson.status === "PROCESSING" ? (
          <div className="mt-6 flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-800">
            <SyncRounded className="animate-spin" fontSize="small" />
            正在后台抓取英文字幕和音频，页面会自动刷新。 / We are fetching subtitles and audio in the background.
          </div>
        ) : null}

        {lesson.status === "READY" && audioSrc ? (
          <div className="mt-6 rounded-[1.5rem] border border-[var(--line)] bg-[var(--surface-strong)] p-5">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-[var(--brand-ink)]">
              <PlayCircleRounded fontSize="small" />
              Audio / 音频
            </div>
            <audio src={audioSrc} controls className="w-full" preload="metadata" />
          </div>
        ) : null}
      </div>

      <section className="rounded-[2rem] border border-[var(--line)] bg-white/90 p-6 shadow-[var(--shadow)] md:p-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--brand-ink-soft)]">Study Units</p>
            <h2 className="mt-2 text-2xl font-bold text-[var(--brand-ink)]">字幕与分句 / Transcript Units</h2>
          </div>
          <p className="text-sm text-slate-500">{lesson.studyUnits.length} items</p>
        </div>

        <div className="mt-6 space-y-4">
          {lesson.studyUnits.length === 0 ? (
            <div className="rounded-[1.5rem] border border-dashed border-[var(--line)] bg-[var(--canvas)] px-5 py-8 text-sm text-slate-600">
              当前还没有可用分句。导入完成后会自动出现在这里。 / Study units will appear here after import finishes.
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
                    {unit.translationZh ? <p className="text-sm text-slate-500">{unit.translationZh}</p> : null}
                    <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                      <span className="rounded-full bg-[var(--canvas)] px-3 py-1">Mastery {unit.masteryScore}</span>
                      <span className="rounded-full bg-[var(--canvas)] px-3 py-1">Attempts {unit.attempts}</span>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 xl:w-[22rem]">
                    <button
                      type="button"
                      disabled={Boolean(savingUnits[unit.id])}
                      onClick={() => handleUnitUpdate(unit, { favorite: !unit.favorite })}
                      className={`rounded-2xl px-4 py-3 text-left text-sm font-semibold ${
                        unit.favorite ? "bg-rose-100 text-rose-800" : "bg-[var(--canvas)] text-[var(--brand-ink)]"
                      }`}
                    >
                      Favorite / 收藏
                    </button>
                    <button
                      type="button"
                      disabled={Boolean(savingUnits[unit.id])}
                      onClick={() => handleUnitUpdate(unit, { inPracticePool: !unit.inPracticePool })}
                      className={`rounded-2xl px-4 py-3 text-left text-sm font-semibold ${
                        unit.inPracticePool
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-[var(--canvas)] text-[var(--brand-ink)]"
                      }`}
                    >
                      Practice Pool / 练习池
                    </button>
                    <button
                      type="button"
                      disabled={Boolean(savingUnits[unit.id])}
                      onClick={() => handleUnitUpdate(unit, { ignored: !unit.ignored })}
                      className={`rounded-2xl px-4 py-3 text-left text-sm font-semibold ${
                        unit.ignored ? "bg-slate-200 text-slate-700" : "bg-[var(--canvas)] text-[var(--brand-ink)]"
                      }`}
                    >
                      Ignore / 忽略
                    </button>
                    <label className="rounded-2xl bg-[var(--canvas)] px-4 py-3 text-sm font-semibold text-[var(--brand-ink)]">
                      <span className="mb-2 block">Difficulty / 难度</span>
                      <select
                        value={unit.difficulty}
                        disabled={Boolean(savingUnits[unit.id])}
                        onChange={(event) => handleUnitUpdate(unit, { difficulty: Number(event.target.value) })}
                        className="app-select bg-white"
                      >
                        <option value={1}>1 - Easy</option>
                        <option value={2}>2 - Warm</option>
                        <option value={3}>3 - Stretch</option>
                        <option value={4}>4 - Hard</option>
                        <option value={5}>5 - Challenge</option>
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
