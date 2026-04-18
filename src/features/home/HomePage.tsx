import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BoltRounded, PlayArrowRounded, RocketLaunchRounded, SettingsRounded } from "@mui/icons-material";
import type { LessonSummary, StatsOverview, TodayPlan } from "../../types";
import { useAuth } from "../auth/useAuth";
import { libraryApi } from "../materials/libraryApi";
import { practiceApi } from "../practice/practiceApi";
import { statsApi } from "../stats/statsApi";
import { useNotice } from "../../shared/ui/useNotice";

export default function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { pushNotice } = useNotice();

  const [plan, setPlan] = useState<TodayPlan | null>(null);
  const [overview, setOverview] = useState<StatsOverview | null>(null);
  const [recentLessons, setRecentLessons] = useState<LessonSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [startingMode, setStartingMode] = useState<"DAILY" | "EXTRA" | null>(null);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const [todayPlan, statsOverview, lessons] = await Promise.all([
          practiceApi.getTodayPlan(),
          statsApi.getOverview(),
          libraryApi.listLessons(),
        ]);
        if (cancelled) return;
        setPlan(todayPlan);
        setOverview(statsOverview);
        setRecentLessons(lessons.slice(0, 5));
      } catch (error) {
        if (!cancelled) {
          const message = error instanceof Error ? error.message : "Failed to load dashboard";
          pushNotice(`今日看板加载失败 / ${message}`, "error");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [pushNotice]);

  async function startSession(mode: "DAILY" | "EXTRA") {
    setStartingMode(mode);
    try {
      const session = await practiceApi.startSession({ mode });
      navigate(`/practice/session/${session.id}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to start session";
      pushNotice(`无法开始练习 / ${message}`, "error");
    } finally {
      setStartingMode(null);
    }
  }

  if (loading) {
    return (
      <div className="rounded-[2rem] border border-[var(--line)] bg-white/85 p-10 shadow-[var(--shadow)]">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--brand-ink-soft)]">Today</p>
        <h1 className="mt-4 text-3xl font-bold text-[var(--brand-ink)]">正在准备你的今日学习计划...</h1>
      </div>
    );
  }

  const hasLessons = recentLessons.length > 0;

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-[var(--line)] bg-white/90 p-6 shadow-[var(--shadow)] md:p-8">
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1.15fr)_minmax(20rem,0.85fr)]">
          <div className="space-y-5">
            <span className="inline-flex rounded-full border border-[var(--line)] bg-[var(--canvas)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-[var(--brand-ink-soft)]">
              Daily Focus / 今日主线
            </span>
            <h1 className="max-w-3xl text-3xl font-bold leading-tight text-[var(--brand-ink)] md:text-5xl">
              今天这 30 分钟，围绕你的弱点和新材料，生成最值得做的一组练习。
            </h1>
            <p className="max-w-3xl text-sm leading-7 text-slate-600 md:text-base">
              {plan?.focusSummary ?? "Import a lesson to let the planner build your first session."}
            </p>

            {!user?.hasLlmConfig ? (
              <div className="rounded-[1.5rem] border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
                还没有配置模型 API。先去 <Link to="/settings" className="font-semibold underline">Settings / 设置</Link>{" "}
                完成 onboarding，再回来开始个性化批改。
              </div>
            ) : null}

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => startSession("DAILY")}
                disabled={!hasLessons || startingMode !== null}
                className="inline-flex items-center gap-2 rounded-full bg-[var(--brand-red)] px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 disabled:opacity-50"
              >
                <PlayArrowRounded fontSize="small" />
                {startingMode === "DAILY" ? "生成中 / Starting..." : "开始今日练习 / Start Daily Session"}
              </button>
              <button
                type="button"
                onClick={() => startSession("EXTRA")}
                disabled={!hasLessons || startingMode !== null}
                className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-white px-5 py-3 text-sm font-semibold text-[var(--brand-ink)] transition hover:-translate-y-0.5 disabled:opacity-50"
              >
                <RocketLaunchRounded fontSize="small" />
                {startingMode === "EXTRA" ? "准备中 / Preparing..." : "加练一组 / Extra Session"}
              </button>
              <Link
                to="/library"
                className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--canvas)] px-5 py-3 text-sm font-semibold text-[var(--brand-ink)] transition hover:-translate-y-0.5"
              >
                <BoltRounded fontSize="small" />
                去资料库 / Open Library
              </Link>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
            <article className="rounded-[1.6rem] bg-[var(--canvas)] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand-ink-soft)]">Today Plan</p>
              <p className="mt-3 text-3xl font-bold text-[var(--brand-ink)]">{plan?.estimatedMinutes ?? 30} min</p>
              <p className="mt-2 text-sm text-slate-600">{plan?.selectedUnitCount ?? 0} tasks planned today</p>
            </article>
            <article className="rounded-[1.6rem] bg-[var(--canvas)] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand-ink-soft)]">Streak</p>
              <p className="mt-3 text-3xl font-bold text-[var(--brand-ink)]">{overview?.streakDays ?? 0} days</p>
              <p className="mt-2 text-sm text-slate-600">Keep the daily loop alive.</p>
            </article>
            <article className="rounded-[1.6rem] bg-[var(--canvas)] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand-ink-soft)]">Recent Score</p>
              <p className="mt-3 text-3xl font-bold text-[var(--brand-ink)]">{overview?.recentAverageScore ?? 0}</p>
              <p className="mt-2 text-sm text-slate-600">Last 30 days average.</p>
            </article>
            <article className="rounded-[1.6rem] bg-[var(--canvas)] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand-ink-soft)]">Pending Review</p>
              <p className="mt-3 text-3xl font-bold text-[var(--brand-ink)]">{overview?.pendingReviewUnits ?? 0}</p>
              <p className="mt-2 text-sm text-slate-600">Units waiting to come back.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="rounded-[2rem] border border-[var(--line)] bg-white/90 p-6 shadow-[var(--shadow)]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--brand-ink-soft)]">Recent Lessons</p>
              <h2 className="mt-2 text-2xl font-bold text-[var(--brand-ink)]">最近导入的学习材料</h2>
            </div>
            <Link to="/library" className="text-sm font-semibold text-[var(--brand-red)]">
              全部查看 / View all
            </Link>
          </div>

          <div className="mt-6 space-y-4">
            {recentLessons.length === 0 ? (
              <div className="rounded-[1.5rem] border border-dashed border-[var(--line)] bg-[var(--canvas)] px-5 py-8 text-sm text-slate-600">
                你还没有导入任何材料。去资料库导入 YouTube、文章或文本后，这里就会开始长出练习。 / Import your first lesson to start.
              </div>
            ) : (
              recentLessons.map((lesson) => (
                <Link
                  key={lesson.id}
                  to={`/library/${lesson.id}`}
                  className="block rounded-[1.5rem] border border-[var(--line)] bg-[var(--surface-strong)] px-5 py-4 transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-[var(--brand-ink)]">{lesson.title}</p>
                      <p className="mt-2 text-sm leading-6 text-slate-600">{lesson.summary}</p>
                    </div>
                    <div className="shrink-0 rounded-full bg-[var(--canvas)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand-ink-soft)]">
                      {lesson.sourceType}
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        <aside className="rounded-[2rem] border border-[var(--line)] bg-white/90 p-6 shadow-[var(--shadow)]">
          <div className="flex items-center gap-2 text-[var(--brand-red)]">
            <SettingsRounded fontSize="small" />
            <p className="text-xs font-semibold uppercase tracking-[0.28em]">Readiness</p>
          </div>
          <h2 className="mt-3 text-2xl font-bold text-[var(--brand-ink)]">Session Signals</h2>
          <div className="mt-6 space-y-4 text-sm text-slate-600">
            <div className="rounded-[1.4rem] bg-[var(--canvas)] px-4 py-4">
              <p className="font-semibold text-[var(--brand-ink)]">{overview?.practiceMinutesLast7Days ?? 0} min / 7d</p>
              <p className="mt-2">近 7 天累计练习时长。</p>
            </div>
            <div className="rounded-[1.4rem] bg-[var(--canvas)] px-4 py-4">
              <p className="font-semibold text-[var(--brand-ink)]">{overview?.studyUnits ?? 0} units</p>
              <p className="mt-2">当前资料库中的可学习分句数量。</p>
            </div>
            <div className="rounded-[1.4rem] bg-[var(--canvas)] px-4 py-4">
              <p className="font-semibold text-[var(--brand-ink)]">{overview?.activeLessons ?? 0} lessons</p>
              <p className="mt-2">已导入且可继续使用的学习材料。</p>
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}
