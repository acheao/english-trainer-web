import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { authApi } from "../auth/authApi";
import { useAuth } from "../auth/useAuth";
import { clearApiBaseUrlOverride, getApiBaseUrl, setApiBaseUrl } from "../../shared/config/runtime";
import { useNotice } from "../../shared/ui/useNotice";
import { settingsApi, type UpsertLlmConfigRequest } from "./settingsApi";
import type { LlmConfig, ProviderCatalogItem } from "../../types";

type ProfileForm = {
  displayName: string;
  dailyGoalMinutes: string;
  targetIeltsScore: string;
};

type LlmForm = {
  provider: string;
  model: string;
  displayName: string;
  baseUrl: string;
  apiKey: string;
  enabled: boolean;
  isDefault: boolean;
};

function buildEmptyLlmForm(providers: ProviderCatalogItem[]): LlmForm {
  const firstProvider = providers[0];
  return {
    provider: firstProvider?.key ?? "",
    model: "",
    displayName: "",
    baseUrl: firstProvider?.defaultBaseUrl ?? "",
    apiKey: "",
    enabled: true,
    isDefault: providers.length > 0,
  };
}

export default function SettingsPage() {
  const [searchParams] = useSearchParams();
  const onboarding = searchParams.get("onboarding") === "1";
  const { user, refreshProfile } = useAuth();
  const { pushNotice } = useNotice();

  const [url, setUrl] = useState("");
  const [providers, setProviders] = useState<ProviderCatalogItem[]>([]);
  const [configs, setConfigs] = useState<LlmConfig[]>([]);
  const [editingConfigId, setEditingConfigId] = useState<string | null>(null);
  const [profileSaving, setProfileSaving] = useState(false);
  const [connectionSaving, setConnectionSaving] = useState(false);
  const [llmSaving, setLlmSaving] = useState(false);
  const [busyConfigId, setBusyConfigId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileForm, setProfileForm] = useState<ProfileForm>({
    displayName: "",
    dailyGoalMinutes: "30",
    targetIeltsScore: "",
  });
  const [llmForm, setLlmForm] = useState<LlmForm>(buildEmptyLlmForm([]));

  useEffect(() => {
    setUrl(getApiBaseUrl());
  }, []);

  useEffect(() => {
    setProfileForm({
      displayName: user?.displayName ?? "",
      dailyGoalMinutes: String(user?.dailyGoalMinutes ?? 30),
      targetIeltsScore: user?.targetIeltsScore != null ? String(user.targetIeltsScore) : "",
    });
  }, [user]);

  useEffect(() => {
    let cancelled = false;

    async function loadSettings() {
      try {
        const [providerData, configData] = await Promise.all([
          settingsApi.listProviders(),
          settingsApi.listConfigs(),
        ]);
        if (cancelled) {
          return;
        }
        setProviders(providerData);
        setConfigs(configData);
        setLlmForm((current) => {
          if (current.provider) {
            return current;
          }
          return buildEmptyLlmForm(providerData);
        });
      } catch (error) {
        if (!cancelled) {
          const message = error instanceof Error ? error.message : "Failed to load settings";
          pushNotice(`加载设置失败：${message}`, "error");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadSettings();
    return () => {
      cancelled = true;
    };
  }, [pushNotice]);

  function updateProfileField<K extends keyof ProfileForm>(key: K, value: ProfileForm[K]) {
    setProfileForm((current) => ({ ...current, [key]: value }));
  }

  function updateLlmField<K extends keyof LlmForm>(key: K, value: LlmForm[K]) {
    setLlmForm((current) => ({ ...current, [key]: value }));
  }

  function resetLlmForm(providerList = providers) {
    setEditingConfigId(null);
    setLlmForm(buildEmptyLlmForm(providerList));
  }

  function applyProvider(providerKey: string) {
    const provider = providers.find((item) => item.key === providerKey);
    setLlmForm((current) => ({
      ...current,
      provider: providerKey,
      baseUrl: provider?.defaultBaseUrl ?? current.baseUrl,
      displayName:
        current.displayName && current.displayName !== current.model ? current.displayName : "",
    }));
  }

  async function reloadConfigs() {
    const data = await settingsApi.listConfigs();
    setConfigs(data);
  }

  async function handleSaveProfile() {
    setProfileSaving(true);
    try {
      await authApi.updateProfile({
        displayName: profileForm.displayName.trim() || undefined,
        dailyGoalMinutes: Math.max(15, Number(profileForm.dailyGoalMinutes) || 30),
        targetIeltsScore: profileForm.targetIeltsScore.trim()
          ? Number(profileForm.targetIeltsScore)
          : undefined,
      });
      await refreshProfile();
      pushNotice("学习资料和每日目标已更新。", "success");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to save profile";
      pushNotice(`保存个人设置失败：${message}`, "error");
    } finally {
      setProfileSaving(false);
    }
  }

  function handleSaveConnection() {
    const trimmed = url.trim();
    if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
      pushNotice("后端地址必须以 http:// 或 https:// 开头。", "warning");
      return;
    }

    setConnectionSaving(true);
    try {
      setApiBaseUrl(trimmed);
      pushNotice("后端地址已保存。", "success");
    } finally {
      setConnectionSaving(false);
    }
  }

  function handleResetConnection() {
    clearApiBaseUrlOverride();
    setUrl(getApiBaseUrl());
    pushNotice("已恢复默认后端地址。", "success");
  }

  async function handleSubmitLlm(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!llmForm.provider || !llmForm.model.trim()) {
      pushNotice("请先选择 provider 并填写 model。", "warning");
      return;
    }

    const payload: UpsertLlmConfigRequest = {
      provider: llmForm.provider,
      model: llmForm.model.trim(),
      displayName: llmForm.displayName.trim() || undefined,
      baseUrl: llmForm.baseUrl.trim() || undefined,
      apiKey: llmForm.apiKey.trim() || undefined,
      enabled: llmForm.enabled,
      isDefault: llmForm.isDefault,
    };

    setLlmSaving(true);
    try {
      if (editingConfigId) {
        await settingsApi.updateConfig(editingConfigId, payload);
        pushNotice("模型配置已更新。", "success");
      } else {
        await settingsApi.createConfig(payload);
        pushNotice("模型配置已创建。", "success");
      }
      await reloadConfigs();
      await refreshProfile();
      resetLlmForm();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to save LLM config";
      pushNotice(`保存模型配置失败：${message}`, "error");
    } finally {
      setLlmSaving(false);
    }
  }

  function handleEditConfig(config: LlmConfig) {
    setEditingConfigId(config.id);
    setLlmForm({
      provider: config.provider,
      model: config.model,
      displayName: config.displayName,
      baseUrl: config.baseUrl,
      apiKey: "",
      enabled: config.enabled,
      isDefault: config.isDefault,
    });
  }

  async function handleDeleteConfig(configId: string) {
    setBusyConfigId(configId);
    try {
      await settingsApi.deleteConfig(configId);
      await reloadConfigs();
      await refreshProfile();
      if (editingConfigId === configId) {
        resetLlmForm();
      }
      pushNotice("模型配置已删除。", "success");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete config";
      pushNotice(`删除模型配置失败：${message}`, "error");
    } finally {
      setBusyConfigId(null);
    }
  }

  async function handleTestConfig(configId: string) {
    setBusyConfigId(configId);
    try {
      const result = await settingsApi.testConfig(configId);
      pushNotice(result.message || "连接测试成功。", result.success ? "success" : "warning");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to test config";
      pushNotice(`测试模型配置失败：${message}`, "error");
    } finally {
      setBusyConfigId(null);
    }
  }

  async function handlePatchExisting(config: LlmConfig, patch: Partial<UpsertLlmConfigRequest>) {
    setBusyConfigId(config.id);
    try {
      await settingsApi.updateConfig(config.id, {
        provider: config.provider,
        model: config.model,
        displayName: config.displayName,
        baseUrl: config.baseUrl,
        apiKey: undefined,
        enabled: config.enabled,
        isDefault: config.isDefault,
        ...patch,
      });
      await reloadConfigs();
      await refreshProfile();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update config";
      pushNotice(`更新模型配置失败：${message}`, "error");
    } finally {
      setBusyConfigId(null);
    }
  }

  return (
    <div className="space-y-6">
      {onboarding ? (
        <section className="rounded-[1.8rem] border border-emerald-200 bg-emerald-50 px-5 py-5 text-sm text-emerald-900 shadow-sm">
          <p className="font-semibold">欢迎来到 English Trainer。</p>
          <p className="mt-2 leading-6">
            先完成两步就能开始使用：设置你的学习目标，然后连接至少一个常用大模型 API。完成后就可以导入材料并开始今天的训练。
          </p>
        </section>
      ) : null}

      <section className="rounded-[2rem] border border-[var(--line)] bg-white/90 p-6 shadow-[var(--shadow)] md:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--brand-ink-soft)]">Settings</p>
            <h1 className="text-3xl font-bold text-[var(--brand-ink)] md:text-4xl">配置你的学习工作台</h1>
            <p className="max-w-3xl text-sm leading-7 text-slate-600 md:text-base">
              这里集中管理你的学习节奏、后端连接地址，以及用于生成题目和批改答案的模型配置。
            </p>
          </div>
          <div className="rounded-[1.5rem] bg-[var(--canvas)] px-5 py-4 text-sm text-slate-700">
            <p className="font-semibold text-[var(--brand-ink)]">
              {configs.length > 0 ? `${configs.length} 个模型配置` : "还没有模型配置"}
            </p>
            <p className="mt-2">
              {user?.hasLlmConfig ? "系统已经具备出题和批改能力。" : "先连上模型，系统才能真正开始为你生成训练。"}
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <article className="rounded-[2rem] border border-[var(--line)] bg-white/90 p-6 shadow-[var(--shadow)]">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--brand-ink-soft)]">Profile</p>
            <h2 className="text-2xl font-bold text-[var(--brand-ink)]">学习目标</h2>
          </div>

          <div className="mt-6 space-y-4">
            <label className="space-y-2 text-sm font-medium text-slate-700">
              <span>显示名称</span>
              <input
                type="text"
                value={profileForm.displayName}
                onChange={(event) => updateProfileField("displayName", event.target.value)}
                className="app-input"
                placeholder="例如 Lin / Acheao"
              />
            </label>

            <label className="space-y-2 text-sm font-medium text-slate-700">
              <span>每日练习时长（分钟）</span>
              <input
                type="number"
                min={15}
                max={120}
                value={profileForm.dailyGoalMinutes}
                onChange={(event) => updateProfileField("dailyGoalMinutes", event.target.value)}
                className="app-input"
              />
            </label>

            <label className="space-y-2 text-sm font-medium text-slate-700">
              <span>目标分数（可选，例如 IELTS）</span>
              <input
                type="number"
                min={0}
                max={9}
                step="0.5"
                value={profileForm.targetIeltsScore}
                onChange={(event) => updateProfileField("targetIeltsScore", event.target.value)}
                className="app-input"
                placeholder="例如 7.0"
              />
            </label>

            <button type="button" onClick={handleSaveProfile} disabled={profileSaving} className="app-button-primary">
              {profileSaving ? "保存中..." : "保存学习目标"}
            </button>
          </div>
        </article>

        <article className="rounded-[2rem] border border-[var(--line)] bg-white/90 p-6 shadow-[var(--shadow)]">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--brand-ink-soft)]">Connection</p>
            <h2 className="text-2xl font-bold text-[var(--brand-ink)]">后端地址</h2>
          </div>

          <div className="mt-6 space-y-4">
            <label className="space-y-2 text-sm font-medium text-slate-700">
              <span>API Base URL</span>
              <input
                type="text"
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                className="app-input"
                placeholder="http://192.168.1.9:8080"
              />
            </label>

            <p className="text-sm leading-6 text-slate-500">
              这个地址只保存在当前浏览器里，适合本地联调、自托管部署和切换不同环境。
            </p>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleSaveConnection}
                disabled={connectionSaving}
                className="app-button-primary !w-auto px-6"
              >
                {connectionSaving ? "保存中..." : "保存地址"}
              </button>
              <button
                type="button"
                onClick={handleResetConnection}
                className="rounded-full border border-[var(--line)] bg-white px-5 py-3 text-sm font-semibold text-[var(--brand-ink)]"
              >
                恢复默认
              </button>
            </div>
          </div>
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
        <article className="rounded-[2rem] border border-[var(--line)] bg-white/90 p-6 shadow-[var(--shadow)]">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--brand-ink-soft)]">LLM Setup</p>
            <h2 className="text-2xl font-bold text-[var(--brand-ink)]">
              {editingConfigId ? "编辑模型配置" : "新增模型配置"}
            </h2>
          </div>

          {loading ? (
            <div className="mt-6 rounded-[1.5rem] bg-[var(--canvas)] px-5 py-8 text-sm text-slate-600">正在加载模型配置...</div>
          ) : (
            <form onSubmit={handleSubmitLlm} className="mt-6 space-y-4">
              <label className="space-y-2 text-sm font-medium text-slate-700">
                <span>Provider</span>
                <select
                  value={llmForm.provider}
                  onChange={(event) => applyProvider(event.target.value)}
                  className="app-select"
                >
                  {providers.map((provider) => (
                    <option key={provider.key} value={provider.key}>
                      {provider.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-2 text-sm font-medium text-slate-700">
                <span>Model</span>
                <input
                  type="text"
                  value={llmForm.model}
                  onChange={(event) => updateLlmField("model", event.target.value)}
                  className="app-input"
                  placeholder="例如 gpt-4.1-mini / deepseek-chat / qwen-plus"
                />
              </label>

              <label className="space-y-2 text-sm font-medium text-slate-700">
                <span>显示名称</span>
                <input
                  type="text"
                  value={llmForm.displayName}
                  onChange={(event) => updateLlmField("displayName", event.target.value)}
                  className="app-input"
                  placeholder="例如 主力批改模型"
                />
              </label>

              <label className="space-y-2 text-sm font-medium text-slate-700">
                <span>Base URL</span>
                <input
                  type="text"
                  value={llmForm.baseUrl}
                  onChange={(event) => updateLlmField("baseUrl", event.target.value)}
                  className="app-input"
                  placeholder="Provider 默认地址会自动填入"
                />
              </label>

              <label className="space-y-2 text-sm font-medium text-slate-700">
                <span>{editingConfigId ? "API Key（留空则保留原值）" : "API Key"}</span>
                <input
                  type="password"
                  value={llmForm.apiKey}
                  onChange={(event) => updateLlmField("apiKey", event.target.value)}
                  className="app-input"
                  placeholder={editingConfigId ? "不修改可留空" : "sk-..."}
                />
              </label>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="flex items-center gap-3 rounded-[1.2rem] bg-[var(--canvas)] px-4 py-3 text-sm font-medium text-[var(--brand-ink)]">
                  <input
                    type="checkbox"
                    checked={llmForm.enabled}
                    onChange={(event) => updateLlmField("enabled", event.target.checked)}
                  />
                  启用此配置
                </label>
                <label className="flex items-center gap-3 rounded-[1.2rem] bg-[var(--canvas)] px-4 py-3 text-sm font-medium text-[var(--brand-ink)]">
                  <input
                    type="checkbox"
                    checked={llmForm.isDefault}
                    onChange={(event) => updateLlmField("isDefault", event.target.checked)}
                  />
                  设为默认模型
                </label>
              </div>

              <div className="flex flex-wrap gap-3">
                <button type="submit" disabled={llmSaving} className="app-button-primary !w-auto px-6">
                  {llmSaving ? "保存中..." : editingConfigId ? "更新模型配置" : "创建模型配置"}
                </button>
                <button
                  type="button"
                  onClick={() => resetLlmForm()}
                  className="rounded-full border border-[var(--line)] bg-white px-5 py-3 text-sm font-semibold text-[var(--brand-ink)]"
                >
                  {editingConfigId ? "取消编辑" : "清空表单"}
                </button>
              </div>
            </form>
          )}
        </article>

        <article className="rounded-[2rem] border border-[var(--line)] bg-white/90 p-6 shadow-[var(--shadow)]">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--brand-ink-soft)]">Configured Models</p>
              <h2 className="text-2xl font-bold text-[var(--brand-ink)]">已保存的模型</h2>
            </div>
            <div className="rounded-full bg-[var(--canvas)] px-4 py-2 text-sm text-slate-600">
              {configs.length} 个配置
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {loading ? (
              <div className="rounded-[1.5rem] bg-[var(--canvas)] px-5 py-8 text-sm text-slate-600">正在加载...</div>
            ) : configs.length === 0 ? (
              <div className="rounded-[1.5rem] border border-dashed border-[var(--line)] bg-[var(--canvas)] px-5 py-8 text-sm leading-6 text-slate-600">
                还没有任何模型配置。先添加一个默认模型，系统才能开始生成每日练习和批改答案。
              </div>
            ) : (
              configs.map((config) => (
                <article key={config.id} className="rounded-[1.5rem] border border-[var(--line)] bg-[var(--surface-strong)] p-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-[var(--canvas)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand-ink-soft)]">
                          {config.provider}
                        </span>
                        {config.isDefault ? (
                          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
                            默认
                          </span>
                        ) : null}
                        {!config.enabled ? (
                          <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-700">
                            已禁用
                          </span>
                        ) : null}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-[var(--brand-ink)]">{config.displayName}</h3>
                        <p className="mt-1 text-sm text-slate-600">{config.model}</p>
                      </div>
                      <div className="space-y-1 text-sm text-slate-500">
                        <p>{config.baseUrl}</p>
                        <p>API Key: {config.apiKeyPreview}</p>
                      </div>
                    </div>

                    <div className="grid gap-2 sm:grid-cols-2 lg:w-[18rem]">
                      <button
                        type="button"
                        onClick={() => handleEditConfig(config)}
                        className="rounded-full border border-[var(--line)] bg-white px-4 py-2 text-sm font-semibold text-[var(--brand-ink)]"
                      >
                        编辑
                      </button>
                      <button
                        type="button"
                        disabled={busyConfigId === config.id}
                        onClick={() => handleTestConfig(config.id)}
                        className="rounded-full border border-[var(--line)] bg-white px-4 py-2 text-sm font-semibold text-[var(--brand-ink)]"
                      >
                        测试连接
                      </button>
                      <button
                        type="button"
                        disabled={busyConfigId === config.id || config.isDefault}
                        onClick={() => void handlePatchExisting(config, { isDefault: true, enabled: true })}
                        className="rounded-full border border-[var(--line)] bg-white px-4 py-2 text-sm font-semibold text-[var(--brand-ink)] disabled:opacity-50"
                      >
                        设为默认
                      </button>
                      <button
                        type="button"
                        disabled={busyConfigId === config.id}
                        onClick={() => void handlePatchExisting(config, { enabled: !config.enabled })}
                        className="rounded-full border border-[var(--line)] bg-white px-4 py-2 text-sm font-semibold text-[var(--brand-ink)]"
                      >
                        {config.enabled ? "禁用" : "启用"}
                      </button>
                      <button
                        type="button"
                        disabled={busyConfigId === config.id}
                        onClick={() => handleDeleteConfig(config.id)}
                        className="sm:col-span-2 rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700"
                      >
                        删除
                      </button>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </article>
      </section>
    </div>
  );
}
