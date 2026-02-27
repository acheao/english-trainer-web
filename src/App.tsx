import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./shared/ui/Layout";
import MaterialsPage from "./features/materials/MaterialsPage";
import PracticePage from "./features/practice/PracticePage";
import StatsPage from "./features/stats/StatsPage";
import SettingsPage from "./features/settings/SettingsPage";
import PingPage from "./features/health/PingPage";
import { SnackbarProvider } from "./shared/ui/SnackbarProvider";

export default function App() {
  return (
    <SnackbarProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Navigate to="/practice" replace />} />
            <Route path="/practice" element={<PracticePage />} />
            <Route path="/materials" element={<MaterialsPage />} />
            <Route path="/stats" element={<StatsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/ping" element={<PingPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </SnackbarProvider>
  );
}