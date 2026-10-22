// The desktop widget: one small always-on-top window (see tauri.conf.json)
// that loads widget.html. Everything else happens in the web code
// (src/widget); this file only switches on the plugins it uses.

use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        // Opening the app again while it's running just shows the bubble.
        .plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
            if let Some(window) = app.get_webview_window("widget") {
                let _ = window.show();
                let _ = window.set_focus();
            }
        }))
        // "Start with Windows", switched on and off from the widget.
        .plugin(tauri_plugin_autostart::init(
            tauri_plugin_autostart::MacosLauncher::LaunchAgent,
            None,
        ))
        // "Quit" in the widget.
        .plugin(tauri_plugin_process::init())
        .run(tauri::generate_context!())
        .expect("error while running the planner widget");
}
