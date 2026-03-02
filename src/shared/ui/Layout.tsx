import {
  AutoStories as AutoStoriesIcon,
  EditNote as EditNoteIcon,
  Home as HomeIcon,
  Logout as LogoutIcon,
  QueryStats as QueryStatsIcon,
  Settings as SettingsIcon,
} from "@mui/icons-material";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../features/auth/AuthContext";

const NAV_ITEMS = [
  { text: "Home", path: "/", icon: <HomeIcon fontSize="small" />, exact: true },
  { text: "Practice", path: "/practice", icon: <EditNoteIcon fontSize="small" /> },
  { text: "Materials", path: "/materials", icon: <AutoStoriesIcon fontSize="small" /> },
  { text: "Statistics", path: "/stats", icon: <QueryStatsIcon fontSize="small" /> },
];

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  return (
    <div className="min-h-screen bg-[#f7f7f8] font-sans text-gray-900">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-64 flex flex-col pt-8 pb-6 border-r border-gray-200 bg-[#f7f7f8]">
        {/* Logo / Header */}
        <div className="px-6 mb-8 flex items-center gap-2 text-gray-400">
          {/* Simple mock window controls */}
          <div className="w-3 h-3 rounded-full bg-gray-300"></div>
          <div className="w-3 h-3 rounded-full bg-gray-300"></div>
          <div className="w-3 h-3 rounded-full bg-gray-300"></div>
        </div>

        <div className="px-6 mb-6">
          <h1 className="text-xl font-bold tracking-tight">English Trainer</h1>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 px-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const active = item.exact
              ? location.pathname === item.path
              : location.pathname.startsWith(item.path);

            return (
              <button
                key={item.text}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${active
                    ? "bg-gray-200 text-gray-900"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
              >
                <span className={`${active ? "text-gray-800" : "text-gray-500"}`}>
                  {item.icon}
                </span>
                {item.text}
              </button>
            );
          })}
        </nav>

        {/* Bottom Navigation */}
        <div className="px-4 mt-auto pt-6 border-t border-gray-200 border-dashed space-y-1">
          <button
            onClick={() => navigate("/settings")}
            className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${location.pathname.startsWith("/settings")
                ? "bg-gray-200 text-gray-900"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
          >
            <span className="text-gray-500">
              <SettingsIcon fontSize="small" />
            </span>
            Settings
          </button>

          <button
            onClick={() => logout()}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors text-red-600 hover:bg-red-50"
          >
            <span className="text-red-500">
              <LogoutIcon fontSize="small" />
            </span>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 h-screen p-2 overflow-hidden">
        <div className="h-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="h-full overflow-y-auto p-10">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
