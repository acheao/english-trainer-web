import { useContext } from "react";
import { NoticeContext } from "./noticeContext";

export function useNotice() {
  const context = useContext(NoticeContext);
  if (!context) {
    throw new Error("useNotice must be used within a NoticeProvider");
  }
  return context;
}
