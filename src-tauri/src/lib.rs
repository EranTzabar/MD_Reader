use std::fs;
use std::sync::Mutex;
use tauri::{Emitter, Manager};

struct PendingFile(Mutex<Option<String>>);

fn normalize_path_arg(arg: &str) -> String {
    arg.trim().trim_matches('"').to_string()
}

fn extract_md_path_from_args(args: &[String]) -> Option<String> {
    args.iter()
        .skip(1)
        .map(|arg| normalize_path_arg(arg))
        .find(|arg| {
            if arg.is_empty() {
                return false;
            }

            let lower = arg.to_lowercase();
            lower.ends_with(".md") || lower.ends_with(".markdown")
        })
}

#[tauri::command]
fn get_startup_file(state: tauri::State<PendingFile>) -> Option<String> {
    state.0.lock().ok()?.take()
}

#[tauri::command]
fn read_text_file(path: String) -> Result<String, String> {
    let trimmed = normalize_path_arg(&path);
    if trimmed.is_empty() {
        return Err("No file path provided.".to_string());
    }

    let meta = fs::metadata(&trimmed).map_err(|e| format!("Cannot access file: {e}"))?;
    if !meta.is_file() {
        return Err("Path is not a file.".to_string());
    }

    fs::read_to_string(trimmed).map_err(|e| format!("Failed to read file: {e}"))
}

fn focus_main_window(app: &tauri::AppHandle) {
    if let Some(window) = app.get_webview_window("main") {
        let _ = window.unminimize();
        let _ = window.show();
        let _ = window.set_focus();
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_single_instance::init(|app, argv, _cwd| {
            focus_main_window(app);

            if let Some(path) = extract_md_path_from_args(&argv) {
                let _ = app.emit("open-file", path);
            }
        }))
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            use tauri::menu::{Menu, MenuItem, PredefinedMenuItem, Submenu};

            let args: Vec<String> = std::env::args().collect();
            let file_path = extract_md_path_from_args(&args);
            app.manage(PendingFile(Mutex::new(file_path)));

            let open_item = MenuItem::with_id(app, "open", "Open...", true, None::<&str>)?;
            let exit_item = PredefinedMenuItem::quit(app, Some("Exit"))?;
            let file_menu = Submenu::with_items(app, "File", true, &[&open_item, &exit_item])?;
            let menu = Menu::with_items(app, &[&file_menu])?;
            app.set_menu(menu)?;

            app.on_menu_event(|app, event| {
                if event.id() == "open" {
                    let _ = app.emit("menu-open", ());
                }
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![read_text_file, get_startup_file])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
