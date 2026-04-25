import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { authApi } from "./authApi";
import { useAuth } from "./useAuth";
import { useNotice } from "../../shared/ui/useNotice";
import { useI18n } from "../../shared/i18n/I18nProvider";
import { getErrorMessage } from "../../shared/i18n/message";
import LanguageToggle from "../../shared/ui/LanguageToggle";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { pushNotice } = useNotice();
  const { isAuthenticated, isLoading, login } = useAuth();
  const { isZh } = useI18n();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!isLoading && isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const destination = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? "/";

  const text = isZh
    ? {
        success: "登录成功，继续今天的训练。",
        loginFailed: "登录失败。",
        badge: "English Trainer",
        heroTitle: "把你真正感兴趣的英语材料，变成每天都能推进一点的训练。",
        heroBody:
          "登录后继续你的材料库、每日计划和练习记录。系统会围绕你最近的错误和学习节奏调整下一轮题目。",
        welcome: "欢迎回来",
        title: "登录",
        subtitle: "用邮箱继续你的学习工作台。",
        email: "邮箱",
        password: "密码",
        passwordPlaceholder: "输入你的密码",
        submit: "登录",
        submitting: "登录中...",
        noAccount: "还没有账号？",
        register: "去注册",
      }
    : {
        success: "Signed in successfully. Let's continue today's practice.",
        loginFailed: "Login failed.",
        badge: "English Trainer",
        heroTitle: "Turn the English materials you truly care about into practice you can keep moving forward every day.",
        heroBody:
          "Sign in to continue your materials library, daily plan, and practice history. The system will adapt the next round based on your recent errors and learning rhythm.",
        welcome: "Welcome Back",
        title: "Sign In",
        subtitle: "Use your email to continue your learning workspace.",
        email: "Email",
        password: "Password",
        passwordPlaceholder: "Enter your password",
        submit: "Sign In",
        submitting: "Signing In...",
        noAccount: "No account yet?",
        register: "Create one",
      };

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    try {
      const response = await authApi.login({ email: email.trim(), password });
      login(response);
      pushNotice(text.success, "success");
      navigate(destination, { replace: true });
    } catch (error) {
      pushNotice(getErrorMessage(error, text.loginFailed), "error");
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

          <button type="submit" disabled={submitting} className="app-button-primary">
            {submitting ? text.submitting : text.submit}
          </button>

          <p className="text-sm text-slate-600">
            {text.noAccount}{" "}
            <Link to="/register" className="font-semibold text-[var(--brand-red)]">
              {text.register}
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
