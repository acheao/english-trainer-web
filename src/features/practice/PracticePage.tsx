import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { libraryApi } from "../materials/libraryApi";
import { useNotice } from "../../shared/ui/useNotice";
import { practiceApi, type SessionMode } from "./practiceApi";
import type { PracticeTask, SessionView, SubmissionView } from "../../types";

const TASK_OPTIONS = [8, 10, 12];

const MODE_COPY: Record<SessionMode, { label: string; description: string }> = {
  DAILY: {
    label: "今日训练",
    description: "按今天最值得练的内容生成一组 30 分钟左右的任务。",
  },
  EXTRA: {
    label: "加练模式",
    description: "围绕薄弱点和未充分练习的材料补一组额外练习。",
  },
};

const TASK_TYPE_LABELS: Record<string, string> = {
  listen_transcribe: "听写还原",
  fill_blank: "填空",
  rebuild_sentence: "整句重建",
  meaning_recall: "语义回忆",
};

export default function PracticePage() {
  const navigate = useNavigate();
  const { sessionId } = useParams<{ sessionId: string }>();
  const { pushNotice } = useNotice();

  const [desiredTaskCount, setDesiredTaskCount] = useState(10);
  const [loadingSession, setLoadingSession] = useState(false);
  const [startingMode, setStartingMode] = useState<SessionMode | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [session, setSession] = useState<SessionView | null>(null);
  const [activeTask, setActiveTask] = useState<PracticeTask | null>(null);
  const [queuedNextTask, setQueuedNextTask] = useState<PracticeTask | null>(null);
  const [feedback, setFeedback] = useState<SubmissionView | null>(null);
  const [answerText, setAnswerText] = useState("");
  const [showHint, setShowHint] = useState(false);
  const [uncertain, setUncertain] = useState(false);
  const [taskStartedAt, setTaskStartedAt] = useState<number | null>(null);
  const [audioSrc, setAudioSrc] = useState<string | null>(null);
  const [loadingAudio, setLoadingAudio] = useState(false);

  useEffect(() => {
    if (!sessionId) {
      setSession(null);
      setActiveTask(null);
      setQueuedNextTask(null);
      setFeedback(null);
      return;
    }

    const currentSessionId = sessionId;
    let cancelled = false;

    async function loadSession() {
      setLoadingSession(true);
      try {
        const data = await practiceApi.getSession(currentSessionId);
        if (cancelled) {
          return;
        }
        setSession(data);
        setActiveTask(data.currentTask ?? null);
        setQueuedNextTask(null);
        setFeedback(null);
        setAnswerText("");
        setShowHint(false);
        setUncertain(false);
        setTaskStartedAt(Date.now());
      } catch (error) {
        if (!cancelled) {
          const message = error instanceof Error ? error.message : "Failed to load session";
          pushNotice(`加载练习失败：${message}`, "error");
        }
      } finally {
        if (!cancelled) {
          setLoadingSession(false);
        }
      }
    }

    void loadSession();
    return () => {
      cancelled = true;
    };
  }, [pushNotice, sessionId]);

  useEffect(() => {
    if (!activeTask?.mediaUrl) {
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
    const mediaUrl = activeTask.mediaUrl;

    async function loadAudio() {
      setLoadingAudio(true);
      try {
        const blob = await libraryApi.fetchLessonMedia(mediaUrl);
        if (cancelled) {
          return;
        }
        objectUrl = URL.createObjectURL(blob);
        setAudioSrc(objectUrl);
      } catch (error) {
        if (!cancelled) {
          const message = error instanceof Error ? error.message : "Failed to load audio";
          pushNotice(`音频加载失败：${message}`, "warning");
        }
      } finally {
        if (!cancelled) {
          setLoadingAudio(false);
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
  }, [activeTask?.id, activeTask?.mediaUrl, pushNotice]);

  async function handleStart(mode: SessionMode) {
    setStartingMode(mode);
    try {
      const data = await practiceApi.startSession({
        mode,
        desiredTaskCount,
      });
      navigate(`/practice/session/${data.id}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to start session";
      pushNotice(`启动练习失败：${message}`, "error");
    } finally {
      setStartingMode(null);
    }
  }

  async function submitAnswer(skipped: boolean) {
    if (!activeTask) {
      return;
    }

    if (!skipped && !answerText.trim()) {
      pushNotice("先写下你的答案，再提交。", "warning");
      return;
    }

    setSubmitting(true);
    try {
      const durationSeconds = taskStartedAt == null ? 0 : Math.max(1, Math.round((Date.now() - taskStartedAt) / 1000));
      const result = await practiceApi.submitAnswer({
        taskId: activeTask.id,
        answerText: skipped ? "" : answerText.trim(),
        durationSeconds,
        usedHint: showHint,
        uncertain,
        skipped,
      });

      setSession(result.session);
      setFeedback(result.submission);
      setQueuedNextTask(result.submission.nextTask ?? null);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to submit answer";
      pushNotice(`提交答案失败：${message}`, "error");
    } finally {
      setSubmitting(false);
    }
  }

  function handleContinue() {
    if (session?.completed || !queuedNextTask) {
      navigate("/");
      return;
    }

    setActiveTask(queuedNextTask);
    setQueuedNextTask(null);
    setFeedback(null);
    setAnswerText("");
    setShowHint(false);
    setUncertain(false);
    setTaskStartedAt(Date.now());
  }

  const progress = session?.progress;
  const progressPercent =
    progress && progress.totalTasks > 0 ? Math.round((progress.completedTasks / progress.totalTasks) * 100) : 0;

  if (!sessionId) {
    return (
      <div className="space-y-6">
        <section className="rounded-[2rem] border border-[var(--line)] bg-white/90 p-6 shadow-[var(--shadow)] md:p-8">
          <div className="grid gap-8 xl:grid-cols-[minmax(0,1.1fr)_minmax(18rem,0.9fr)]">
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--brand-ink-soft)]">Practice</p>
              <h1 className="text-3xl font-bold leading-tight text-[var(--brand-ink)] md:text-5xl">
                用你自己的材料，完成一组真正有针对性的英语训练。
              </h1>
              <p className="max-w-3xl text-sm leading-7 text-slate-600 md:text-base">
                每道题都来自你导入的 lesson。系统会结合最近的错误类型、掌握度、停顿时长和跳过情况，生成更适合今天的练习节奏。
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/library"
                  className="rounded-full border border-[var(--line)] bg-[var(--canvas)] px-5 py-3 text-sm font-semibold text-[var(--brand-ink)]"
                >
                  先去导入材料
                </Link>
                <Link
                  to="/settings"
                  className="rounded-full border border-[var(--line)] bg-white px-5 py-3 text-sm font-semibold text-[var(--brand-ink)]"
                >
                  检查模型配置
                </Link>
              </div>
            </div>

            <div className="rounded-[1.8rem] border border-[var(--line)] bg-[var(--surface-strong)] p-5">
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-semibold text-[var(--brand-ink)]">计划题量</p>
                  <p className="mt-1 text-sm text-slate-500">系统会按每题约 2-4 分钟估算训练时长。</p>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {TASK_OPTIONS.map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => setDesiredTaskCount(count)}
                      className={`rounded-[1.2rem] px-4 py-3 text-sm font-semibold transition ${
                        desiredTaskCount === count
                          ? "bg-[var(--brand-red)] text-white"
                          : "bg-[var(--canvas)] text-[var(--brand-ink)]"
                      }`}
                    >
                      {count} 题
                    </button>
                  ))}
                </div>

                <div className="grid gap-3">
                  {(["DAILY", "EXTRA"] as SessionMode[]).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => void handleStart(mode)}
                      disabled={startingMode !== null}
                      className={`rounded-[1.4rem] border px-5 py-4 text-left transition ${
                        mode === "DAILY"
                          ? "border-transparent bg-[var(--brand-red)] text-white"
                          : "border-[var(--line)] bg-white text-[var(--brand-ink)]"
                      } disabled:opacity-60`}
                    >
                      <p className="text-sm font-semibold">{MODE_COPY[mode].label}</p>
                      <p className={`mt-2 text-sm ${mode === "DAILY" ? "text-white/80" : "text-slate-500"}`}>
                        {startingMode === mode ? "正在生成 session..." : MODE_COPY[mode].description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (loadingSession) {
    return (
      <div className="rounded-[2rem] border border-[var(--line)] bg-white/90 p-10 shadow-[var(--shadow)]">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--brand-ink-soft)]">Practice</p>
        <h1 className="mt-4 text-3xl font-bold text-[var(--brand-ink)]">正在准备这次练习...</h1>
        <p className="mt-3 text-sm text-slate-500">系统正在加载 session、当前题目和对应材料。</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="rounded-[2rem] border border-[var(--line)] bg-white/90 p-10 shadow-[var(--shadow)]">
        <h1 className="text-3xl font-bold text-[var(--brand-ink)]">没有找到这次练习</h1>
        <p className="mt-3 text-sm text-slate-600">这个 session 可能不存在，或者已经失效。</p>
        <Link to="/" className="mt-5 inline-flex text-sm font-semibold text-[var(--brand-red)]">
          回到首页
        </Link>
      </div>
    );
  }

  if (!activeTask && !feedback) {
    return (
      <div className="space-y-6">
        <section className="rounded-[2rem] border border-[var(--line)] bg-white/90 p-6 shadow-[var(--shadow)] md:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--brand-ink-soft)]">Session Complete</p>
          <h1 className="mt-3 text-3xl font-bold text-[var(--brand-ink)]">这轮练习已经完成</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 md:text-base">{session.focusSummary}</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-[1.4rem] bg-[var(--canvas)] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand-ink-soft)]">Mode</p>
              <p className="mt-2 text-xl font-bold text-[var(--brand-ink)]">{session.mode}</p>
            </div>
            <div className="rounded-[1.4rem] bg-[var(--canvas)] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand-ink-soft)]">Completed</p>
              <p className="mt-2 text-xl font-bold text-[var(--brand-ink)]">
                {session.progress.completedTasks}/{session.progress.totalTasks}
              </p>
            </div>
            <div className="rounded-[1.4rem] bg-[var(--canvas)] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand-ink-soft)]">Average Score</p>
              <p className="mt-2 text-xl font-bold text-[var(--brand-ink)]">{Math.round(session.progress.averageScore)}</p>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/"
              className="rounded-full bg-[var(--brand-red)] px-5 py-3 text-sm font-semibold text-white shadow-lg"
            >
              回到今天
            </Link>
            <Link
              to="/stats"
              className="rounded-full border border-[var(--line)] bg-white px-5 py-3 text-sm font-semibold text-[var(--brand-ink)]"
            >
              查看统计
            </Link>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-[var(--line)] bg-white/90 p-6 shadow-[var(--shadow)] md:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--brand-ink-soft)]">Active Session</p>
            <h1 className="text-3xl font-bold text-[var(--brand-ink)]">
              {session.mode === "EXTRA" ? "加练 session" : "今日训练 session"}
            </h1>
            <p className="max-w-3xl text-sm leading-7 text-slate-600">{session.focusSummary}</p>
          </div>
          <div className="grid gap-3 text-sm text-slate-600 sm:grid-cols-3">
            <div className="rounded-[1.3rem] bg-[var(--canvas)] px-4 py-3">
              <p className="font-semibold text-[var(--brand-ink)]">{session.estimatedMinutes} 分钟</p>
              <p className="mt-1">预计时长</p>
            </div>
            <div className="rounded-[1.3rem] bg-[var(--canvas)] px-4 py-3">
              <p className="font-semibold text-[var(--brand-ink)]">
                {session.progress.completedTasks}/{session.progress.totalTasks}
              </p>
              <p className="mt-1">已完成题数</p>
            </div>
            <div className="rounded-[1.3rem] bg-[var(--canvas)] px-4 py-3">
              <p className="font-semibold text-[var(--brand-ink)]">{Math.round(session.progress.averageScore)}</p>
              <p className="mt-1">当前平均分</p>
            </div>
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-full bg-[var(--canvas-strong)]">
          <div
            className="h-2 rounded-full bg-[var(--brand-red)] transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </section>

      {activeTask ? (
        <section className="rounded-[2rem] border border-[var(--line)] bg-white/90 p-6 shadow-[var(--shadow)] md:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-[var(--canvas)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand-ink-soft)]">
                  {TASK_TYPE_LABELS[activeTask.taskType] ?? activeTask.taskType}
                </span>
                <Link
                  to={`/library/${activeTask.lessonId}`}
                  className="rounded-full border border-[var(--line)] bg-white px-3 py-1 text-xs font-semibold text-[var(--brand-ink)]"
                >
                  打开原材料
                </Link>
              </div>
              <h2 className="text-2xl font-bold text-[var(--brand-ink)]">{activeTask.prompt}</h2>
              {activeTask.shortContext ? (
                <p className="text-sm leading-6 text-slate-500">上下文：{activeTask.shortContext}</p>
              ) : null}
              {activeTask.startSeconds != null && activeTask.endSeconds != null ? (
                <p className="text-sm text-slate-500">
                  片段范围：{activeTask.startSeconds.toFixed(1)}s - {activeTask.endSeconds.toFixed(1)}s
                </p>
              ) : null}
            </div>
            {activeTask.hintText ? (
              <button
                type="button"
                onClick={() => setShowHint((current) => !current)}
                className="rounded-full border border-[var(--line)] bg-white px-5 py-3 text-sm font-semibold text-[var(--brand-ink)]"
              >
                {showHint ? "隐藏提示" : "查看提示"}
              </button>
            ) : null}
          </div>

          {showHint && activeTask.hintText ? (
            <div className="mt-6 rounded-[1.5rem] border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-6 text-amber-900">
              {activeTask.hintText}
            </div>
          ) : null}

          {activeTask.mediaUrl ? (
            <div className="mt-6 rounded-[1.5rem] border border-[var(--line)] bg-[var(--surface-strong)] p-5">
              <p className="text-sm font-semibold text-[var(--brand-ink)]">材料音频</p>
              {loadingAudio ? (
                <p className="mt-3 text-sm text-slate-500">正在加载音频...</p>
              ) : audioSrc ? (
                <audio src={audioSrc} controls className="mt-4 w-full" preload="metadata" />
              ) : (
                <p className="mt-3 text-sm text-slate-500">当前题目没有可用音频。</p>
              )}
            </div>
          ) : null}

          {!feedback ? (
            <div className="mt-6 space-y-4">
              <label className="space-y-2 text-sm font-medium text-slate-700">
                <span>你的答案</span>
                <textarea
                  value={answerText}
                  onChange={(event) => setAnswerText(event.target.value)}
                  className="app-textarea min-h-40"
                  placeholder="根据题目写出完整答案。系统会记录这次作答的时长、错误类型和稳定度。"
                />
              </label>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="flex items-center gap-3 rounded-[1.2rem] bg-[var(--canvas)] px-4 py-3 text-sm font-medium text-[var(--brand-ink)]">
                  <input type="checkbox" checked={uncertain} onChange={(event) => setUncertain(event.target.checked)} />
                  这题我不太确定
                </label>
                <div className="rounded-[1.2rem] bg-[var(--canvas)] px-4 py-3 text-sm text-slate-600">
                  {showHint ? "本次会记录你使用了提示。" : "如果需要可以先看提示，再提交。"}
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => void submitAnswer(false)}
                  disabled={submitting}
                  className="app-button-primary !w-auto px-6"
                >
                  {submitting ? "提交中..." : "提交并批改"}
                </button>
                <button
                  type="button"
                  onClick={() => void submitAnswer(true)}
                  disabled={submitting}
                  className="rounded-full border border-[var(--line)] bg-white px-5 py-3 text-sm font-semibold text-[var(--brand-ink)]"
                >
                  先跳过这题
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              <div className="rounded-[1.6rem] border border-[var(--line)] bg-[var(--surface-strong)] p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-[var(--canvas)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand-ink-soft)]">
                        分数 {feedback.score}
                      </span>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          feedback.correct ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {feedback.correct ? "通过" : "需要再练"}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-[var(--brand-ink)]">{feedback.shortFeedback}</h3>
                    <p className="text-sm leading-7 text-slate-600">{feedback.detailedFeedback}</p>
                    <p className="text-sm leading-7 text-slate-600">建议：{feedback.suggestion}</p>
                  </div>
                  <div className="rounded-[1.4rem] bg-[var(--canvas)] px-4 py-4 text-sm text-slate-600 lg:w-[17rem]">
                    <p className="font-semibold text-[var(--brand-ink)]">
                      {feedback.errorTypes.length > 0 ? "错误类型" : "没有明确错误类型"}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {feedback.errorTypes.length > 0 ? (
                        feedback.errorTypes.map((item) => (
                          <span
                            key={item}
                            className="rounded-full border border-[var(--line)] bg-white px-3 py-1 text-xs font-semibold text-[var(--brand-ink)]"
                          >
                            {item}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-500">本题反馈更偏向整体正确度。</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button type="button" onClick={handleContinue} className="app-button-primary !w-auto px-6">
                  {session.completed ? "回到今天" : "进入下一题"}
                </button>
                <Link
                  to="/stats"
                  className="rounded-full border border-[var(--line)] bg-white px-5 py-3 text-sm font-semibold text-[var(--brand-ink)]"
                >
                  查看统计
                </Link>
              </div>
            </div>
          )}
        </section>
      ) : null}
    </div>
  );
}
