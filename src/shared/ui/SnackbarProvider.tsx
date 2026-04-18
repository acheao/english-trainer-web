import { useMemo } from "react";
import type { ReactNode } from "react";
import NoticeProvider from "./NoticeProvider";
import type { NoticeTone } from "./noticeContext";
import { useNotice } from "./useNotice";

export function SnackbarProvider({ children }: { children: ReactNode }) {
  return <NoticeProvider>{children}</NoticeProvider>;
}

export function useSnackbar() {
  const { pushNotice } = useNotice();

  return useMemo(
    () => ({
      showSnackbar: (message: string, tone: NoticeTone = "info") => {
        pushNotice(message, tone);
      },
    }),
    [pushNotice]
  );
}
