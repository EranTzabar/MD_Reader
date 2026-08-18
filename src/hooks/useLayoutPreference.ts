import { useCallback, useState } from "react";

export type LayoutMode = "reading" | "wide";

const STORAGE_KEY = "md-reader-layout";

function readStoredLayout(): LayoutMode {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === "wide" ? "wide" : "reading";
  } catch {
    return "reading";
  }
}

export function useLayoutPreference() {
  const [layout, setLayout] = useState<LayoutMode>(readStoredLayout);

  const toggleLayout = useCallback(() => {
    setLayout((current) => {
      const next: LayoutMode = current === "reading" ? "wide" : "reading";
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // Ignore storage errors and still apply the in-session preference.
      }
      return next;
    });
  }, []);

  return { layout, toggleLayout };
}
