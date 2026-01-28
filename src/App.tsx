import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./shared/ui/Layout";
import HomePage from "./features/home/HomePage";
import SettingsPage from "./features/settings/SettingsPage";
import PingPage from "./features/health/PingPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/ping" element={<PingPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}