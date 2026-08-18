import { listen } from "@tauri-apps/api/event";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { open } from "@tauri-apps/plugin-dialog";
import { useCallback, useEffect, useState } from "react";
import { MarkdownView } from "./components/MarkdownView";
import { useMarkdownFile } from "./hooks/useMarkdownFile";
import "./styles/app.css";

interface StartupPayload {
  file_path: string | null;
}

function isMarkdownPath(path: string): boolean {
  const lower = path.toLowerCase();
  return lower.endsWith(".md") || lower.endsWith(".markdown");
}

function App() {
  const { path, content, loading, error, loadFile } = useMarkdownFile();
  const [dragOver, setDragOver] = useState(false);

  const openFileDialog = useCallback(async () => {
    const selected = await open({
      multiple: false,
      filters: [{ name: "Markdown", extensions: ["md", "markdown"] }],
    });

    if (typeof selected === "string") {
      await loadFile(selected);
    }
  }, [loadFile]);

  useEffect(() => {
    const unlisteners: Array<() => void> = [];

    const setup = async () => {
      unlisteners.push(
        await listen<StartupPayload>("startup-file", (event) => {
          if (event.payload.file_path) {
            void loadFile(event.payload.file_path);
          }
        }),
      );

      unlisteners.push(
        await listen<string>("open-file", (event) => {
          void loadFile(event.payload);
        }),
      );

      unlisteners.push(
        await listen("menu-open", () => {
          void openFileDialog();
        }),
      );

      unlisteners.push(
        await getCurrentWindow().onDragDropEvent((event) => {
          if (event.payload.type === "over") {
            setDragOver(true);
            return;
          }

          if (event.payload.type === "leave") {
            setDragOver(false);
            return;
          }

          if (event.payload.type === "drop") {
            setDragOver(false);
            const mdPath = event.payload.paths.find(isMarkdownPath);
            if (mdPath) {
              void loadFile(mdPath);
            }
          }
        }),
      );
    };

    void setup();

    return () => {
      for (const unlisten of unlisteners) {
        unlisten();
      }
    };
  }, [loadFile, openFileDialog]);

  const displayName = path
    ? path.replace(/^.*[\\/]/, "")
    : "No file open";

  return (
    <div className="app">
      <header className="toolbar">
        <div className="toolbar-title">{displayName}</div>
        <div className="toolbar-actions">
          <button className="primary" type="button" onClick={() => void openFileDialog()}>
            Open
          </button>
        </div>
      </header>

      <main className={`content drop-target${dragOver ? " drag-over" : ""}`}>
        <div className="content-inner">
          {loading && (
            <div className="loading-state">
              <p>Loading markdown…</p>
            </div>
          )}

          {!loading && error && (
            <div className="error-state">
              <h1>Could not open file</h1>
              <p>{error}</p>
              <button className="primary" type="button" onClick={() => void openFileDialog()}>
                Choose another file
              </button>
            </div>
          )}

          {!loading && !error && !content && (
            <div className="empty-state">
              <h1>MD Reader</h1>
              <p>
                Open a markdown file with the button above, drag and drop a{" "}
                <code>.md</code> file here, or double-click a markdown file in
                Explorer.
              </p>
              <button className="primary" type="button" onClick={() => void openFileDialog()}>
                Open file
              </button>
            </div>
          )}

          {!loading && !error && content && (
            <MarkdownView
              content={content}
              currentFilePath={path}
              onOpenMarkdown={loadFile}
            />
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
