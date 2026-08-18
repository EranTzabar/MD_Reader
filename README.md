# MD Reader

A lightweight **read-only markdown viewer** for Windows. Open `.md` files from the File menu, drag-and-drop, or by double-clicking in Explorer.

## Features

- Render markdown with GFM support (tables, task lists, strikethrough)
- Syntax-highlighted code blocks
- Light/dark theme follows Windows
- File > Open dialog
- Drag-and-drop `.md` files
- `.md` file association (after install)
- Single-instance: opening another file focuses the existing window

## End-user installation

1. Download `MD Reader_0.1.0_x64-setup.exe` from the release/build output.
2. Run the installer and follow the prompts.
3. Optionally check **Create desktop shortcut** on the finish page.
4. Open any `.md` file by double-clicking it in Explorer, or launch **MD Reader** from the Start Menu.

The installer registers MD Reader as a handler for `.md` files. Uninstalling removes the association.

Installed license files:

- `LICENSE` — proprietary end-user license
- `THIRD_PARTY_NOTICES.md` — open-source attributions

## Development prerequisites

- [Node.js](https://nodejs.org/) 20+
- [Rust](https://rustup.rs/)
- [Visual Studio Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/) with **Desktop development with C++**
- [WebView2 Runtime](https://developer.microsoft.com/en-us/microsoft-edge/webview2/) (usually preinstalled on Windows 11)

## Development

```powershell
cd MD_Reader
npm install
npm run tauri dev
```

## Production build (Windows installer)

```powershell
npm run tauri build
```

Output:

```text
src-tauri/target/release/bundle/nsis/MD Reader_0.1.0_x64-setup.exe
```

The build runs `npm run license:check` automatically before packaging.

## License policy

MD Reader uses **permissive open-source dependencies only** (MIT, Apache-2.0, BSD, ISC, etc.) so the product can be sold commercially without copyleft or revenue restrictions.

Commands:

```powershell
npm run license:check    # Fail if any production dependency has a forbidden license
npm run license:notices    # Regenerate THIRD_PARTY_NOTICES.md
```

Rust dependencies are audited via `src-tauri/deny.toml` (use `cargo deny check` if installed).

## Project structure

```text
src/                 React UI
src-tauri/           Tauri Rust shell
scripts/             License audit scripts
LICENSE              Proprietary EULA
THIRD_PARTY_NOTICES.md  OSS attributions
```

## Commercial use

You may publish and sell MD Reader commercially. Third-party libraries require attribution only (`THIRD_PARTY_NOTICES.md`). Your application code is proprietary unless you choose otherwise.
