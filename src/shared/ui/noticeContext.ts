import { createContext } from "react";

export type NoticeTone = "info" | "success" | "warning" | "error";

export interface NoticeContextValue {
  pushNotice: (message: string, tone?: NoticeTone) => void;
}

export const NoticeContext = createContext<NoticeContextValue | undefined>(undefined);
