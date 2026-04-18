import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { authApi } from "./authApi";
import { useAuth } from "./useAuth";
import { useNotice } from "../../shared/ui/useNotice";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { pushNotice } = useNotice();
  const { isAuthenticated, isLoading, login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!isLoading && isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const destination = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? "/";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    try {
      const response = await authApi.login({ email: email.trim(), password });
      login(response);
      pushNotice("登录成功，继续今天的训练。", "success");
      navigate(destination, { replace: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Login failed";
      pushNotice(`登录失败：${message}`, "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="app-auth-shell">
      <div className="app-auth-panel">
        <div className="space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-white/80">
            English Trainer
          </div>
          <h1 className="max-w-lg text-4xl font-bold leading-tight text-white md:text-5xl">
            把你真正感兴趣的英语材料，变成每天都能推进一点的训练。
          </h1>
          <p className="max-w-xl text-sm leading-7 text-slate-200 md:text-base">
            登录后继续你的材料库、每日计划和练习记录。系统会围绕你最近的错误和学习节奏调整下一轮题目。
          </p>
        </div>

        <form onSubmit={handleSubmit} className="app-auth-card">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--brand-ink-soft)]">Welcome Back</p>
            <h2 className="text-2xl font-bold text-[var(--brand-ink)]">登录</h2>
            <p className="text-sm text-slate-600">用邮箱继续你的学习工作台。</p>
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
            <span>密码</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="app-input"
              placeholder="输入你的密码"
              required
            />
          </label>

          <button type="submit" disabled={submitting} className="app-button-primary">
            {submitting ? "登录中..." : "登录"}
          </button>

          <p className="text-sm text-slate-600">
            还没有账号？{" "}
            <Link to="/register" className="font-semibold text-[var(--brand-red)]">
              去注册
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
