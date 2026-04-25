import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AuthProvider from "./features/auth/AuthProvider";
import AuthGuard from "./features/auth/AuthGuard";
import LoginPage from "./features/auth/LoginPage";
import RegisterPage from "./features/auth/RegisterPage";
import HomePage from "./features/home/HomePage";
import MaterialsPage from "./features/materials/MaterialsPage";
import PracticePage from "./features/practice/PracticePage";
import StatsPage from "./features/stats/StatsPage";
import SettingsPage from "./features/settings/SettingsPage";
import Layout from "./shared/ui/Layout";
import NoticeProvider from "./shared/ui/NoticeProvider";
import LessonDetailPage from "./features/materials/LessonDetailPage";
import I18nProvider from "./shared/i18n/I18nProvider";

export default function App() {
  return (
    <I18nProvider>
      <NoticeProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route element={<AuthGuard />}>
                <Route element={<Layout />}>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/library" element={<MaterialsPage />} />
                  <Route path="/library/:lessonId" element={<LessonDetailPage />} />
                  <Route path="/practice" element={<PracticePage />} />
                  <Route path="/practice/session/:sessionId" element={<PracticePage />} />
                  <Route path="/stats" element={<StatsPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                </Route>
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </NoticeProvider>
    </I18nProvider>
  );
}
