import { AutoStories as AutoStoriesIcon, EditNote as EditNoteIcon, QueryStats as QueryStatsIcon, Settings as SettingsIcon } from "@mui/icons-material";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";

interface AppCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  path: string;
  iconColorClass: string;
  iconBgClass: string;
}

export default function HomePage() {
  const navigate = useNavigate();

  const apps: AppCardProps[] = [
    {
      title: "Practice",
      description: "Start a new training session",
      icon: <EditNoteIcon fontSize="large" />,
      path: "/practice",
      iconColorClass: "text-blue-600",
      iconBgClass: "bg-blue-50",
    },
    {
      title: "Materials",
      description: "Manage your vocabulary and sentences",
      icon: <AutoStoriesIcon fontSize="large" />,
      path: "/materials",
      iconColorClass: "text-purple-600",
      iconBgClass: "bg-purple-50",
    },
    {
      title: "Statistics",
      description: "View your progress and error analysis",
      icon: <QueryStatsIcon fontSize="large" />,
      path: "/stats",
      iconColorClass: "text-green-600",
      iconBgClass: "bg-green-50",
    },
    {
      title: "Settings",
      description: "Configure LLM and application preferences",
      icon: <SettingsIcon fontSize="large" />,
      path: "/settings",
      iconColorClass: "text-orange-500",
      iconBgClass: "bg-orange-50",
    },
  ];

  return (
    <div className="max-w-5xl mx-auto py-8">
      {/* Header Section */}
      <div className="mb-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">English Trainer</h1>
        <p className="text-gray-500 text-lg">Your personal workspace for mastering English.</p>
      </div>

      {/* Today Section */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-6">Today</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {apps.map((app) => (
            <button
              key={app.title}
              onClick={() => navigate(app.path)}
              className="group flex flex-col text-left bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200"
            >
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 ${app.iconBgClass} ${app.iconColorClass}`}>
                {app.icon}
              </div>

              <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                {app.title}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                {app.description}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}