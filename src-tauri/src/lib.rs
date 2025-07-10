use font_enumeration::Collection;

#[derive(serde::Serialize)]
struct Font {
    family: String,
    style: String,
}

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn list_installed_fonts(state: tauri::State<Collection>) -> Vec<Font> {
    state
        .all()
        .map(|font| Font {
            family: font.family_name.clone(),
            style: font.font_name.clone(),
        })
        .collect()
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .manage(Collection::new().unwrap())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![list_installed_fonts])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
