import { useRef, useState } from "react";
import type { ToastState } from "./Toast";

export function useToast(timeoutMs = 3000) {
  const [toast, setToast] = useState<ToastState>(null);
  const timer = useRef<number | null>(null);

  function show(type: "success" | "error", message: string) {
    setToast({ type, message });
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setToast(null), timeoutMs);
  }

  function clear() {
    if (timer.current) window.clearTimeout(timer.current);
    setToast(null);
  }

  return { toast, show, clear };
}
