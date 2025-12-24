use tauri_plugin_shell::ShellExt;
use tauri_plugin_shell::process::CommandEvent;
use tauri::Manager;

fn main() {
    tauri::Builder::default()
        // Initialize the Shell Plugin
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            // Launch the Python Sidecar
            let sidecar = app.shell().sidecar("api").unwrap();
            let (mut rx, _child) = sidecar.spawn().unwrap();

            // Listen for logs (Optional, good for debugging)
            tauri::async_runtime::spawn(async move {
                while let Some(event) = rx.recv().await {
                    match event {
                        CommandEvent::Stdout(line) => {
                            let msg = String::from_utf8_lossy(&line);
                            println!("Python: {}", msg);
                        }
                        CommandEvent::Stderr(line) => {
                            let msg = String::from_utf8_lossy(&line);
                            println!("Python ERR: {}", msg);
                        }
                        _ => {}
                    }
                }
            });

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}