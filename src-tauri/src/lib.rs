use tauri_plugin_deep_link::DeepLinkExt;
use tauri::{ Emitter, Manager };
use tauri::menu::{ Menu, MenuItem };
use tauri::tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent};
use tauri::WebviewWindowBuilder;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder
        ::default()
        .plugin(
            tauri_plugin_single_instance::init(|app, argv, _cwd| {
                if let Some(url) = argv.get(1) {
                    let _ = app.emit("deep-link-urls", vec![url.clone()]);
                }
                if let Some(window) = app.get_webview_window("main") {
                    let _ = window.set_focus();
                }
            })
        )
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_deep_link::init())

        .setup(|app| {
            app.deep_link().register_all()?;

            let open_i = MenuItem::with_id(app, "open", "Open Main", true, None::<&str>)?;
            let quit_i = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;

            let menu = Menu::with_items(app, &[&open_i, &quit_i])?;

            let _tray = TrayIconBuilder::new()
                .icon(app.default_window_icon().unwrap().clone())
                .menu(&menu)
                .on_menu_event(|app, event| {
                    match event.id.as_ref() {
                        "open" => open_main(app),
                        "quit" => app.exit(0),
                        _ => {}
                    }
                })
                .on_tray_icon_event(|tray, event| {
                    if let TrayIconEvent::Click {
                        button: MouseButton::Left,
                        button_state: MouseButtonState::Up,
                        ..
                    } = event {
                        open_main(tray.app_handle());
                    }
                })
                .build(app)?;

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

fn open_main(app: &tauri::AppHandle) {
    if let Some(window) = app.get_webview_window("settings") {
        let _ = window.show();
        let _ = window.set_focus();
        return;
    }

    let _ = WebviewWindowBuilder::new(
        app,
        "main-overlay",
        tauri::WebviewUrl::App("index.html".into()),
    )
    .title("priestess")
    .inner_size(480.0, 600.0)
    .decorations(false)
    .transparent(true)
    .resizable(false)
    .shadow(true)
    .center()
    .build();
}