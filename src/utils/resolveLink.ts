function isAbsolutePath(value: string): boolean {
  return /^([A-Za-z]:[\\/]|\\\\)/.test(value) || value.startsWith("/");
}

export function isExternalUrl(href: string): boolean {
  return /^https?:\/\//i.test(href) || /^mailto:/i.test(href);
}

export function isMarkdownPath(path: string): boolean {
  const lower = path.toLowerCase();
  return lower.endsWith(".md") || lower.endsWith(".markdown");
}

export function isSamePageAnchor(href: string): boolean {
  return href.startsWith("#");
}

export function resolveRelativePath(baseFilePath: string, href: string): string {
  if (isAbsolutePath(href)) {
    return href;
  }

  const separator = baseFilePath.includes("\\") ? "\\" : "/";
  const baseDir = baseFilePath.replace(/[\\/][^\\/]+$/, "");
  const segments = href.split(/[\\/]/);
  const stack = baseDir.split(/[\\/]/).filter(Boolean);

  for (const segment of segments) {
    if (segment === "" || segment === ".") {
      continue;
    }

    if (segment === "..") {
      stack.pop();
      continue;
    }

    stack.push(segment);
  }

  if (separator === "\\") {
    const driveMatch = baseFilePath.match(/^([A-Za-z]:)/);
    const drive = driveMatch?.[1] ?? "";
    return drive ? `${drive}\\${stack.join("\\")}` : stack.join("\\");
  }

  return `/${stack.join("/")}`;
}

export function resolveLinkTarget(
  href: string,
  currentFilePath: string | null,
): { kind: "anchor" } | { kind: "external"; url: string } | { kind: "local"; path: string } | null {
  if (!href || href.trim() === "") {
    return null;
  }

  if (isSamePageAnchor(href)) {
    return { kind: "anchor" };
  }

  if (isExternalUrl(href)) {
    return { kind: "external", url: href };
  }

  if (!currentFilePath) {
    return null;
  }

  const path = resolveRelativePath(currentFilePath, href);
  return { kind: "local", path };
}
