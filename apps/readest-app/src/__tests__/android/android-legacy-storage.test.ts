import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

/**
 * Leaflet drops the abusive All Files Access (MANAGE_EXTERNAL_STORAGE) grant
 * and only reads from its own app-scoped storage, so neither the Android 10
 * legacy opt-out (requestLegacyExternalStorage) nor any broad external-storage
 * permission may appear in the manifest.
 */
const manifest = readFileSync(
  resolve(process.cwd(), 'src-tauri/gen/android/app/src/main/AndroidManifest.xml'),
  'utf-8',
);

describe('Android storage permissions are app-scoped only', () => {
  it('opts the app out of scoped storage on Android 10', () => {
    const application = manifest.match(/<application\b[^>]*>/)?.[0] ?? '';
    expect(application).not.toContain('android:requestLegacyExternalStorage="true"');
  });

  it('never requests broad external-storage access', () => {
    expect(manifest).not.toContain('MANAGE_EXTERNAL_STORAGE');
    expect(manifest).not.toContain('READ_EXTERNAL_STORAGE');
    expect(manifest).not.toContain('WRITE_EXTERNAL_STORAGE');
  });
});
