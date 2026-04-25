import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BoltRounded, PlayArrowRounded, RocketLaunchRounded, SettingsRounded } from "@mui/icons-material";
import { useAuth } from "../auth/useAuth";
import { libraryApi } from "../materials/libraryApi";
import { practiceApi } from "../practice/practiceApi";
import { statsApi } from "../stats/statsApi";
import { useNotice } from "../../shared/ui/useNotice";
import { useI18n } from "../../shared/i18n/I18nProvider";
import { getErrorMessage } from "../../shared/i18n/message";
import { getSourceTypeLabel } from "../../shared/i18n/domain";
import type { LessonSummary, StatsOverview, TodayPlan } from "../../types";

export default function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { pushNotice } = useNotice();
  const { locale, isZh } = useI18n();

  const [plan, setPlan] = useState<TodayPlan | null>(null);
  const [overview, setOverview] = useState<StatsOverview | null>(null);
  const [recentLessons, setRecentLessons] = useState<LessonSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [startingMode, setStartingMode] = useState<"DAILY" | "EXTRA" | null>(null);

  const text = isZh
    ? {
        loadFailed: "加载首页失败。",
        startFailed: "启动练习失败。",
        loadingTitle: "正在准备今天的训练建议...",
        focusBadge: "今日焦点",
        focusTitle: "今天的目标不是多做题，而是做最值得做的那一组题。",
        focusFallback: "先导入一些你真正关心的材料，系统才能根据弱点、时长和掌握度生成一组高价值练习。",
        missingModelPrefix: "你还没有配置大模型接口。先去",
        missingModelLink: "设置",
        missingModelSuffix: "完成模型配置，再回来生成个性化练习。",
        startDaily: "开始今日训练",
        startingDaily: "正在生成今日练习...",
        startExtra: "开始加练",
        startingExtra: "正在准备加练...",
        openLibrary: "打开材料库",
        todayPlan: "今日计划",
        streak: "连续练习",
        recentScore: "最近得分",
        pendingReview: "待复习",
        planUnits: (count: number) => `${count} 个学习单元进入今天计划`,
        streakHint: "保持连续练习，系统会更懂你的节奏。",
        scoreHint: "最近 30 天平均表现。",
        pendingHint: "这些内容适合尽快回炉。",
        recentMaterials: "最近导入的学习材料",
        viewAll: "查看全部",
        noMaterials: "你还没有导入任何材料。先从 YouTube、文章链接或纯文本开始，系统才能基于你的真实兴趣构建训练。",
        readiness: "训练信号",
        practiceTimeHint: "过去 7 天累计练习时长。",
        unitsHint: "当前可进入练习池的学习单元。",
        lessonsHint: "已经可用的材料数量。",
      }
    : {
        loadFailed: "Failed to load the home page.",
        startFailed: "Failed to start the session.",
        loadingTitle: "Preparing today's recommendation...",
        focusBadge: "Today Focus",
        focusTitle: "Today is not about doing more questions. It is about doing the ones that matter most.",
        focusFallback:
          "Import a few materials you genuinely care about first, so the system can build a high-value set based on your weaknesses, time, and mastery.",
        missingModelPrefix: "You have not connected an LLM yet. Go to",
        missingModelLink: "Settings",
        missingModelSuffix: "to finish model setup, then come back for a personalized session.",
        startDaily: "Start Daily Session",
        startingDaily: "Generating today's session...",
        startExtra: "Start Extra Session",
        startingExtra: "Preparing the extra session...",
        openLibrary: "Open Materials",
        todayPlan: "Today Plan",
        streak: "Streak",
        recentScore: "Recent Score",
        pendingReview: "Pending Review",
        planUnits: (count: number) => `${count} study units selected for today`,
        streakHint: "Keep showing up, and the system will learn your rhythm better.",
        scoreHint: "Average performance over the last 30 days.",
        pendingHint: "These are the items worth revisiting soon.",
        recentMaterials: "Recently Imported Materials",
        viewAll: "View all",
        noMaterials:
          "You have not imported any materials yet. Start with YouTube, an article URL, or plain text so the system can build practice around your real interests.",
        readiness: "Readiness",
        practiceTimeHint: "Total practice time over the last 7 days.",
        unitsHint: "Study units currently available in the practice pool.",
        lessonsHint: "Number of lessons already available.",
      };

  useEffect(() => {
    let cancelled = false;

    async function loadHome() {
      try {
        const [todayPlan, statsOverview, lessons] = await Promise.all([
          practiceApi.getTodayPlan(),
          statsApi.getOverview(),
          libraryApi.listLessons(),
        ]);
        if (cancelled) {
          return;
        }
        setPlan(todayPlan);
        setOverview(statsOverview);
        setRecentLessons(lessons.slice(0, 5));
      } catch (error) {
        if (!cancelled) {
          pushNotice(getErrorMessage(error, text.loadFailed), "error");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadHome();
    return () => {
      cancelled = true;
    };
  }, [pushNotice, text.loadFailed]);

  async function startSession(mode: "DAILY" | "EXTRA") {
    setStartingMode(mode);
    try {
      const session = await practiceApi.startSession({ mode });
      navigate(`/practice/session/${session.id}`);
    } catch (error) {
      pushNotice(getErrorMessage(error, text.startFailed), "error");
    } finally {
      setStartingMode(null);
    }
  }

  if (loading) {
    return (
      <div className="rounded-[2rem] border border-[var(--line)] bg-white/85 p-10 shadow-[var(--shadow)]">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--brand-ink-soft)]">
          {isZh ? "今天" : "Today"}
        </p>
        <h1 className="mt-4 text-3xl font-bold text-[var(--brand-ink)]">{text.loadingTitle}</h1>
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
              {text.focusBadge}
            </span>
            <h1 className="max-w-3xl text-3xl font-bold leading-tight text-[var(--brand-ink)] md:text-5xl">
              {text.focusTitle}
            </h1>
            <p className="max-w-3xl text-sm leading-7 text-slate-600 md:text-base">{plan?.focusSummary ?? text.focusFallback}</p>

            {!user?.hasLlmConfig ? (
              <div className="rounded-[1.5rem] border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-6 text-amber-900">
                {text.missingModelPrefix}{" "}
                <Link to="/settings" className="font-semibold underline">
                  {text.missingModelLink}
                </Link>{" "}
                {text.missingModelSuffix}
              </div>
            ) : null}

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => void startSession("DAILY")}
                disabled={!hasLessons || startingMode !== null}
                className="inline-flex items-center gap-2 rounded-full bg-[var(--brand-red)] px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 disabled:opacity-50"
              >
                <PlayArrowRounded fontSize="small" />
                {startingMode === "DAILY" ? text.startingDaily : text.startDaily}
              </button>
              <button
                type="button"
                onClick={() => void startSession("EXTRA")}
                disabled={!hasLessons || startingMode !== null}
                className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-white px-5 py-3 text-sm font-semibold text-[var(--brand-ink)] transition hover:-translate-y-0.5 disabled:opacity-50"
              >
                <RocketLaunchRounded fontSize="small" />
                {startingMode === "EXTRA" ? text.startingExtra : text.startExtra}
              </button>
              <Link
                to="/library"
                className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--canvas)] px-5 py-3 text-sm font-semibold text-[var(--brand-ink)] transition hover:-translate-y-0.5"
              >
                <BoltRounded fontSize="small" />
                {text.openLibrary}
              </Link>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
            <article className="rounded-[1.6rem] bg-[var(--canvas)] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand-ink-soft)]">{text.todayPlan}</p>
              <p className="mt-3 text-3xl font-bold text-[var(--brand-ink)]">{plan?.estimatedMinutes ?? 30}{isZh ? " 分钟" : " min"}</p>
              <p className="mt-2 text-sm text-slate-600">{text.planUnits(plan?.selectedUnitCount ?? 0)}</p>
            </article>
            <article className="rounded-[1.6rem] bg-[var(--canvas)] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand-ink-soft)]">{text.streak}</p>
              <p className="mt-3 text-3xl font-bold text-[var(--brand-ink)]">{overview?.streakDays ?? 0}{isZh ? " 天" : " days"}</p>
              <p className="mt-2 text-sm text-slate-600">{text.streakHint}</p>
            </article>
            <article className="rounded-[1.6rem] bg-[var(--canvas)] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand-ink-soft)]">{text.recentScore}</p>
              <p className="mt-3 text-3xl font-bold text-[var(--brand-ink)]">{overview?.recentAverageScore ?? 0}</p>
              <p className="mt-2 text-sm text-slate-600">{text.scoreHint}</p>
            </article>
            <article className="rounded-[1.6rem] bg-[var(--canvas)] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand-ink-soft)]">{text.pendingReview}</p>
              <p className="mt-3 text-3xl font-bold text-[var(--brand-ink)]">{overview?.pendingReviewUnits ?? 0}</p>
              <p className="mt-2 text-sm text-slate-600">{text.pendingHint}</p>
            </article>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="rounded-[2rem] border border-[var(--line)] bg-white/90 p-6 shadow-[var(--shadow)]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--brand-ink-soft)]">
                {isZh ? "最近材料" : "Recent Materials"}
              </p>
              <h2 className="mt-2 text-2xl font-bold text-[var(--brand-ink)]">{text.recentMaterials}</h2>
            </div>
            <Link to="/library" className="text-sm font-semibold text-[var(--brand-red)]">
              {text.viewAll}
            </Link>
          </div>

          <div className="mt-6 space-y-4">
            {recentLessons.length === 0 ? (
              <div className="rounded-[1.5rem] border border-dashed border-[var(--line)] bg-[var(--canvas)] px-5 py-8 text-sm leading-6 text-slate-600">
                {text.noMaterials}
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
                      {getSourceTypeLabel(lesson.sourceType, locale)}
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
            <p className="text-xs font-semibold uppercase tracking-[0.28em]">{text.readiness}</p>
          </div>
          <h2 className="mt-3 text-2xl font-bold text-[var(--brand-ink)]">{text.readiness}</h2>
          <div className="mt-6 space-y-4 text-sm text-slate-600">
            <div className="rounded-[1.4rem] bg-[var(--canvas)] px-4 py-4">
              <p className="font-semibold text-[var(--brand-ink)]">
                {overview?.practiceMinutesLast7Days ?? 0}
                {isZh ? " 分钟 / 7 天" : " min / 7d"}
              </p>
              <p className="mt-2">{text.practiceTimeHint}</p>
            </div>
            <div className="rounded-[1.4rem] bg-[var(--canvas)] px-4 py-4">
              <p className="font-semibold text-[var(--brand-ink)]">
                {overview?.studyUnits ?? 0}
                {isZh ? " 个单元" : " units"}
              </p>
              <p className="mt-2">{text.unitsHint}</p>
            </div>
            <div className="rounded-[1.4rem] bg-[var(--canvas)] px-4 py-4">
              <p className="font-semibold text-[var(--brand-ink)]">
                {overview?.activeLessons ?? 0}
                {isZh ? " 份材料" : " lessons"}
              </p>
              <p className="mt-2">{text.lessonsHint}</p>
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}
