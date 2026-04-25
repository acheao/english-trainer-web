import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { authApi } from "./authApi";
import { useAuth } from "./useAuth";
import { useNotice } from "../../shared/ui/useNotice";
import { useI18n } from "../../shared/i18n/I18nProvider";
import { getErrorMessage } from "../../shared/i18n/message";
import LanguageToggle from "../../shared/ui/LanguageToggle";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { pushNotice } = useNotice();
  const { isAuthenticated, isLoading, login } = useAuth();
  const { isZh } = useI18n();

  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!isLoading && isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const text = isZh
    ? {
        passwordMismatch: "两次输入的密码不一致。",
        registerSuccess: "注册成功，先完成初始化配置。",
        registerFailed: "注册失败。",
        badge: "个性化练习",
        heroTitle: "建立一套只属于你的英语材料库，然后让系统每天替你选最该练的内容。",
        heroBody:
          "注册后你可以连接常见大模型接口，导入 YouTube、文章和文本材料，再把它们变成持续进化的日常训练。",
        welcome: "创建账号",
        title: "注册",
        subtitle: "创建账号后，下一步会引导你配置模型和学习目标。",
        email: "邮箱",
        displayName: "显示名称",
        displayNamePlaceholder: "例如 Lin",
        password: "密码",
        passwordPlaceholder: "至少 6 位",
        confirmPassword: "确认密码",
        confirmPasswordPlaceholder: "再次输入密码",
        submit: "注册并开始",
        submitting: "创建中...",
        hasAccount: "已经有账号？",
        signIn: "去登录",
      }
    : {
        passwordMismatch: "The two passwords do not match.",
        registerSuccess: "Account created. Let's finish the initial setup first.",
        registerFailed: "Registration failed.",
        badge: "Personalized Practice",
        heroTitle: "Build a materials library that belongs to you, then let the system choose what matters most every day.",
        heroBody:
          "After registering, you can connect popular LLM APIs, import YouTube videos, articles, and text, then turn them into a practice routine that keeps evolving.",
        welcome: "Create Account",
        title: "Sign Up",
        subtitle: "After you create an account, we will guide you through model setup and learning goals.",
        email: "Email",
        displayName: "Display Name",
        displayNamePlaceholder: "For example, Lin",
        password: "Password",
        passwordPlaceholder: "At least 6 characters",
        confirmPassword: "Confirm Password",
        confirmPasswordPlaceholder: "Enter the password again",
        submit: "Create Account",
        submitting: "Creating...",
        hasAccount: "Already have an account?",
        signIn: "Sign In",
      };

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (password !== confirmPassword) {
      pushNotice(text.passwordMismatch, "warning");
      return;
    }

    setSubmitting(true);
    try {
      const response = await authApi.register({
        email: email.trim(),
        password,
        displayName: displayName.trim() || undefined,
      });
      login(response);
      pushNotice(text.registerSuccess, "success");
      navigate("/settings?onboarding=1", { replace: true });
    } catch (error) {
      pushNotice(getErrorMessage(error, text.registerFailed), "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="app-auth-shell">
      <div className="app-auth-panel">
        <div className="space-y-8">
          <div className="flex justify-end">
            <LanguageToggle tone="dark" />
          </div>
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-white/80">
              {text.badge}
            </div>
            <h1 className="max-w-lg text-4xl font-bold leading-tight text-white md:text-5xl">{text.heroTitle}</h1>
            <p className="max-w-xl text-sm leading-7 text-slate-200 md:text-base">{text.heroBody}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="app-auth-card">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--brand-ink-soft)]">{text.welcome}</p>
            <h2 className="text-2xl font-bold text-[var(--brand-ink)]">{text.title}</h2>
            <p className="text-sm text-slate-600">{text.subtitle}</p>
          </div>

          <label className="space-y-2 text-sm font-medium text-slate-700">
            <span>{text.email}</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="app-input"
              placeholder="you@example.com"
              required
            />
          </label>

          <label className="space-y-2 text-sm font-medium text-slate-700">
            <span>{text.displayName}</span>
            <input
              type="text"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              className="app-input"
              placeholder={text.displayNamePlaceholder}
            />
          </label>

          <label className="space-y-2 text-sm font-medium text-slate-700">
            <span>{text.password}</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="app-input"
              placeholder={text.passwordPlaceholder}
              required
            />
          </label>

          <label className="space-y-2 text-sm font-medium text-slate-700">
            <span>{text.confirmPassword}</span>
            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className="app-input"
              placeholder={text.confirmPasswordPlaceholder}
              required
            />
          </label>

          <button type="submit" disabled={submitting} className="app-button-primary">
            {submitting ? text.submitting : text.submit}
          </button>

          <p className="text-sm text-slate-600">
            {text.hasAccount}{" "}
            <Link to="/login" className="font-semibold text-[var(--brand-red)]">
              {text.signIn}
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
