import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { authApi } from "./authApi";
import { useAuth } from "./useAuth";
import { useNotice } from "../../shared/ui/useNotice";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { pushNotice } = useNotice();
  const { isAuthenticated, isLoading, login } = useAuth();

  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!isLoading && isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (password !== confirmPassword) {
      pushNotice("两次输入的密码不一致。", "warning");
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
      pushNotice("注册成功，先完成初始化配置。", "success");
      navigate("/settings?onboarding=1", { replace: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Register failed";
      pushNotice(`注册失败：${message}`, "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="app-auth-shell">
      <div className="app-auth-panel">
        <div className="space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-white/80">
            Personalized Practice
          </div>
          <h1 className="max-w-lg text-4xl font-bold leading-tight text-white md:text-5xl">
            建立一套只属于你的英语材料库，然后让系统每天替你选最该练的内容。
          </h1>
          <p className="max-w-xl text-sm leading-7 text-slate-200 md:text-base">
            注册后你可以连接常见大模型 API，导入 YouTube、文章和文本材料，再把它们变成持续进化的日常训练。
          </p>
        </div>

        <form onSubmit={handleSubmit} className="app-auth-card">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--brand-ink-soft)]">Create Account</p>
            <h2 className="text-2xl font-bold text-[var(--brand-ink)]">注册</h2>
            <p className="text-sm text-slate-600">创建账号后，下一步会引导你配置模型和学习目标。</p>
          </div>

          <label className="space-y-2 text-sm font-medium text-slate-700">
            <span>邮箱</span>
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
            <span>显示名称</span>
            <input
              type="text"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              className="app-input"
              placeholder="例如 Lin"
            />
          </label>

          <label className="space-y-2 text-sm font-medium text-slate-700">
            <span>密码</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="app-input"
              placeholder="至少 6 位"
              required
            />
          </label>

          <label className="space-y-2 text-sm font-medium text-slate-700">
            <span>确认密码</span>
            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className="app-input"
              placeholder="再次输入密码"
              required
            />
          </label>

          <button type="submit" disabled={submitting} className="app-button-primary">
            {submitting ? "创建中..." : "注册并开始"}
          </button>

          <p className="text-sm text-slate-600">
            已经有账号？{" "}
            <Link to="/login" className="font-semibold text-[var(--brand-red)]">
              去登录
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
