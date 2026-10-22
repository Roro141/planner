// No console window next to the widget in release builds. Don't remove.
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    planner_widget_lib::run();
}
