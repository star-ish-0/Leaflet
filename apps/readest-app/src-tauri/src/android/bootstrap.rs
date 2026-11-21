//! One-shot migration of the library from the internal app data dir to the
//! external files dir that `documentDir()` resolves to on Android
//! (`Android/data/<package>/files/documents`), so the library and its data
//! can be delivered with adb, Shizuku, or root and stay visible in a file
//! manager. Skipped instantly on every later launch via a marker file.

use std::fs;
use std::path::Path;

use tauri::{AppHandle, Manager};

const LEGACY_LOCAL_SUBDIR: &str = "Readest";
const LOCAL_SUBDIR: &str = "Leaflet";
const MIGRATION_MARKER: &str = ".leaflet-library-migrated";

/// Copy `src` into `dst`, creating directories as needed and never overwriting
/// a file that already exists at the destination: data created under the new
/// root before the migration finished must win over the older internal copy.
pub(crate) fn copy_tree_merge(src: &Path, dst: &Path) -> std::io::Result<()> {
    fs::create_dir_all(dst)?;
    for entry in fs::read_dir(src)? {
        let entry = entry?;
        let file_type = entry.file_type()?;
        let to = dst.join(entry.file_name());
        if file_type.is_dir() {
            copy_tree_merge(&entry.path(), &to)?;
        } else if file_type.is_file() {
            if !to.exists() {
                fs::copy(entry.path(), &to)?;
            }
        }
    }
    Ok(())
}

/// Perform the migration once; later calls no-op on the marker file.
pub fn bootstrap_document_dir_impl(app: &AppHandle) -> Result<(), String> {
    let docs_dir = app.path().document_dir().map_err(|e| e.to_string())?;
    let target_root = docs_dir.join(LOCAL_SUBDIR);
    if target_root.join(MIGRATION_MARKER).exists() {
        return Ok(());
    }
    let legacy_root = app
        .path()
        .app_data_dir()
        .map_err(|e| e.to_string())?
        .join(LEGACY_LOCAL_SUBDIR);
    if legacy_root.is_dir() {
        copy_tree_merge(&legacy_root, &target_root)
            .map_err(|e| format!("library migration copy failed: {e}"))?;
    }
    // The legacy internal copy is deliberately kept: a failed or partial
    // launch must never destroy the only copy of the user's library, and
    // the marker keeps the next launch from re-copying stale data over it.
    fs::create_dir_all(&target_root).map_err(|e| e.to_string())?;
    fs::write(target_root.join(MIGRATION_MARKER), "migrated\n").map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn bootstrap_document_dir(app: AppHandle) -> Result<(), String> {
    bootstrap_document_dir_impl(&app)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn copy_tree_merges_without_overwriting() {
        let root = std::env::temp_dir().join(format!("leaflet-bootstrap-{}", std::process::id()));
        let src = root.join("src");
        let dst = root.join("dst");
        let _ = fs::remove_dir_all(&root);
        fs::create_dir_all(src.join("Books/a")).unwrap();
        fs::create_dir_all(dst.join("Books")).unwrap();
        fs::write(src.join("Books/a/cover.jpg"), b"legacy").unwrap();
        fs::write(src.join("Books/b.epub"), b"legacy").unwrap();
        fs::write(src.join("settings.json"), b"legacy").unwrap();
        fs::write(dst.join("Books/b.epub"), b"new").unwrap();

        copy_tree_merge(&src, &dst).unwrap();

        assert_eq!(fs::read(dst.join("Books/a/cover.jpg")).unwrap(), b"legacy");
        assert_eq!(fs::read(dst.join("Books/b.epub")).unwrap(), b"new");
        assert_eq!(fs::read(dst.join("settings.json")).unwrap(), b"legacy");
        let _ = fs::remove_dir_all(&root);
    }
}
