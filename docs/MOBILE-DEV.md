# Android development on a physical device (live reload)

Use this workflow with a **Google Pixel** (or any Android phone) connected by USB. You install the native app **once**, then UI changes reload from your Mac’s Next.js dev server—no new APK each time.

## 1. One-time setup on the Pixel

1. **Developer options:** Settings → About phone → tap **Build number** 7 times.
2. **USB debugging:** Settings → System → Developer options → enable **USB debugging**.
3. Connect the phone with a data-capable USB cable. On the phone, tap **Allow** when asked to trust this computer.

## 2. One-time setup on the Mac

### Android Studio + SDK

1. Install [Android Studio](https://developer.android.com/studio).
2. Open Android Studio → **Settings** → **Languages & Frameworks** → **Android SDK**.
3. Install **Android SDK Platform** (API 34+ recommended) and **Android SDK Build-Tools**.
4. Install **Android SDK Platform-Tools** (includes `adb`).

Add platform-tools to your PATH (adjust username if needed):

```bash
export ANDROID_HOME="$HOME/Library/Android/sdk"
export PATH="$ANDROID_HOME/platform-tools:$ANDROID_HOME/tools:$PATH"
```

Add those lines to `~/.zshrc`, then run `source ~/.zshrc`.

### Verify the phone

```bash
adb devices
```

You should see your device as `device` (not `unauthorized`). If unauthorized, unplug, revoke USB debugging authorizations on the phone, and reconnect.

**Multiple devices (phone + emulator):** Scripts prefer your **physical phone** over an emulator. To force a device:

```bash
export ANDROID_SERIAL=48111FDAS002LN   # your phone’s id from `adb devices`
npm run android:live
```

Or close the emulator if you only need the phone.

### Project env

```bash
cp .env.example .env.local
# Fill in NEXT_PUBLIC_FIREBASE_* values
npm install
```

## 3. First install (debug APK, one time)

Build the static web assets, sync into Android, and install on the phone:

```bash
npm run android:install
```

Or open Android Studio and run the app once:

```bash
npm run build:mobile
npm run android
# Click Run ▶ in Android Studio with your Pixel selected
```

## 4. After adding or updating native plugins (important)

**Live reload only updates JavaScript.** Native plugins (e.g. Firebase Authentication) are compiled into the APK.

If sign-in says the **native plugin is missing** or **not implemented on android**:

1. Open the **Money Manager** app on the phone—not Chrome at `localhost:3000`.
2. **Uninstall** the app, then reinstall:

```bash
npm run android:rebuild
```

3. Add **`android/app/google-services.json`** (from Firebase Console). Without it, Google Sign-In cannot work.
4. For live reload, always run **both** terminals (`dev:mobile` then `android:live`) after a native rebuild.

## 5. Daily development (live reload)

Use **two terminals** in the project folder.

**Terminal 1 — Next.js dev server** (must listen on all interfaces if you use Wi‑Fi instead of USB reverse):

```bash
npm run dev:mobile
```

**Terminal 2 — USB port forward + sync live-reload config + launch app:**

```bash
npm run android:live
```

What this does:

- `adb reverse tcp:3000 tcp:3000` — phone’s `localhost:3000` → your Mac’s dev server (works over USB).
- `CAPACITOR_LIVE_RELOAD=true cap sync` — points the WebView at `http://localhost:3000`.
- `cap run android` — installs/starts the debug app if needed.

After that, **save any file** in `src/` and the app should refresh via Next.js hot reload. You do **not** need to reinstall the APK for UI/JS changes.

### If the app shows a blank screen

1. Confirm Terminal 1 is running and shows `Ready` on port 3000.
2. Run again: `npm run android:reverse`
3. Force-close **Money Manager** on the phone and reopen it (or run `npm run android:live` again).

### Wi‑Fi instead of USB reverse (optional)

If you prefer not to use `adb reverse`, find your Mac’s IP (`ipconfig getifaddr en0`), then:

```bash
CAPACITOR_SERVER_URL=http://192.168.x.x:3000 npm run android:sync:live
npm run dev:mobile
npm run android:run
```

Phone and Mac must be on the same Wi‑Fi network.

## 6. Production build on device (no live reload)

When you want the bundled `out/` assets (like release):

```bash
npm run build:mobile
npx cap run android
```

Do **not** set `CAPACITOR_LIVE_RELOAD` for production-like runs.

## Scripts reference

| Script | Purpose |
|--------|---------|
| `npm run dev:mobile` | Next dev server for the phone WebView |
| `npm run android:reverse` | `adb reverse` for USB live reload |
| `npm run android:sync:live` | Sync Capacitor config with dev server URL |
| `npm run android:live` | Reverse + sync live + run on device |
| `npm run android:install` | Full static build + install (first time) |
| `npm run android:rebuild` | Rebuild native app + reinstall (after plugin changes) |
| `npm run android:devices` | List connected devices |
| `npm run build:mobile` | `next build` + `cap sync` |
| `npm run android` | Open Android Studio |

## Native-only changes

If you change Android project files, plugins, or `capacitor.config.ts` **without** live reload flags, run:

```bash
npm run build:mobile
npm run android:live
```

## Firebase / Google sign-in on device

The app uses **native Google Sign-In** on Android (not `signInWithPopup`, which fails in the WebView with a “missing initial state” error).

### One-time Firebase Android setup

1. In [Firebase Console](https://console.firebase.google.com/) → your project → **Project settings** → **Your apps** → add an **Android** app if needed.
   - Package name: `com.rainy.moneymanager.app` (must match `google-services.json`)
2. Download **`google-services.json`** and place it at (required—do not skip):
   ```
   android/app/google-services.json
   ```
3. Add your **debug SHA-1** fingerprint to the Android app in Firebase (required for Google Sign-In):
   ```bash
   cd android && ./gradlew signingReport
   ```
   Copy the **SHA-1** under `Variant: debug` → paste in Firebase → Android app → **Add fingerprint**.
4. In Firebase → **Authentication** → **Sign-in method** → enable **Google**.
5. Rebuild and install on the phone (native plugin changed):
   ```bash
   npm run build:mobile
   npm run android:live
   ```

Browser development (`npm run dev`) still uses the normal Google popup.

### “No credentials available” on Sign in with Google

This comes from Android **Credential Manager** when the app is not fully registered with Google yet.

1. Add **debug SHA-1** to Firebase (Android app `com.rainy.moneymanager.app`):
   ```bash
   cd android && ./gradlew signingReport
   ```
   Copy **SHA-1** under `Variant: debug` (example: `8C:31:FD:FB:...`).
2. Firebase Console → Project settings → Your Android app → **Add fingerprint**.
3. **Re-download** `google-services.json` and replace `android/app/google-services.json`.
   - After SHA-1 is added, the file should include an `oauth_client` entry with `"client_type": 1` (Android), not only `"client_type": 3` (Web).
4. Rebuild: `npm run android:rebuild`

The app uses legacy Google Sign-In UI (`useCredentialManager: false`) to avoid this error before SHA-1 is set; SHA-1 is still required for sign-in to succeed.
