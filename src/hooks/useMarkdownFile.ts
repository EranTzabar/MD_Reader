import { invoke } from "@tauri-apps/api/core";
import { useCallback, useState } from "react";

export interface MarkdownFileState {
  path: string | null;
  content: string;
  loading: boolean;
  error: string | null;
}

const initialState: MarkdownFileState = {
  path: null,
  content: "",
  loading: false,
  error: null,
};

function fileNameFromPath(path: string): string {
  const normalized = path.replace(/\\/g, "/");
  const parts = normalized.split("/");
  return parts[parts.length - 1] || path;
}

export function useMarkdownFile() {
  const [state, setState] = useState<MarkdownFileState>(initialState);

  const loadFile = useCallback(async (path: string) => {
    const trimmed = path.trim();
    if (!trimmed) {
      return;
    }

    setState((prev) => ({
      ...prev,
      path: trimmed,
      loading: true,
      error: null,
    }));

    try {
      const content = await invoke<string>("read_text_file", { path: trimmed });
      setState({
        path: trimmed,
        content,
        loading: false,
        error: null,
      });
      document.title = `${fileNameFromPath(trimmed)} - MD Reader`;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : String(error);
      setState({
        path: trimmed,
        content: "",
        loading: false,
        error: message,
      });
      document.title = "MD Reader";
    }
  }, []);

  const clearFile = useCallback(() => {
    setState(initialState);
    document.title = "MD Reader";
  }, []);

  return {
    ...state,
    loadFile,
    clearFile,
  };
}
