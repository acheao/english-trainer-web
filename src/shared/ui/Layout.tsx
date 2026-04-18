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
  { label: "Today", detail: "今天该练什么", path: "/", icon: DashboardRounded, exact: true },
  { label: "Materials", detail: "导入与管理材料", path: "/library", icon: AutoStoriesRounded },
  { label: "Practice", detail: "进入训练 session", path: "/practice", icon: EditNoteRounded },
  { label: "Stats", detail: "错误与进展趋势", path: "/stats", icon: QueryStatsRounded },
  { label: "Settings", detail: "目标、模型和连接", path: "/settings", icon: SettingsRounded },
];

export default function Layout() {
  const location = useLocation();
  const { user, logout } = useAuth();

  const currentItem = NAV_ITEMS.find((item) =>
    item.exact ? location.pathname === item.path : location.pathname.startsWith(item.path)
  );

  return (
    <div className="min-h-screen p-3 md:p-4">
      <div className="grid min-h-[calc(100vh-1.5rem)] gap-4 md:grid-cols-[18rem_minmax(0,1fr)]">
        <aside className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] p-4 shadow-[var(--shadow)] backdrop-blur md:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--brand-ink-soft)]">English Trainer</p>
              <h1 className="mt-2 text-2xl font-bold text-[var(--brand-ink)]">Adaptive Workspace</h1>
            </div>
            <div className="grid grid-cols-3 gap-1">
              <span className="h-2.5 w-2.5 rounded-full bg-[var(--brand-red)]/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-[var(--brand-gold)]/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
            </div>
          </div>

          <div className="mt-6 rounded-[1.5rem] bg-[var(--canvas)] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--brand-ink-soft)]">Learner</p>
            <p className="mt-3 text-lg font-semibold text-[var(--brand-ink)]">{user?.displayName || "English Builder"}</p>
            <p className="mt-1 text-sm text-slate-600">{user?.email}</p>
            <p className="mt-3 text-sm text-slate-600">
              Daily Goal: <span className="font-semibold text-[var(--brand-ink)]">{user?.dailyGoalMinutes ?? 30} min</span>
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
          </nav>

          <button
            type="button"
            onClick={logout}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full border border-[var(--line)] bg-white px-4 py-3 text-sm font-semibold text-[var(--brand-ink)] transition hover:-translate-y-0.5"
          >
            <LogoutRounded fontSize="small" />
            Sign Out
          </button>
        </aside>

        <main className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] shadow-[var(--shadow)] backdrop-blur">
          <header className="flex flex-col gap-4 border-b border-[var(--line)] px-5 py-5 md:flex-row md:items-center md:justify-between md:px-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--brand-ink-soft)]">Current Surface</p>
              <h2 className="mt-2 text-2xl font-bold text-[var(--brand-ink)]">{currentItem?.label ?? "Workspace"}</h2>
              <p className="mt-1 text-sm text-slate-500">{currentItem?.detail ?? "持续围绕你的材料进行训练"}</p>
            </div>
            <div className="rounded-full border border-[var(--line)] bg-white px-4 py-2 text-sm text-slate-600">
              {user?.hasLlmConfig ? "模型已就绪" : "请先在 Settings 配置模型"}
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
