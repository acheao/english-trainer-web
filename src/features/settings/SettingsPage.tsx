import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { authApi } from "../auth/authApi";
import { useAuth } from "../auth/useAuth";
import { clearApiBaseUrlOverride, getApiBaseUrl, setApiBaseUrl } from "../../shared/config/runtime";
import { useNotice } from "../../shared/ui/useNotice";
import { settingsApi, type UpsertLlmConfigRequest } from "./settingsApi";
import { useI18n } from "../../shared/i18n/I18nProvider";
import { getErrorMessage } from "../../shared/i18n/message";
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
  const { isZh } = useI18n();

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

  const text = isZh
    ? {
        loadFailed: "加载设置失败。",
        profileSaved: "学习资料和每日目标已更新。",
        profileSaveFailed: "保存个人设置失败。",
        invalidUrl: "后端地址必须以 http:// 或 https:// 开头。",
        connectionSaved: "后端地址已保存。",
        connectionReset: "已恢复默认后端地址。",
        missingModelFields: "请先选择服务商并填写模型名称。",
        configUpdated: "模型配置已更新。",
        configCreated: "模型配置已创建。",
        configSaveFailed: "保存模型配置失败。",
        configDeleted: "模型配置已删除。",
        configDeleteFailed: "删除模型配置失败。",
        configTestSuccess: "连接测试成功。",
        configTestWarning: "连接测试返回了警告。",
        configTestFailed: "测试模型配置失败。",
        configPatchFailed: "更新模型配置失败。",
        onboardingTitle: "欢迎来到英语训练平台。",
        onboardingBody:
          "先完成两步就能开始使用：设置你的学习目标，然后连接至少一个常用大模型接口。完成后就可以导入材料并开始今天的训练。",
        pageBadge: "设置",
        pageTitle: "配置你的学习工作台",
        pageBody: "这里集中管理你的学习节奏、后端连接地址，以及用于生成题目和批改答案的模型配置。",
        noConfigs: "还没有模型配置",
        configCount: (count: number) => `${count} 个模型配置`,
        ready: "系统已经具备出题和批改能力。",
        notReady: "先连上模型，系统才能真正开始为你生成训练。",
        profileBadge: "学习目标",
        profileTitle: "学习目标",
        displayName: "显示名称",
        displayNamePlaceholder: "例如 Lin / Acheao",
        dailyGoal: "每日练习时长（分钟）",
        targetScore: "目标分数（可选，例如 IELTS）",
        targetScorePlaceholder: "例如 7.0",
        saveProfile: "保存学习目标",
        saving: "保存中...",
        connectionBadge: "后端地址",
        connectionTitle: "后端地址",
        connectionHint: "这个地址只保存在当前浏览器里，适合本地联调、自托管部署和切换不同环境。",
        saveConnection: "保存地址",
        resetConnection: "恢复默认",
        apiBaseUrl: "后端接口地址",
        llmBadge: "模型配置",
        editConfig: "编辑模型配置",
        newConfig: "新增模型配置",
        loadingConfigs: "正在加载模型配置...",
        provider: "服务商",
        model: "模型名称",
        modelPlaceholder: "例如 gpt-4.1-mini / deepseek-chat / qwen-plus",
        configDisplayName: "显示名称",
        configDisplayNamePlaceholder: "例如 主力批改模型",
        baseUrl: "接口地址",
        baseUrlPlaceholder: "系统会自动填入默认地址",
        apiKey: "接口密钥",
        apiKeyEdit: "接口密钥（留空则保留原值）",
        apiKeyPlaceholder: "sk-...",
        apiKeyEditPlaceholder: "不修改可留空",
        enabled: "启用此配置",
        defaultModel: "设为默认模型",
        updateConfig: "更新模型配置",
        createConfig: "创建模型配置",
        cancelEdit: "取消编辑",
        clearForm: "清空表单",
        savedModels: "已保存的模型",
        loading: "正在加载...",
        emptyConfigs: "还没有任何模型配置。先添加一个默认模型，系统才能开始生成每日练习和批改答案。",
        defaultBadge: "默认",
        disabledBadge: "已禁用",
        edit: "编辑",
        testConnection: "测试连接",
        setDefault: "设为默认",
        disable: "禁用",
        enable: "启用",
        delete: "删除",
        configCountPlain: (count: number) => `${count} 个配置`,
      }
    : {
        loadFailed: "Failed to load settings.",
        profileSaved: "Learning goals and profile settings were updated.",
        profileSaveFailed: "Failed to save profile settings.",
        invalidUrl: "The backend URL must start with http:// or https://.",
        connectionSaved: "Backend URL saved.",
        connectionReset: "Reset to the default backend URL.",
        missingModelFields: "Please choose a provider and fill in the model first.",
        configUpdated: "Model configuration updated.",
        configCreated: "Model configuration created.",
        configSaveFailed: "Failed to save the model configuration.",
        configDeleted: "Model configuration deleted.",
        configDeleteFailed: "Failed to delete the model configuration.",
        configTestSuccess: "Connection test passed.",
        configTestWarning: "Connection test returned a warning.",
        configTestFailed: "Failed to test the model configuration.",
        configPatchFailed: "Failed to update the model configuration.",
        onboardingTitle: "Welcome to English Trainer.",
        onboardingBody:
          "Finish two steps to get started: set your learning goals, then connect at least one common LLM API. After that you can import materials and begin today's session.",
        pageBadge: "Settings",
        pageTitle: "Configure Your Learning Workspace",
        pageBody: "Manage your learning rhythm, backend connection, and the models used to generate tasks and grade answers from one place.",
        noConfigs: "No model config yet",
        configCount: (count: number) => `${count} model configs`,
        ready: "The system is ready to generate tasks and grade answers.",
        notReady: "Connect a model first so the system can start building practice for you.",
        profileBadge: "Profile",
        profileTitle: "Learning Goals",
        displayName: "Display Name",
        displayNamePlaceholder: "For example, Lin / Acheao",
        dailyGoal: "Daily Practice Minutes",
        targetScore: "Target Score (Optional, for example IELTS)",
        targetScorePlaceholder: "For example, 7.0",
        saveProfile: "Save Learning Goals",
        saving: "Saving...",
        connectionBadge: "Connection",
        connectionTitle: "Backend URL",
        connectionHint: "This address is stored only in the current browser, which works well for local development, self-hosted deployments, and switching environments.",
        saveConnection: "Save URL",
        resetConnection: "Reset Default",
        apiBaseUrl: "API Base URL",
        llmBadge: "LLM Setup",
        editConfig: "Edit Model Config",
        newConfig: "New Model Config",
        loadingConfigs: "Loading model configurations...",
        provider: "Provider",
        model: "Model",
        modelPlaceholder: "For example, gpt-4.1-mini / deepseek-chat / qwen-plus",
        configDisplayName: "Display Name",
        configDisplayNamePlaceholder: "For example, Primary Grading Model",
        baseUrl: "Base URL",
        baseUrlPlaceholder: "The provider default URL will be filled in automatically",
        apiKey: "API Key",
        apiKeyEdit: "API Key (Leave empty to keep the current value)",
        apiKeyPlaceholder: "sk-...",
        apiKeyEditPlaceholder: "Leave empty to keep the current key",
        enabled: "Enable this config",
        defaultModel: "Set as default model",
        updateConfig: "Update Model Config",
        createConfig: "Create Model Config",
        cancelEdit: "Cancel Editing",
        clearForm: "Clear Form",
        savedModels: "Saved Models",
        loading: "Loading...",
        emptyConfigs: "No model configurations yet. Add a default model first so the system can generate daily practice and grade answers.",
        defaultBadge: "Default",
        disabledBadge: "Disabled",
        edit: "Edit",
        testConnection: "Test Connection",
        setDefault: "Set Default",
        disable: "Disable",
        enable: "Enable",
        delete: "Delete",
        configCountPlain: (count: number) => `${count} configs`,
      };

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
        const [providerData, configData] = await Promise.all([settingsApi.listProviders(), settingsApi.listConfigs()]);
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
          pushNotice(getErrorMessage(error, text.loadFailed), "error");
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
  }, [pushNotice, text.loadFailed]);

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
      displayName: current.displayName && current.displayName !== current.model ? current.displayName : "",
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
        targetIeltsScore: profileForm.targetIeltsScore.trim() ? Number(profileForm.targetIeltsScore) : undefined,
      });
      await refreshProfile();
      pushNotice(text.profileSaved, "success");
    } catch (error) {
      pushNotice(getErrorMessage(error, text.profileSaveFailed), "error");
    } finally {
      setProfileSaving(false);
    }
  }

  function handleSaveConnection() {
    const trimmed = url.trim();
    if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
      pushNotice(text.invalidUrl, "warning");
      return;
    }

    setConnectionSaving(true);
    try {
      setApiBaseUrl(trimmed);
      pushNotice(text.connectionSaved, "success");
    } finally {
      setConnectionSaving(false);
    }
  }

  function handleResetConnection() {
    clearApiBaseUrlOverride();
    setUrl(getApiBaseUrl());
    pushNotice(text.connectionReset, "success");
  }

  async function handleSubmitLlm(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!llmForm.provider || !llmForm.model.trim()) {
      pushNotice(text.missingModelFields, "warning");
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
        pushNotice(text.configUpdated, "success");
      } else {
        await settingsApi.createConfig(payload);
        pushNotice(text.configCreated, "success");
      }
      await reloadConfigs();
      await refreshProfile();
      resetLlmForm();
    } catch (error) {
      pushNotice(getErrorMessage(error, text.configSaveFailed), "error");
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
      pushNotice(text.configDeleted, "success");
    } catch (error) {
      pushNotice(getErrorMessage(error, text.configDeleteFailed), "error");
    } finally {
      setBusyConfigId(null);
    }
  }

  async function handleTestConfig(configId: string) {
    setBusyConfigId(configId);
    try {
      const result = await settingsApi.testConfig(configId);
      pushNotice(result.message || (result.success ? text.configTestSuccess : text.configTestWarning), result.success ? "success" : "warning");
    } catch (error) {
      pushNotice(getErrorMessage(error, text.configTestFailed), "error");
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
      pushNotice(getErrorMessage(error, text.configPatchFailed), "error");
    } finally {
      setBusyConfigId(null);
    }
  }

  return (
    <div className="space-y-6">
      {onboarding ? (
        <section className="rounded-[1.8rem] border border-emerald-200 bg-emerald-50 px-5 py-5 text-sm text-emerald-900 shadow-sm">
          <p className="font-semibold">{text.onboardingTitle}</p>
          <p className="mt-2 leading-6">{text.onboardingBody}</p>
        </section>
      ) : null}

      <section className="rounded-[2rem] border border-[var(--line)] bg-white/90 p-6 shadow-[var(--shadow)] md:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--brand-ink-soft)]">{text.pageBadge}</p>
            <h1 className="text-3xl font-bold text-[var(--brand-ink)] md:text-4xl">{text.pageTitle}</h1>
            <p className="max-w-3xl text-sm leading-7 text-slate-600 md:text-base">{text.pageBody}</p>
          </div>
          <div className="rounded-[1.5rem] bg-[var(--canvas)] px-5 py-4 text-sm text-slate-700">
            <p className="font-semibold text-[var(--brand-ink)]">{configs.length > 0 ? text.configCount(configs.length) : text.noConfigs}</p>
            <p className="mt-2">{user?.hasLlmConfig ? text.ready : text.notReady}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <article className="rounded-[2rem] border border-[var(--line)] bg-white/90 p-6 shadow-[var(--shadow)]">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--brand-ink-soft)]">{text.profileBadge}</p>
            <h2 className="text-2xl font-bold text-[var(--brand-ink)]">{text.profileTitle}</h2>
          </div>

          <div className="mt-6 space-y-4">
            <label className="space-y-2 text-sm font-medium text-slate-700">
              <span>{text.displayName}</span>
              <input
                type="text"
                value={profileForm.displayName}
                onChange={(event) => updateProfileField("displayName", event.target.value)}
                className="app-input"
                placeholder={text.displayNamePlaceholder}
              />
            </label>

            <label className="space-y-2 text-sm font-medium text-slate-700">
              <span>{text.dailyGoal}</span>
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
              <span>{text.targetScore}</span>
              <input
                type="number"
                min={0}
                max={9}
                step="0.5"
                value={profileForm.targetIeltsScore}
                onChange={(event) => updateProfileField("targetIeltsScore", event.target.value)}
                className="app-input"
                placeholder={text.targetScorePlaceholder}
              />
            </label>

            <button type="button" onClick={handleSaveProfile} disabled={profileSaving} className="app-button-primary">
              {profileSaving ? text.saving : text.saveProfile}
            </button>
          </div>
        </article>

        <article className="rounded-[2rem] border border-[var(--line)] bg-white/90 p-6 shadow-[var(--shadow)]">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--brand-ink-soft)]">{text.connectionBadge}</p>
            <h2 className="text-2xl font-bold text-[var(--brand-ink)]">{text.connectionTitle}</h2>
          </div>

          <div className="mt-6 space-y-4">
            <label className="space-y-2 text-sm font-medium text-slate-700">
              <span>{text.apiBaseUrl}</span>
              <input
                type="text"
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                className="app-input"
                placeholder="http://192.168.1.9:8080"
              />
            </label>

            <p className="text-sm leading-6 text-slate-500">{text.connectionHint}</p>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleSaveConnection}
                disabled={connectionSaving}
                className="app-button-primary !w-auto px-6"
              >
                {connectionSaving ? text.saving : text.saveConnection}
              </button>
              <button
                type="button"
                onClick={handleResetConnection}
                className="rounded-full border border-[var(--line)] bg-white px-5 py-3 text-sm font-semibold text-[var(--brand-ink)]"
              >
                {text.resetConnection}
              </button>
            </div>
          </div>
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
        <article className="rounded-[2rem] border border-[var(--line)] bg-white/90 p-6 shadow-[var(--shadow)]">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--brand-ink-soft)]">{text.llmBadge}</p>
            <h2 className="text-2xl font-bold text-[var(--brand-ink)]">{editingConfigId ? text.editConfig : text.newConfig}</h2>
          </div>

          {loading ? (
            <div className="mt-6 rounded-[1.5rem] bg-[var(--canvas)] px-5 py-8 text-sm text-slate-600">{text.loadingConfigs}</div>
          ) : (
            <form onSubmit={handleSubmitLlm} className="mt-6 space-y-4">
              <label className="space-y-2 text-sm font-medium text-slate-700">
                <span>{text.provider}</span>
                <select value={llmForm.provider} onChange={(event) => applyProvider(event.target.value)} className="app-select">
                  {providers.map((provider) => (
                    <option key={provider.key} value={provider.key}>
                      {provider.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-2 text-sm font-medium text-slate-700">
                <span>{text.model}</span>
                <input
                  type="text"
                  value={llmForm.model}
                  onChange={(event) => updateLlmField("model", event.target.value)}
                  className="app-input"
                  placeholder={text.modelPlaceholder}
                />
              </label>

              <label className="space-y-2 text-sm font-medium text-slate-700">
                <span>{text.configDisplayName}</span>
                <input
                  type="text"
                  value={llmForm.displayName}
                  onChange={(event) => updateLlmField("displayName", event.target.value)}
                  className="app-input"
                  placeholder={text.configDisplayNamePlaceholder}
                />
              </label>

              <label className="space-y-2 text-sm font-medium text-slate-700">
                <span>{text.baseUrl}</span>
                <input
                  type="text"
                  value={llmForm.baseUrl}
                  onChange={(event) => updateLlmField("baseUrl", event.target.value)}
                  className="app-input"
                  placeholder={text.baseUrlPlaceholder}
                />
              </label>

              <label className="space-y-2 text-sm font-medium text-slate-700">
                <span>{editingConfigId ? text.apiKeyEdit : text.apiKey}</span>
                <input
                  type="password"
                  value={llmForm.apiKey}
                  onChange={(event) => updateLlmField("apiKey", event.target.value)}
                  className="app-input"
                  placeholder={editingConfigId ? text.apiKeyEditPlaceholder : text.apiKeyPlaceholder}
                />
              </label>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="flex items-center gap-3 rounded-[1.2rem] bg-[var(--canvas)] px-4 py-3 text-sm font-medium text-[var(--brand-ink)]">
                  <input
                    type="checkbox"
                    checked={llmForm.enabled}
                    onChange={(event) => updateLlmField("enabled", event.target.checked)}
                  />
                  {text.enabled}
                </label>
                <label className="flex items-center gap-3 rounded-[1.2rem] bg-[var(--canvas)] px-4 py-3 text-sm font-medium text-[var(--brand-ink)]">
                  <input
                    type="checkbox"
                    checked={llmForm.isDefault}
                    onChange={(event) => updateLlmField("isDefault", event.target.checked)}
                  />
                  {text.defaultModel}
                </label>
              </div>

              <div className="flex flex-wrap gap-3">
                <button type="submit" disabled={llmSaving} className="app-button-primary !w-auto px-6">
                  {llmSaving ? text.saving : editingConfigId ? text.updateConfig : text.createConfig}
                </button>
                <button
                  type="button"
                  onClick={() => resetLlmForm()}
                  className="rounded-full border border-[var(--line)] bg-white px-5 py-3 text-sm font-semibold text-[var(--brand-ink)]"
                >
                  {editingConfigId ? text.cancelEdit : text.clearForm}
                </button>
              </div>
            </form>
          )}
        </article>

        <article className="rounded-[2rem] border border-[var(--line)] bg-white/90 p-6 shadow-[var(--shadow)]">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--brand-ink-soft)]">{text.savedModels}</p>
              <h2 className="text-2xl font-bold text-[var(--brand-ink)]">{text.savedModels}</h2>
            </div>
            <div className="rounded-full bg-[var(--canvas)] px-4 py-2 text-sm text-slate-600">{text.configCountPlain(configs.length)}</div>
          </div>

          <div className="mt-6 space-y-4">
            {loading ? (
              <div className="rounded-[1.5rem] bg-[var(--canvas)] px-5 py-8 text-sm text-slate-600">{text.loading}</div>
            ) : configs.length === 0 ? (
              <div className="rounded-[1.5rem] border border-dashed border-[var(--line)] bg-[var(--canvas)] px-5 py-8 text-sm leading-6 text-slate-600">
                {text.emptyConfigs}
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
                            {text.defaultBadge}
                          </span>
                        ) : null}
                        {!config.enabled ? (
                          <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-700">
                            {text.disabledBadge}
                          </span>
                        ) : null}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-[var(--brand-ink)]">{config.displayName}</h3>
                        <p className="mt-1 text-sm text-slate-600">{config.model}</p>
                      </div>
                      <div className="space-y-1 text-sm text-slate-500">
                        <p>{config.baseUrl}</p>
                        <p>{isZh ? "接口密钥" : "API Key"}: {config.apiKeyPreview}</p>
                      </div>
                    </div>

                    <div className="grid gap-2 sm:grid-cols-2 lg:w-[18rem]">
                      <button
                        type="button"
                        onClick={() => handleEditConfig(config)}
                        className="rounded-full border border-[var(--line)] bg-white px-4 py-2 text-sm font-semibold text-[var(--brand-ink)]"
                      >
                        {text.edit}
                      </button>
                      <button
                        type="button"
                        disabled={busyConfigId === config.id}
                        onClick={() => handleTestConfig(config.id)}
                        className="rounded-full border border-[var(--line)] bg-white px-4 py-2 text-sm font-semibold text-[var(--brand-ink)]"
                      >
                        {text.testConnection}
                      </button>
                      <button
                        type="button"
                        disabled={busyConfigId === config.id || config.isDefault}
                        onClick={() => void handlePatchExisting(config, { isDefault: true, enabled: true })}
                        className="rounded-full border border-[var(--line)] bg-white px-4 py-2 text-sm font-semibold text-[var(--brand-ink)] disabled:opacity-50"
                      >
                        {text.setDefault}
                      </button>
                      <button
                        type="button"
                        disabled={busyConfigId === config.id}
                        onClick={() => void handlePatchExisting(config, { enabled: !config.enabled })}
                        className="rounded-full border border-[var(--line)] bg-white px-4 py-2 text-sm font-semibold text-[var(--brand-ink)]"
                      >
                        {config.enabled ? text.disable : text.enable}
                      </button>
                      <button
                        type="button"
                        disabled={busyConfigId === config.id}
                        onClick={() => handleDeleteConfig(config.id)}
                        className="sm:col-span-2 rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700"
                      >
                        {text.delete}
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
