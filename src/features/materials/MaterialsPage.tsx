import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArticleRounded, AutoStoriesRounded, LinkRounded, TextFieldsRounded, VideoLibraryRounded } from "@mui/icons-material";
import { libraryApi } from "./libraryApi";
import { useNotice } from "../../shared/ui/useNotice";
import type { LessonSummary } from "../../types";

type ImportMode = "youtube" | "article" | "text";

function lessonStatusClass(status: string) {
  switch (status) {
    case "READY":
      return "bg-emerald-50 text-emerald-700";
    case "FAILED":
      return "bg-rose-50 text-rose-700";
    default:
      return "bg-amber-50 text-amber-700";
  }
}

export default function MaterialsPage() {
  const navigate = useNavigate();
  const { pushNotice } = useNotice();

  const [mode, setMode] = useState<ImportMode>("youtube");
  const [lessons, setLessons] = useState<LessonSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [articleUrl, setArticleUrl] = useState("");
  const [articleTitle, setArticleTitle] = useState("");
  const [articleNotes, setArticleNotes] = useState("");
  const [textTitle, setTextTitle] = useState("");
  const [textNotes, setTextNotes] = useState("");
  const [textBody, setTextBody] = useState("");

  const processingCount = lessons.filter((lesson) => lesson.status === "PROCESSING").length;

  useEffect(() => {
    let cancelled = false;

    async function loadLessons() {
      try {
        const data = await libraryApi.listLessons();
        if (!cancelled) {
          setLessons(data);
          setLoading(false);
        }
      } catch (error) {
        if (!cancelled) {
          const message = error instanceof Error ? error.message : "Failed to load lessons";
          pushNotice(`加载材料失败：${message}`, "error");
          setLoading(false);
        }
      }
    }

    void loadLessons();

    const interval = window.setInterval(() => {
      if (processingCount > 0) {
        void loadLessons();
      }
    }, 5000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [processingCount, pushNotice]);

  async function handleImport(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    try {
      const created =
        mode === "youtube"
          ? await libraryApi.importYoutube({ url: youtubeUrl.trim() })
          : mode === "article"
            ? await libraryApi.importArticle({
                url: articleUrl.trim(),
                title: articleTitle.trim() || undefined,
                notes: articleNotes.trim() || undefined,
              })
            : await libraryApi.importText({
                title: textTitle.trim() || undefined,
                notes: textNotes.trim() || undefined,
                text: textBody,
              });

      pushNotice("材料已导入，正在进入详情页。", "success");
      navigate(`/library/${created.id}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Import failed";
      pushNotice(`导入失败：${message}`, "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-[var(--line)] bg-white/90 p-6 shadow-[var(--shadow)] md:p-8">
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1.1fr)_minmax(20rem,0.9fr)]">
          <div className="space-y-5">
            <span className="inline-flex rounded-full border border-[var(--line)] bg-[var(--canvas)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-[var(--brand-ink-soft)]">
              Materials
            </span>
            <h1 className="text-3xl font-bold leading-tight text-[var(--brand-ink)] md:text-5xl">
              把 YouTube、文章和文本，变成能持续练习的个人材料库。
            </h1>
            <p className="max-w-3xl text-sm leading-7 text-slate-600 md:text-base">
              YouTube 导入会在后端抓取英文字幕和 mp3；文章 URL 会抽取正文；纯文本会切分成 study units。之后这些内容都会进入你的 daily plan 和练习 session。
            </p>

            <div className="flex flex-wrap gap-3">
              {([
                { value: "youtube", label: "YouTube", icon: VideoLibraryRounded },
                { value: "article", label: "Article URL", icon: ArticleRounded },
                { value: "text", label: "Plain Text", icon: TextFieldsRounded },
              ] as const).map((item) => {
                const Icon = item.icon;
                const active = item.value === mode;
                return (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setMode(item.value)}
                    className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                      active ? "bg-[var(--brand-red)] text-white shadow-lg" : "bg-[var(--canvas)] text-[var(--brand-ink)]"
                    }`}
                  >
                    <Icon fontSize="small" />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          <form onSubmit={handleImport} className="rounded-[1.75rem] border border-[var(--line)] bg-[var(--surface-strong)] p-5">
            {mode === "youtube" ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-[var(--brand-ink)]">
                  <VideoLibraryRounded fontSize="small" />
                  导入 YouTube 视频
                </div>
                <label className="space-y-2 text-sm font-medium text-slate-700">
                  <span>YouTube URL</span>
                  <input
                    type="url"
                    value={youtubeUrl}
                    onChange={(event) => setYoutubeUrl(event.target.value)}
                    className="app-input"
                    placeholder="https://www.youtube.com/watch?v=..."
                    required
                  />
                </label>
                <p className="text-sm leading-6 text-slate-500">
                  lesson 会先创建出来，然后后端在后台继续抓取字幕和音频。你可以先进入详情页等待处理完成。
                </p>
              </div>
            ) : null}

            {mode === "article" ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-[var(--brand-ink)]">
                  <LinkRounded fontSize="small" />
                  导入文章 URL
                </div>
                <label className="space-y-2 text-sm font-medium text-slate-700">
                  <span>Article URL</span>
                  <input
                    type="url"
                    value={articleUrl}
                    onChange={(event) => setArticleUrl(event.target.value)}
                    className="app-input"
                    placeholder="https://example.com/article"
                    required
                  />
                </label>
                <label className="space-y-2 text-sm font-medium text-slate-700">
                  <span>标题（可选）</span>
                  <input
                    type="text"
                    value={articleTitle}
                    onChange={(event) => setArticleTitle(event.target.value)}
                    className="app-input"
                    placeholder="留空则使用页面标题"
                  />
                </label>
                <label className="space-y-2 text-sm font-medium text-slate-700">
                  <span>备注（可选）</span>
                  <textarea
                    value={articleNotes}
                    onChange={(event) => setArticleNotes(event.target.value)}
                    className="app-textarea min-h-28"
                    placeholder="比如：为什么想学这篇文章、想重点练哪些表达"
                  />
                </label>
              </div>
            ) : null}

            {mode === "text" ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-[var(--brand-ink)]">
                  <AutoStoriesRounded fontSize="small" />
                  导入纯文本
                </div>
                <label className="space-y-2 text-sm font-medium text-slate-700">
                  <span>标题（可选）</span>
                  <input
                    type="text"
                    value={textTitle}
                    onChange={(event) => setTextTitle(event.target.value)}
                    className="app-input"
                    placeholder="例如 Podcast transcript / 新闻摘录"
                  />
                </label>
                <label className="space-y-2 text-sm font-medium text-slate-700">
                  <span>正文</span>
                  <textarea
                    value={textBody}
                    onChange={(event) => setTextBody(event.target.value)}
                    className="app-textarea min-h-48"
                    placeholder="粘贴你想长期练习的文章、字幕、播客文字稿或笔记"
                    required
                  />
                </label>
                <label className="space-y-2 text-sm font-medium text-slate-700">
                  <span>备注（可选）</span>
                  <textarea
                    value={textNotes}
                    onChange={(event) => setTextNotes(event.target.value)}
                    className="app-textarea min-h-24"
                    placeholder="补充你的学习意图或个人标签"
                  />
                </label>
              </div>
            ) : null}

            <button type="submit" disabled={submitting} className="app-button-primary mt-5">
              {submitting ? "导入中..." : "导入为新的 lesson"}
            </button>
          </form>
        </div>
      </section>

      <section className="rounded-[2rem] border border-[var(--line)] bg-white/90 p-6 shadow-[var(--shadow)] md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--brand-ink-soft)]">Imported Lessons</p>
            <h2 className="mt-2 text-2xl font-bold text-[var(--brand-ink)]">我的学习材料</h2>
          </div>
          <div className="rounded-full border border-[var(--line)] bg-[var(--canvas)] px-4 py-2 text-sm text-slate-600">
            {processingCount > 0 ? `${processingCount} 个导入任务处理中` : `${lessons.length} 个 lesson`}
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {loading ? (
            <div className="rounded-[1.5rem] border border-dashed border-[var(--line)] bg-[var(--canvas)] px-5 py-8 text-sm text-slate-600">
              正在加载材料库...
            </div>
          ) : lessons.length === 0 ? (
            <div className="rounded-[1.5rem] border border-dashed border-[var(--line)] bg-[var(--canvas)] px-5 py-8 text-sm leading-6 text-slate-600">
              还没有任何 lesson。先从上面的任意一种导入方式开始。
            </div>
          ) : (
            lessons.map((lesson) => (
              <Link
                key={lesson.id}
                to={`/library/${lesson.id}`}
                className="block rounded-[1.5rem] border border-[var(--line)] bg-[var(--surface-strong)] px-5 py-5 transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-[var(--canvas)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand-ink-soft)]">
                        {lesson.sourceType}
                      </span>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${lessonStatusClass(lesson.status)}`}>
                        {lesson.status}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-[var(--brand-ink)]">{lesson.title}</h3>
                    <p className="max-w-3xl text-sm leading-6 text-slate-600">{lesson.summary}</p>
                  </div>

                  <div className="grid shrink-0 gap-2 text-sm text-slate-600 sm:grid-cols-2 lg:text-right">
                    <p>{lesson.unitCount} units</p>
                    <p>{lesson.estimatedMinutes} min</p>
                    <p className="sm:col-span-2">{new Date(lesson.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
