// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use tauri_plugin_deep_link::DeepLinkExt;
use tauri::{Emitter, Manager};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder
        ::default()
        .plugin(tauri_plugin_single_instance::init(|app, argv, _cwd| {
            if let Some(url) = argv.get(1) {
                let _ = app.emit("deep-link-urls", vec![url.clone()]);
            }
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.set_focus();
            }
        }))
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_deep_link::init())

        .setup(|app| {
            app.deep_link().register_all()?;

            #[cfg(debug_assertions)]
            {
                if let Some(window) = app.get_webview_window("main") {
                    window.open_devtools();
                }
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
