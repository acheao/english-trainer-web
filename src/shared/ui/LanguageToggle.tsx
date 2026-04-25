import { TranslateRounded } from "@mui/icons-material";
import { useI18n, type Locale } from "../i18n/I18nProvider";

type LanguageToggleProps = {
  tone?: "light" | "dark";
};

const OPTIONS: Array<{ value: Locale; label: string }> = [
  { value: "en", label: "EN" },
  { value: "zh-CN", label: "中文" },
];

export default function LanguageToggle({ tone = "light" }: LanguageToggleProps) {
  const { locale, isZh, setLocale } = useI18n();

  const wrapperClass =
    tone === "dark"
      ? "border-white/20 bg-white/10 text-white"
      : "border-[var(--line)] bg-white/80 text-[var(--brand-ink)]";
  const iconTextClass = tone === "dark" ? "text-white/80" : "text-[var(--brand-ink-soft)]";
  const inactiveButtonClass =
    tone === "dark" ? "text-white/75 hover:text-white" : "text-slate-500 hover:text-[var(--brand-ink)]";

  return (
    <div className={`inline-flex items-center gap-3 rounded-full border px-3 py-2 backdrop-blur ${wrapperClass}`}>
      <div className={`inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] ${iconTextClass}`}>
        <TranslateRounded fontSize="small" />
        <span>{isZh ? "语言" : "Language"}</span>
      </div>
      <div className="inline-flex rounded-full bg-white/90 p-1 text-sm shadow-sm">
        {OPTIONS.map((option) => {
          const active = option.value === locale;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => setLocale(option.value)}
              className={`rounded-full px-3 py-1.5 font-semibold transition ${
                active ? "bg-[var(--brand-red)] text-white" : inactiveButtonClass
              }`}
              aria-pressed={active}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
