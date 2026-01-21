import { getApiBaseUrl } from "../config/runtime";
import { ApiError } from "./errors";

type JsonValue = any;

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

  let body = options.body;

  if (options.json !== undefined) {
    headers["content-type"] = "application/json";
    body = JSON.stringify(options.json);
  }

  const resp = await fetch(url, { ...options, headers, body });

  const text = await resp.text();

  if (!resp.ok) {
    throw new ApiError(resp.status, `http ${resp.status} ${resp.statusText}`, text);
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
