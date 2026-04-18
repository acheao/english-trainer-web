import {
  AutoStoriesRounded,
  DashboardRounded,
  EditNoteRounded,
  LogoutRounded,
  QueryStatsRounded,
  SettingsRounded,
} from "@mui/icons-material";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../features/auth/useAuth";

const NAV_ITEMS = [
  { label: "Today / 今天", detail: "Daily plan", path: "/", icon: DashboardRounded, exact: true },
  { label: "Library / 资料库", detail: "Lessons & imports", path: "/library", icon: AutoStoriesRounded },
  { label: "Stats / 统计", detail: "Signals & trends", path: "/stats", icon: QueryStatsRounded },
  { label: "Settings / 设置", detail: "Profile & models", path: "/settings", icon: SettingsRounded },
];

export default function Layout() {
  const location = useLocation();
  const { user, logout } = useAuth();

  const currentLabel =
    NAV_ITEMS.find((item) => (item.exact ? location.pathname === item.path : location.pathname.startsWith(item.path)))
      ?.label ?? "Practice / 练习";

  return (
    <div className="min-h-screen p-3 md:p-4">
      <div className="grid min-h-[calc(100vh-1.5rem)] gap-4 md:grid-cols-[18rem_minmax(0,1fr)]">
        <aside className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] p-4 shadow-[var(--shadow)] backdrop-blur md:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--brand-ink-soft)]">English Trainer</p>
              <h1 className="mt-2 text-2xl font-bold text-[var(--brand-ink)]">v2 Workspace</h1>
            </div>
            <div className="grid grid-cols-3 gap-1">
              <span className="h-2.5 w-2.5 rounded-full bg-[var(--brand-red)]/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-[var(--brand-gold)]/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
            </div>
          </div>

          <div className="mt-6 rounded-[1.5rem] bg-[var(--canvas)] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--brand-ink-soft)]">Active Learner</p>
            <p className="mt-3 text-lg font-semibold text-[var(--brand-ink)]">{user?.displayName || "English Builder"}</p>
            <p className="mt-1 text-sm text-slate-600">{user?.email}</p>
            <p className="mt-3 text-sm text-slate-600">
              Goal / 目标: <span className="font-semibold text-[var(--brand-ink)]">{user?.dailyGoalMinutes ?? 30} min</span>
            </p>
          </div>

          <nav className="mt-6 grid gap-2">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.exact}
                  className={({ isActive }) =>
                    `group rounded-[1.35rem] border px-4 py-3 transition ${
                      isActive
                        ? "border-transparent bg-[var(--brand-red)] text-white shadow-lg"
                        : "border-transparent bg-white/60 text-[var(--brand-ink)] hover:border-[var(--line)] hover:bg-white"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-11 w-11 items-center justify-center rounded-2xl ${
                          isActive ? "bg-white/16 text-white" : "bg-[var(--canvas)] text-[var(--brand-red)]"
                        }`}
                      >
                        <Icon fontSize="small" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{item.label}</p>
                        <p className={`text-xs ${isActive ? "text-white/70" : "text-slate-500"}`}>{item.detail}</p>
                      </div>
                    </div>
                  )}
                </NavLink>
              );
            })}

            <NavLink
              to={location.pathname.startsWith("/practice/") ? location.pathname : "/"}
              className={({ isActive }) =>
                `rounded-[1.35rem] border px-4 py-3 transition ${
                  isActive || location.pathname.startsWith("/practice/")
                    ? "border-transparent bg-[var(--brand-ink)] text-white shadow-lg"
                    : "border-transparent bg-white/60 text-[var(--brand-ink)] hover:border-[var(--line)] hover:bg-white"
                }`
              }
            >
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--canvas)] text-[var(--brand-red)]">
                  <EditNoteRounded fontSize="small" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Practice / 练习</p>
                  <p className="text-xs text-slate-500">Session in progress</p>
                </div>
              </div>
            </NavLink>
          </nav>

          <button
            type="button"
            onClick={logout}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full border border-[var(--line)] bg-white px-4 py-3 text-sm font-semibold text-[var(--brand-ink)] transition hover:-translate-y-0.5"
          >
            <LogoutRounded fontSize="small" />
            退出登录 / Sign Out
          </button>
        </aside>

        <main className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] shadow-[var(--shadow)] backdrop-blur">
          <header className="flex flex-col gap-4 border-b border-[var(--line)] px-5 py-5 md:flex-row md:items-center md:justify-between md:px-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--brand-ink-soft)]">
                Current Surface
              </p>
              <h2 className="mt-2 text-2xl font-bold text-[var(--brand-ink)]">{currentLabel}</h2>
            </div>
            <div className="rounded-full border border-[var(--line)] bg-white px-4 py-2 text-sm text-slate-600">
              {user?.hasLlmConfig ? "模型已配置 / Model ready" : "请先配置模型 / Add a model config"}
            </div>
          </header>

          <div className="p-4 md:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
