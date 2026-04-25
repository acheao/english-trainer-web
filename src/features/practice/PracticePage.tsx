import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { libraryApi } from "../materials/libraryApi";
import { useNotice } from "../../shared/ui/useNotice";
import { practiceApi, type SessionMode } from "./practiceApi";
import { useI18n } from "../../shared/i18n/I18nProvider";
import { getErrorMessage } from "../../shared/i18n/message";
import { getErrorTypeLabel, getTaskTypeLabel } from "../../shared/i18n/domain";
import type { PracticeTask, SessionView, SubmissionView } from "../../types";

const TASK_OPTIONS = [8, 10, 12];

export default function PracticePage() {
  const navigate = useNavigate();
  const { sessionId } = useParams<{ sessionId: string }>();
  const { pushNotice } = useNotice();
  const { locale, isZh } = useI18n();

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

  const modeCopy = isZh
    ? {
        DAILY: {
          label: "今日训练",
          description: "按今天最值得练的内容生成一组 30 分钟左右的任务。",
        },
        EXTRA: {
          label: "加练模式",
          description: "围绕薄弱点和未充分练习的材料补一组额外练习。",
        },
      }
    : {
        DAILY: {
          label: "Daily Session",
          description: "Generate a set of tasks for the material that matters most today, around 30 minutes.",
        },
        EXTRA: {
          label: "Extra Session",
          description: "Create an extra round around weaker areas and materials you have not practiced enough.",
        },
      };

  const text = isZh
      ? {
        loadFailed: "加载练习失败。",
        audioFailed: "音频加载失败。",
        startFailed: "启动练习失败。",
        emptyAnswer: "先写下你的答案，再提交。",
        submitFailed: "提交答案失败。",
        landingBadge: "练习",
        landingTitle: "用你自己的材料，完成一组真正有针对性的英语训练。",
        landingBody:
          "每道题都来自你导入的材料。系统会结合最近的错误类型、掌握度、停顿时长和跳过情况，生成更适合今天的练习节奏。",
        importMaterials: "先去导入材料",
        checkSettings: "检查模型配置",
        taskCount: "计划题量",
        taskCountHint: "系统会按每题约 2-4 分钟估算训练时长。",
        questionCount: (count: number) => `${count} 题`,
        startingSession: "正在生成练习...",
        loadingTitle: "正在准备这次练习...",
        loadingBody: "系统正在加载练习、当前题目和对应材料。",
        missingTitle: "没有找到这次练习",
        missingBody: "这次练习可能不存在，或者已经失效。",
        backHome: "回到首页",
        completeBadge: "练习完成",
        completeTitle: "这轮练习已经完成",
        mode: "模式",
        completed: "已完成",
        averageScore: "平均分",
        backToday: "回到今天",
        viewStats: "查看统计",
        activeSession: "进行中的练习",
        extraSession: "加练",
        dailySession: "今日训练",
        estimatedTime: "预计时长",
        completedCount: "已完成题数",
        currentAverage: "当前平均分",
        openSource: "打开原材料",
        context: "上下文",
        range: "片段范围",
        hideHint: "隐藏提示",
        showHint: "查看提示",
        lessonAudio: "材料音频",
        loadingAudio: "正在加载音频...",
        noAudio: "当前题目没有可用音频。",
        yourAnswer: "你的答案",
        answerPlaceholder: "根据题目写出完整答案。系统会记录这次作答的时长、错误类型和稳定度。",
        uncertain: "这题我不太确定",
        usedHint: "本次会记录你使用了提示。",
        suggestHint: "如果需要可以先看提示，再提交。",
        submit: "提交并批改",
        submitting: "提交中...",
        skip: "先跳过这题",
        score: "分数",
        correct: "通过",
        retry: "需要再练",
        suggestion: "建议",
        errorTypes: "错误类型",
        noErrorTypes: "没有明确错误类型",
        overallFeedback: "本题反馈更偏向整体正确度。",
        next: "进入下一题",
      }
    : {
        loadFailed: "Failed to load the practice session.",
        audioFailed: "Failed to load audio.",
        startFailed: "Failed to start the session.",
        emptyAnswer: "Write your answer first, then submit it.",
        submitFailed: "Failed to submit the answer.",
        landingBadge: "Practice",
        landingTitle: "Use your own materials to complete a session that is truly tailored to you.",
        landingBody:
          "Every task comes from the lessons you imported. The system combines recent error types, mastery, hesitation, and skip behavior to shape a rhythm that fits today.",
        importMaterials: "Import Materials First",
        checkSettings: "Check Model Settings",
        taskCount: "Planned Tasks",
        taskCountHint: "The system estimates about 2-4 minutes per question.",
        questionCount: (count: number) => `${count} questions`,
        startingSession: "Generating the session...",
        loadingTitle: "Preparing this session...",
        loadingBody: "Loading the session, the current task, and the related material.",
        missingTitle: "Session not found",
        missingBody: "This session may not exist anymore, or it may have expired.",
        backHome: "Back Home",
        completeBadge: "Session Complete",
        completeTitle: "This practice round is complete",
        mode: "Mode",
        completed: "Completed",
        averageScore: "Average Score",
        backToday: "Back to Today",
        viewStats: "View Stats",
        activeSession: "Active Session",
        extraSession: "Extra Session",
        dailySession: "Daily Session",
        estimatedTime: "Estimated Time",
        completedCount: "Completed Tasks",
        currentAverage: "Current Average",
        openSource: "Open Source Material",
        context: "Context",
        range: "Clip Range",
        hideHint: "Hide Hint",
        showHint: "Show Hint",
        lessonAudio: "Lesson Audio",
        loadingAudio: "Loading audio...",
        noAudio: "No audio is available for this task.",
        yourAnswer: "Your Answer",
        answerPlaceholder:
          "Write the full answer based on the prompt. The system will record duration, error types, and stability for this attempt.",
        uncertain: "I am not very sure about this one",
        usedHint: "This submission will record that you used the hint.",
        suggestHint: "Use the hint first if you need it, then submit.",
        submit: "Submit for Grading",
        submitting: "Submitting...",
        skip: "Skip This Task",
        score: "Score",
        correct: "Passed",
        retry: "Needs More Practice",
        suggestion: "Suggestion",
        errorTypes: "Error Types",
        noErrorTypes: "No clear error types",
        overallFeedback: "The feedback for this task is more about overall correctness.",
        next: "Next Task",
      };

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
          pushNotice(getErrorMessage(error, text.loadFailed), "error");
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
  }, [pushNotice, sessionId, text.loadFailed]);

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
          pushNotice(getErrorMessage(error, text.audioFailed), "warning");
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
  }, [activeTask?.id, activeTask?.mediaUrl, pushNotice, text.audioFailed]);

  async function handleStart(mode: SessionMode) {
    setStartingMode(mode);
    try {
      const data = await practiceApi.startSession({
        mode,
        desiredTaskCount,
      });
      navigate(`/practice/session/${data.id}`);
    } catch (error) {
      pushNotice(getErrorMessage(error, text.startFailed), "error");
    } finally {
      setStartingMode(null);
    }
  }

  async function submitAnswer(skipped: boolean) {
    if (!activeTask) {
      return;
    }

    if (!skipped && !answerText.trim()) {
      pushNotice(text.emptyAnswer, "warning");
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
      pushNotice(getErrorMessage(error, text.submitFailed), "error");
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
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--brand-ink-soft)]">{text.landingBadge}</p>
              <h1 className="text-3xl font-bold leading-tight text-[var(--brand-ink)] md:text-5xl">{text.landingTitle}</h1>
              <p className="max-w-3xl text-sm leading-7 text-slate-600 md:text-base">{text.landingBody}</p>
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/library"
                  className="rounded-full border border-[var(--line)] bg-[var(--canvas)] px-5 py-3 text-sm font-semibold text-[var(--brand-ink)]"
                >
                  {text.importMaterials}
                </Link>
                <Link
                  to="/settings"
                  className="rounded-full border border-[var(--line)] bg-white px-5 py-3 text-sm font-semibold text-[var(--brand-ink)]"
                >
                  {text.checkSettings}
                </Link>
              </div>
            </div>

            <div className="rounded-[1.8rem] border border-[var(--line)] bg-[var(--surface-strong)] p-5">
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-semibold text-[var(--brand-ink)]">{text.taskCount}</p>
                  <p className="mt-1 text-sm text-slate-500">{text.taskCountHint}</p>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {TASK_OPTIONS.map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => setDesiredTaskCount(count)}
                      className={`rounded-[1.2rem] px-4 py-3 text-sm font-semibold transition ${
                        desiredTaskCount === count ? "bg-[var(--brand-red)] text-white" : "bg-[var(--canvas)] text-[var(--brand-ink)]"
                      }`}
                    >
                      {text.questionCount(count)}
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
                      <p className="text-sm font-semibold">{modeCopy[mode].label}</p>
                      <p className={`mt-2 text-sm ${mode === "DAILY" ? "text-white/80" : "text-slate-500"}`}>
                        {startingMode === mode ? text.startingSession : modeCopy[mode].description}
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
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--brand-ink-soft)]">{text.landingBadge}</p>
        <h1 className="mt-4 text-3xl font-bold text-[var(--brand-ink)]">{text.loadingTitle}</h1>
        <p className="mt-3 text-sm text-slate-500">{text.loadingBody}</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="rounded-[2rem] border border-[var(--line)] bg-white/90 p-10 shadow-[var(--shadow)]">
        <h1 className="text-3xl font-bold text-[var(--brand-ink)]">{text.missingTitle}</h1>
        <p className="mt-3 text-sm text-slate-600">{text.missingBody}</p>
        <Link to="/" className="mt-5 inline-flex text-sm font-semibold text-[var(--brand-red)]">
          {text.backHome}
        </Link>
      </div>
    );
  }

  if (!activeTask && !feedback) {
    return (
      <div className="space-y-6">
        <section className="rounded-[2rem] border border-[var(--line)] bg-white/90 p-6 shadow-[var(--shadow)] md:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--brand-ink-soft)]">{text.completeBadge}</p>
          <h1 className="mt-3 text-3xl font-bold text-[var(--brand-ink)]">{text.completeTitle}</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 md:text-base">{session.focusSummary}</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-[1.4rem] bg-[var(--canvas)] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand-ink-soft)]">{text.mode}</p>
              <p className="mt-2 text-xl font-bold text-[var(--brand-ink)]">{modeCopy[session.mode as SessionMode]?.label ?? session.mode}</p>
            </div>
            <div className="rounded-[1.4rem] bg-[var(--canvas)] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand-ink-soft)]">{text.completed}</p>
              <p className="mt-2 text-xl font-bold text-[var(--brand-ink)]">
                {session.progress.completedTasks}/{session.progress.totalTasks}
              </p>
            </div>
            <div className="rounded-[1.4rem] bg-[var(--canvas)] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand-ink-soft)]">{text.averageScore}</p>
              <p className="mt-2 text-xl font-bold text-[var(--brand-ink)]">{Math.round(session.progress.averageScore)}</p>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/" className="rounded-full bg-[var(--brand-red)] px-5 py-3 text-sm font-semibold text-white shadow-lg">
              {text.backToday}
            </Link>
            <Link
              to="/stats"
              className="rounded-full border border-[var(--line)] bg-white px-5 py-3 text-sm font-semibold text-[var(--brand-ink)]"
            >
              {text.viewStats}
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
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--brand-ink-soft)]">{text.activeSession}</p>
            <h1 className="text-3xl font-bold text-[var(--brand-ink)]">
              {session.mode === "EXTRA" ? text.extraSession : text.dailySession}
            </h1>
            <p className="max-w-3xl text-sm leading-7 text-slate-600">{session.focusSummary}</p>
          </div>
          <div className="grid gap-3 text-sm text-slate-600 sm:grid-cols-3">
            <div className="rounded-[1.3rem] bg-[var(--canvas)] px-4 py-3">
              <p className="font-semibold text-[var(--brand-ink)]">
                {session.estimatedMinutes}
                {isZh ? " 分钟" : " min"}
              </p>
              <p className="mt-1">{text.estimatedTime}</p>
            </div>
            <div className="rounded-[1.3rem] bg-[var(--canvas)] px-4 py-3">
              <p className="font-semibold text-[var(--brand-ink)]">
                {session.progress.completedTasks}/{session.progress.totalTasks}
              </p>
              <p className="mt-1">{text.completedCount}</p>
            </div>
            <div className="rounded-[1.3rem] bg-[var(--canvas)] px-4 py-3">
              <p className="font-semibold text-[var(--brand-ink)]">{Math.round(session.progress.averageScore)}</p>
              <p className="mt-1">{text.currentAverage}</p>
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
                  {getTaskTypeLabel(activeTask.taskType, locale)}
                </span>
                <Link
                  to={`/library/${activeTask.lessonId}`}
                  className="rounded-full border border-[var(--line)] bg-white px-3 py-1 text-xs font-semibold text-[var(--brand-ink)]"
                >
                  {text.openSource}
                </Link>
              </div>
              <h2 className="text-2xl font-bold text-[var(--brand-ink)]">{activeTask.prompt}</h2>
              {activeTask.shortContext ? (
                <p className="text-sm leading-6 text-slate-500">
                  {text.context}: {activeTask.shortContext}
                </p>
              ) : null}
              {activeTask.startSeconds != null && activeTask.endSeconds != null ? (
                <p className="text-sm text-slate-500">
                  {text.range}: {activeTask.startSeconds.toFixed(1)}s - {activeTask.endSeconds.toFixed(1)}s
                </p>
              ) : null}
            </div>
            {activeTask.hintText ? (
              <button
                type="button"
                onClick={() => setShowHint((current) => !current)}
                className="rounded-full border border-[var(--line)] bg-white px-5 py-3 text-sm font-semibold text-[var(--brand-ink)]"
              >
                {showHint ? text.hideHint : text.showHint}
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
              <p className="text-sm font-semibold text-[var(--brand-ink)]">{text.lessonAudio}</p>
              {loadingAudio ? (
                <p className="mt-3 text-sm text-slate-500">{text.loadingAudio}</p>
              ) : audioSrc ? (
                <audio src={audioSrc} controls className="mt-4 w-full" preload="metadata" />
              ) : (
                <p className="mt-3 text-sm text-slate-500">{text.noAudio}</p>
              )}
            </div>
          ) : null}

          {!feedback ? (
            <div className="mt-6 space-y-4">
              <label className="space-y-2 text-sm font-medium text-slate-700">
                <span>{text.yourAnswer}</span>
                <textarea
                  value={answerText}
                  onChange={(event) => setAnswerText(event.target.value)}
                  className="app-textarea min-h-40"
                  placeholder={text.answerPlaceholder}
                />
              </label>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="flex items-center gap-3 rounded-[1.2rem] bg-[var(--canvas)] px-4 py-3 text-sm font-medium text-[var(--brand-ink)]">
                  <input type="checkbox" checked={uncertain} onChange={(event) => setUncertain(event.target.checked)} />
                  {text.uncertain}
                </label>
                <div className="rounded-[1.2rem] bg-[var(--canvas)] px-4 py-3 text-sm text-slate-600">
                  {showHint ? text.usedHint : text.suggestHint}
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => void submitAnswer(false)}
                  disabled={submitting}
                  className="app-button-primary !w-auto px-6"
                >
                  {submitting ? text.submitting : text.submit}
                </button>
                <button
                  type="button"
                  onClick={() => void submitAnswer(true)}
                  disabled={submitting}
                  className="rounded-full border border-[var(--line)] bg-white px-5 py-3 text-sm font-semibold text-[var(--brand-ink)]"
                >
                  {text.skip}
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
                        {text.score} {feedback.score}
                      </span>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          feedback.correct ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {feedback.correct ? text.correct : text.retry}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-[var(--brand-ink)]">{feedback.shortFeedback}</h3>
                    <p className="text-sm leading-7 text-slate-600">{feedback.detailedFeedback}</p>
                    <p className="text-sm leading-7 text-slate-600">
                      {text.suggestion}: {feedback.suggestion}
                    </p>
                  </div>
                  <div className="rounded-[1.4rem] bg-[var(--canvas)] px-4 py-4 text-sm text-slate-600 lg:w-[17rem]">
                    <p className="font-semibold text-[var(--brand-ink)]">
                      {feedback.errorTypes.length > 0 ? text.errorTypes : text.noErrorTypes}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {feedback.errorTypes.length > 0 ? (
                        feedback.errorTypes.map((item) => (
                          <span
                            key={item}
                            className="rounded-full border border-[var(--line)] bg-white px-3 py-1 text-xs font-semibold text-[var(--brand-ink)]"
                          >
                            {getErrorTypeLabel(item, locale)}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-500">{text.overallFeedback}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button type="button" onClick={handleContinue} className="app-button-primary !w-auto px-6">
                  {session.completed ? text.backToday : text.next}
                </button>
                <Link
                  to="/stats"
                  className="rounded-full border border-[var(--line)] bg-white px-5 py-3 text-sm font-semibold text-[var(--brand-ink)]"
                >
                  {text.viewStats}
                </Link>
              </div>
            </div>
          )}
        </section>
      ) : null}
    </div>
  );
}
