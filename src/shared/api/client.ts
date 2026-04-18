import { getApiBaseUrl } from "../config/runtime";
import { ApiError } from "./errors";

type JsonValue = unknown;
type ApiEnvelope<T> = {
  code: number;
  message: string;
  data: T;
};

function buildApiErrorMessage(status: number, statusText: string, bodyText: string): string {
  try {
    const parsed = JSON.parse(bodyText) as { message?: unknown; code?: unknown };
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

export function buildApiUrl(path: string): string {
  const base = getApiBaseUrl();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalizedPath}`;
}

export async function apiFetch<T = JsonValue>(
  path: string,
  options: RequestInit & { json?: unknown } = {}
): Promise<T> {
  const url = buildApiUrl(path);

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
    return unwrapEnvelope<T>(JSON.parse(text));
  }

  try {
    return unwrapEnvelope<T>(JSON.parse(text));
  } catch {
    return text as unknown as T;
  }
}

export async function apiFetchBlob(path: string): Promise<Blob> {
  const url = buildApiUrl(path);
  const headers: Record<string, string> = {};
  const token = localStorage.getItem("token");
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const resp = await fetch(url, { headers });
  if (!resp.ok) {
    const text = await resp.text();
    throw new ApiError(resp.status, buildApiErrorMessage(resp.status, resp.statusText, text), text);
  }
  return resp.blob();
}

function unwrapEnvelope<T>(value: unknown): T {
  if (
    value &&
    typeof value === "object" &&
    "code" in value &&
    "message" in value &&
    "data" in value
  ) {
    const envelope = value as ApiEnvelope<T>;
    if (envelope.code !== 0) {
      throw new ApiError(400, envelope.message || "Request failed", JSON.stringify(value));
    }
    return envelope.data;
  }

  return value as T;
}
