import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./shared/ui/Layout";
import MaterialsPage from "./features/materials/MaterialsPage";
import PracticePage from "./features/practice/PracticePage";
import StatsPage from "./features/stats/StatsPage";
import SettingsPage from "./features/settings/SettingsPage";
import PingPage from "./features/health/PingPage";
import LoginPage from "./features/auth/LoginPage";
import HomePage from "./features/home/HomePage";
import { AuthProvider } from "./features/auth/AuthContext";
import AuthGuard from "./features/auth/AuthGuard";
import { SnackbarProvider } from "./shared/ui/SnackbarProvider";

export default function App() {
  return (
    <AuthProvider>
      <SnackbarProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route element={<AuthGuard />}>
              <Route element={<Layout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/practice" element={<PracticePage />} />
                <Route path="/materials" element={<MaterialsPage />} />
                <Route path="/stats" element={<StatsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/ping" element={<PingPage />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </SnackbarProvider>
    </AuthProvider>
  );
}