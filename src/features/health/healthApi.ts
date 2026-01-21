import { apiFetch } from "../../shared/api/client";

export function pingBackend() {
  return apiFetch<unknown>("/api/ping", { method: "GET" });
}
