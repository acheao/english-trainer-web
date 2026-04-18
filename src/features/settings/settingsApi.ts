import { apiFetch } from "../../shared/api/client";
import type { LlmConfig, ProviderCatalogItem } from "../../types";

export type UpsertLlmConfigRequest = {
  provider: string;
  model: string;
  displayName?: string;
  baseUrl?: string;
  apiKey?: string;
  enabled: boolean;
  isDefault: boolean;
};

export type ProviderTestResult = {
  success: boolean;
  message: string;
};

export const settingsApi = {
  listProviders: () => apiFetch<ProviderCatalogItem[]>("/api/settings/llm/providers"),
  listConfigs: () => apiFetch<LlmConfig[]>("/api/settings/llm"),
  createConfig: (payload: UpsertLlmConfigRequest) =>
    apiFetch<LlmConfig>("/api/settings/llm", { method: "POST", json: payload }),
  updateConfig: (id: string, payload: UpsertLlmConfigRequest) =>
    apiFetch<LlmConfig>(`/api/settings/llm/${id}`, { method: "PATCH", json: payload }),
  deleteConfig: (id: string) => apiFetch<boolean>(`/api/settings/llm/${id}`, { method: "DELETE" }),
  testConfig: (id: string) =>
    apiFetch<ProviderTestResult>(`/api/settings/llm/${id}/test`, { method: "POST" }),
};
