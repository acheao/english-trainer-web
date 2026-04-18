import { useCallback, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { NoticeContext, type NoticeTone } from "./noticeContext";

type NoticeItem = {
  id: number;
  message: string;
  tone: NoticeTone;
};

const NOTICE_STYLES: Record<NoticeTone, string> = {
  info: "border-sky-300/70 bg-sky-50 text-sky-900",
  success: "border-emerald-300/70 bg-emerald-50 text-emerald-900",
  warning: "border-amber-300/70 bg-amber-50 text-amber-900",
  error: "border-rose-300/70 bg-rose-50 text-rose-900",
};

export default function NoticeProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<NoticeItem[]>([]);

  const pushNotice = useCallback((message: string, tone: NoticeTone = "info") => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setItems((current) => [...current, { id, message, tone }]);
    window.setTimeout(() => {
      setItems((current) => current.filter((item) => item.id !== id));
    }, 3600);
  }, []);

  const value = useMemo(() => ({ pushNotice }), [pushNotice]);

  return (
    <NoticeContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-[min(92vw,26rem)] flex-col gap-3">
        {items.map((item) => (
          <div
            key={item.id}
            className={`pointer-events-auto rounded-2xl border px-4 py-3 shadow-lg backdrop-blur ${NOTICE_STYLES[item.tone]}`}
          >
            <p className="text-sm font-medium">{item.message}</p>
          </div>
        ))}
      </div>
    </NoticeContext.Provider>
  );
}
