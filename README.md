# Passage Planner – PWA, Android APK and Google Play package

> Planning aid only – not for navigation.

## What's in this folder
| File / folder | Purpose |
|---|---|
| `index.html` | The whole app (works offline) |
| `manifest.webmanifest`, `sw.js`, `icons/`, `screenshots/` | Installable, offline Progressive Web App |
| `privacy.html` | Privacy policy. Google Play requires a public link to it; the app links to it under ☰ → About & privacy |
| `.well-known/assetlinks.json` | Proves to Android that the app and the website belong together (needed for PWABuilder / TWA) |
| `store/` | Play Store graphics + `store-listing.md` (all texts and form answers ready to paste) |
| `capacitor/`, `.github/workflows/build-apk.yml` | Builds the Android app (APK / Play AAB) on GitHub's servers |
| `scripts/make-upload-key.sh` | Creates your Play upload signing key |

---

## 1 · Put it online (GitHub Pages, free)

> **Important for Google Play:** name the repository exactly **`<your-github-username>.github.io`**.
> The app is then served at `https://<username>.github.io/`, the root of the domain. That is where Android looks for `/.well-known/assetlinks.json`. A repository with any other name ends up in a sub-folder, and the PWABuilder app would then show a browser address bar.

1. Create a free GitHub account and a **public** repository named `<username>.github.io`.
2. **Add file → Upload files:** upload everything in this folder, including the hidden `.github` and `.well-known` folders and `.nojekyll` (turn on "show hidden files" on your computer). Commit.
3. **Settings → Pages → Deploy from a branch → main / (root) → Save.**
4. Open `https://<username>.github.io/` – the app runs. In Chrome on Android, tap ⋮ → **Install app** for the PWA.
5. Check `https://<username>.github.io/privacy.html` opens – this is your privacy policy URL.

## 2 · Build the Android app – choose ONE route

### Route A – PWABuilder (TWA, easiest)
1. Go to https://www.pwabuilder.com, enter your site and click **Start**. It should score green on manifest and service worker.
2. **Package for stores → Android → Options:** Package ID `app.passageplanner.navigation`, App name `Passage Planner`, Version 1.0.0 / version code 1. Signing key: **Create new**. Then **Download**.
3. The zip contains:
   - **`.aab`** – upload this to Google Play
   - `.apk` – for testing on your phone
   - `signing.keystore` + `signing-key-info.txt` – **back these up safely**
   - `assetlinks.json` – copy its fingerprint into `.well-known/assetlinks.json` in your repository
4. After you upload to Play: Play Console → **Setup → App signing**. Copy the **App signing key SHA-256** and add it as a **second** fingerprint in `assetlinks.json`. Without it, the app installed from Play shows an address bar.

### Route B – Capacitor app built on GitHub (app packed inside, no website needed)
1. Create the upload key once: run `scripts/make-upload-key.sh` on a computer with Java (Windows: Git Bash).
2. GitHub → repository → **Settings → Secrets and variables → Actions:** add the 4 secrets the script prints (`ANDROID_KEYSTORE_BASE64`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD`).
3. **Actions → Build Android app → Run workflow.** After about 8 minutes, download **passage-planner-android**. It contains:
   - `PassagePlanner-release.aab` – upload this to Google Play
   - `PassagePlanner-release.apk` – for your phone
4. Without the secrets the workflow still runs. It then makes a `PassagePlanner-debug.apk` for testing only.
5. The build targets **Android 16 (API 36)**, which Google Play has required since 31 Aug 2026. The version code goes up automatically with each run. Change `"version"` in `capacitor/package.json` for a new version name.

**Which route?**
- **A** follows your website automatically: update `index.html` on GitHub and every phone gets it.
- **B** is fully self-contained: it works with no website at all. Rebuild and upload a new AAB for each update. In route B, saving files opens Android's Share / Save sheet, and printing is not available.

## 3 · Google Play Console checklist
1. **Developer account:** https://play.google.com/console – one-time US$25 fee and identity verification. Choose a **personal** or **organisation** account.
2. **Personal accounts created after Nov 2023 must run a closed test first:** at least **12 testers opted in for 14 days in a row** before you can apply for production. Recruit colleagues or crew early.
3. **Create app:** name, default language English, App (not game), Free.
4. **App content:** copy every answer from `store/store-listing.md` (privacy policy, ads = no, data safety = no data collected, content rating, target audience 18+).
5. **Main store listing:** texts and graphics from `store/`.
6. **Testing → Closed testing → Create release:** upload the `.aab`, add testers, roll out. Then, after 14 days, **Production**.
7. Keep **Play App Signing** on (the default). Google holds the final key, and your upload key can be reset if it is lost.

## Updating
- **Web / PWA / route A:** replace `index.html` on GitHub. To force every phone to refresh its offline copy, change `VER` in `sw.js`.
- **Route B:** run the workflow again, then upload the new `.aab` to Play.
