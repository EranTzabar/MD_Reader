import { confirm } from "@tauri-apps/plugin-dialog";
import { openPath, openUrl } from "@tauri-apps/plugin-opener";
import type { AnchorHTMLAttributes, MouseEvent } from "react";
import {
  isMarkdownPath,
  resolveLinkTarget,
} from "../utils/resolveLink";

interface MarkdownLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href?: string;
  currentFilePath: string | null;
  onOpenMarkdown: (path: string) => void | Promise<void>;
}

export function MarkdownLink({
  href,
  currentFilePath,
  onOpenMarkdown,
  children,
  ...rest
}: MarkdownLinkProps) {
  const handleClick = async (event: MouseEvent<HTMLAnchorElement>) => {
    if (!href) {
      return;
    }

    const target = resolveLinkTarget(href, currentFilePath);
    if (!target || target.kind === "anchor") {
      return;
    }

    event.preventDefault();

    if (target.kind === "external") {
      const confirmed = await confirm(
        [
          "You are about to leave MD Reader and open an external link in your default browser.",
          "",
          target.url,
          "",
          "Warning: External links may lead to untrusted websites. Only continue if you trust this destination.",
        ].join("\n"),
        {
          title: "Open external link?",
          kind: "warning",
          okLabel: "Open link",
          cancelLabel: "Cancel",
        },
      );

      if (confirmed) {
        await openUrl(target.url);
      }
      return;
    }

    if (isMarkdownPath(target.path)) {
      const confirmed = await confirm(
        [
          "Open this linked markdown file in MD Reader?",
          "",
          target.path,
        ].join("\n"),
        {
          title: "Open linked file?",
          kind: "warning",
          okLabel: "Open file",
          cancelLabel: "Cancel",
        },
      );

      if (confirmed) {
        await onOpenMarkdown(target.path);
      }
      return;
    }

    const confirmed = await confirm(
      [
        "You are about to open a linked file with your system's default application.",
        "",
        target.path,
        "",
        "Warning: Only open files from sources you trust.",
      ].join("\n"),
      {
        title: "Open linked file?",
        kind: "warning",
        okLabel: "Open file",
        cancelLabel: "Cancel",
      },
    );

    if (confirmed) {
      await openPath(target.path);
    }
  };

  return (
    <a href={href} onClick={(event) => void handleClick(event)} {...rest}>
      {children}
    </a>
  );
}
