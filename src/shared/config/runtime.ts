const KEY = "runtime_api_base_url";

export function getApiBaseUrl(): string {
  const saved = localStorage.getItem(KEY)?.trim();
  if (saved) return trimTrailingSlash(saved);

  const envDefault = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim();
  return trimTrailingSlash(envDefault || "http://127.0.0.1:8080");
}

export function setApiBaseUrl(url: string) {
  localStorage.setItem(KEY, trimTrailingSlash(url.trim()));
}

export function clearApiBaseUrlOverride() {
  localStorage.removeItem(KEY);
}

function trimTrailingSlash(s: string) {
  return s.replace(/\/+$/, "");
}
