import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArticleRounded, AutoStoriesRounded, LinkRounded, TextFieldsRounded, VideoLibraryRounded } from "@mui/icons-material";
import { libraryApi } from "./libraryApi";
import { useNotice } from "../../shared/ui/useNotice";
import { useI18n } from "../../shared/i18n/I18nProvider";
import { getErrorMessage } from "../../shared/i18n/message";
import { getLessonStatusLabel, getSourceTypeLabel } from "../../shared/i18n/domain";
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
  const { locale, isZh, formatDateTime } = useI18n();

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

  const text = isZh
    ? {
        loadFailed: "加载材料失败。",
        importSuccess: "材料已导入，正在进入详情页。",
        importFailed: "导入失败。",
        badge: "材料库",
        title: "把 YouTube、文章和文本，变成能持续练习的个人材料库。",
        subtitle:
          "YouTube 导入会在后端抓取英文字幕和 mp3；文章链接会抽取正文；纯文本会切分成学习单元。之后这些内容都会进入你的每日计划和练习流程。",
        modeYoutube: "YouTube 视频",
        modeArticle: "文章链接",
        modeText: "纯文本",
        importYoutube: "导入 YouTube 视频",
        importYoutubeHint: "材料会先创建出来，然后后端在后台继续抓取字幕和音频。你可以先进入详情页等待处理完成。",
        importArticle: "导入文章链接",
        importText: "导入纯文本",
        titleOptional: "标题（可选）",
        articleTitlePlaceholder: "留空则使用页面标题",
        notesOptional: "备注（可选）",
        articleNotesPlaceholder: "比如：为什么想学这篇文章、想重点练哪些表达",
        textTitlePlaceholder: "例如播客文字稿 / 新闻摘录",
        textBody: "正文",
        textBodyPlaceholder: "粘贴你想长期练习的文章、字幕、播客文字稿或笔记",
        textNotesPlaceholder: "补充你的学习意图或个人标签",
        submit: "导入为新的材料",
        submitting: "导入中...",
        lessonsBadge: "已导入材料",
        lessonsTitle: "我的学习材料",
        processingCount: (count: number) => `${count} 个导入任务处理中`,
        lessonCount: (count: number) => `${count} 份材料`,
        loading: "正在加载材料库...",
        empty: "还没有任何材料。先从上面的任意一种导入方式开始。",
        units: (count: number) => `${count} 个单元`,
        minutes: (count: number) => `${count} 分钟`,
      }
    : {
        loadFailed: "Failed to load materials.",
        importSuccess: "Material imported. Opening the detail page now.",
        importFailed: "Import failed.",
        badge: "Materials",
        title: "Turn YouTube, articles, and text into a personal library you can keep practicing from.",
        subtitle:
          "YouTube imports fetch English subtitles and mp3 files on the backend. Article URLs extract readable text. Plain text is split into study units. Everything then flows into your daily plan and practice sessions.",
        modeYoutube: "YouTube Video",
        modeArticle: "Article URL",
        modeText: "Plain Text",
        importYoutube: "Import a YouTube Video",
        importYoutubeHint:
          "The lesson is created first, then the backend keeps fetching subtitles and audio in the background. You can open the detail page right away and wait there.",
        importArticle: "Import an Article URL",
        importText: "Import Plain Text",
        titleOptional: "Title (Optional)",
        articleTitlePlaceholder: "Leave empty to use the page title",
        notesOptional: "Notes (Optional)",
        articleNotesPlaceholder: "For example: why this article matters, or which expressions you want to focus on",
        textTitlePlaceholder: "For example: Podcast transcript / news excerpt",
        textBody: "Body",
        textBodyPlaceholder: "Paste the article, subtitles, transcript, or notes you want to practice over time",
        textNotesPlaceholder: "Add your learning intent or personal tags",
        submit: "Import as a New Lesson",
        submitting: "Importing...",
        lessonsBadge: "Imported Lessons",
        lessonsTitle: "My Materials",
        processingCount: (count: number) => `${count} imports processing`,
        lessonCount: (count: number) => `${count} lessons`,
        loading: "Loading your materials library...",
        empty: "No lessons yet. Start with any import mode above.",
        units: (count: number) => `${count} units`,
        minutes: (count: number) => `${count} min`,
      };

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
          pushNotice(getErrorMessage(error, text.loadFailed), "error");
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
  }, [processingCount, pushNotice, text.loadFailed]);

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

      pushNotice(text.importSuccess, "success");
      navigate(`/library/${created.id}`);
    } catch (error) {
      pushNotice(getErrorMessage(error, text.importFailed), "error");
    } finally {
      setSubmitting(false);
    }
  }

  const modeTabs = [
    { value: "youtube" as const, label: text.modeYoutube, icon: VideoLibraryRounded },
    { value: "article" as const, label: text.modeArticle, icon: ArticleRounded },
    { value: "text" as const, label: text.modeText, icon: TextFieldsRounded },
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-[var(--line)] bg-white/90 p-6 shadow-[var(--shadow)] md:p-8">
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1.1fr)_minmax(20rem,0.9fr)]">
          <div className="space-y-5">
            <span className="inline-flex rounded-full border border-[var(--line)] bg-[var(--canvas)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-[var(--brand-ink-soft)]">
              {text.badge}
            </span>
            <h1 className="text-3xl font-bold leading-tight text-[var(--brand-ink)] md:text-5xl">{text.title}</h1>
            <p className="max-w-3xl text-sm leading-7 text-slate-600 md:text-base">{text.subtitle}</p>

            <div className="flex flex-wrap gap-3">
              {modeTabs.map((item) => {
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
                  {text.importYoutube}
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
                <p className="text-sm leading-6 text-slate-500">{text.importYoutubeHint}</p>
              </div>
            ) : null}

            {mode === "article" ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-[var(--brand-ink)]">
                  <LinkRounded fontSize="small" />
                  {text.importArticle}
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
                  <span>{text.titleOptional}</span>
                  <input
                    type="text"
                    value={articleTitle}
                    onChange={(event) => setArticleTitle(event.target.value)}
                    className="app-input"
                    placeholder={text.articleTitlePlaceholder}
                  />
                </label>
                <label className="space-y-2 text-sm font-medium text-slate-700">
                  <span>{text.notesOptional}</span>
                  <textarea
                    value={articleNotes}
                    onChange={(event) => setArticleNotes(event.target.value)}
                    className="app-textarea min-h-28"
                    placeholder={text.articleNotesPlaceholder}
                  />
                </label>
              </div>
            ) : null}

            {mode === "text" ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-[var(--brand-ink)]">
                  <AutoStoriesRounded fontSize="small" />
                  {text.importText}
                </div>
                <label className="space-y-2 text-sm font-medium text-slate-700">
                  <span>{text.titleOptional}</span>
                  <input
                    type="text"
                    value={textTitle}
                    onChange={(event) => setTextTitle(event.target.value)}
                    className="app-input"
                    placeholder={text.textTitlePlaceholder}
                  />
                </label>
                <label className="space-y-2 text-sm font-medium text-slate-700">
                  <span>{text.textBody}</span>
                  <textarea
                    value={textBody}
                    onChange={(event) => setTextBody(event.target.value)}
                    className="app-textarea min-h-48"
                    placeholder={text.textBodyPlaceholder}
                    required
                  />
                </label>
                <label className="space-y-2 text-sm font-medium text-slate-700">
                  <span>{text.notesOptional}</span>
                  <textarea
                    value={textNotes}
                    onChange={(event) => setTextNotes(event.target.value)}
                    className="app-textarea min-h-24"
                    placeholder={text.textNotesPlaceholder}
                  />
                </label>
              </div>
            ) : null}

            <button type="submit" disabled={submitting} className="app-button-primary mt-5">
              {submitting ? text.submitting : text.submit}
            </button>
          </form>
        </div>
      </section>

      <section className="rounded-[2rem] border border-[var(--line)] bg-white/90 p-6 shadow-[var(--shadow)] md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--brand-ink-soft)]">{text.lessonsBadge}</p>
            <h2 className="mt-2 text-2xl font-bold text-[var(--brand-ink)]">{text.lessonsTitle}</h2>
          </div>
          <div className="rounded-full border border-[var(--line)] bg-[var(--canvas)] px-4 py-2 text-sm text-slate-600">
            {processingCount > 0 ? text.processingCount(processingCount) : text.lessonCount(lessons.length)}
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {loading ? (
            <div className="rounded-[1.5rem] border border-dashed border-[var(--line)] bg-[var(--canvas)] px-5 py-8 text-sm text-slate-600">
              {text.loading}
            </div>
          ) : lessons.length === 0 ? (
            <div className="rounded-[1.5rem] border border-dashed border-[var(--line)] bg-[var(--canvas)] px-5 py-8 text-sm leading-6 text-slate-600">
              {text.empty}
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
                        {getSourceTypeLabel(lesson.sourceType, locale)}
                      </span>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${lessonStatusClass(lesson.status)}`}>
                        {getLessonStatusLabel(lesson.status, locale)}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-[var(--brand-ink)]">{lesson.title}</h3>
                    <p className="max-w-3xl text-sm leading-6 text-slate-600">{lesson.summary}</p>
                  </div>

                  <div className="grid shrink-0 gap-2 text-sm text-slate-600 sm:grid-cols-2 lg:text-right">
                    <p>{text.units(lesson.unitCount)}</p>
                    <p>{text.minutes(lesson.estimatedMinutes)}</p>
                    <p className="sm:col-span-2">{formatDateTime(lesson.createdAt)}</p>
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
