import { getApiBaseUrl } from "../config/runtime";
import { ApiError } from "./errors";

type JsonValue = any;

function buildApiErrorMessage(status: number, statusText: string, bodyText: string): string {
  try {
    const parsed = JSON.parse(bodyText) as { message?: unknown };
    if (typeof parsed.message === "string" && parsed.message.trim()) {
      return parsed.message.trim();
    }
  } catch {
    // Keep fallback below.
  }

  if (bodyText.trim()) {
    return bodyText.trim();
  }

  return `http ${status} ${statusText}`;
}

export async function apiFetch<T = JsonValue>(
  path: string,
  options: RequestInit & { json?: unknown } = {}
): Promise<T> {
  const base = getApiBaseUrl();
  const p = path.startsWith("/") ? path : `/${path}`;
  const url = `${base}${p}`;

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> | undefined)
  };

  const token = localStorage.getItem("token");
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  let body = options.body;

  if (options.json !== undefined) {
    headers["content-type"] = "application/json";
    body = JSON.stringify(options.json);
  }

  const resp = await fetch(url, { ...options, headers, body });

  const text = await resp.text();

  if (!resp.ok) {
    throw new ApiError(resp.status, buildApiErrorMessage(resp.status, resp.statusText, text), text);
  }

  // 尝试解析 json；否则返回 text
  const contentType = resp.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return JSON.parse(text) as T;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    return text as unknown as T;
  }
}
