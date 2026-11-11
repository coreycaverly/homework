# Firebase setup — login, progress sync, and parent-only answer keys

This wires up **Google sign-in** so quiz progress follows the learner across devices,
and so the **answer keys** are parent-only. It's **fail-safe**: until you finish step 3
(real values in `assets/firebase-config.js`), the site behaves exactly as before —
no sign-in button, no gating, no sync.

Everything the browser needs (`apiKey`, etc.) is **public by design**. The real
protection is the Firestore **security rules** (`firestore.rules`), not secrecy.

---

## 1. Create the Firebase project
1. Go to <https://console.firebase.google.com> → **Add project** (e.g. "homework-helper").
   Google Analytics is optional (you can skip it).

## 2. Turn on Auth + Firestore
1. **Build → Authentication → Get started → Sign-in method → Google → Enable → Save.**
2. **Authentication → Settings → Authorized domains → Add domain:** `homework.caverly.net`
   (add `localhost` too if you want to test locally).
3. **Build → Firestore Database → Create database → Production mode →** pick a location → Enable.

## 3. Paste your web config into the repo
1. **Project settings (gear) → General → Your apps → Web app (`</>`)**, register an app,
   and copy the `firebaseConfig` values.
2. Open **`assets/firebase-config.js`** and replace `apiKey`, `authDomain`, `projectId`,
   and `appId` with your real values. (That alone turns the whole system on.)

## 4. Publish the security rules
1. **Firestore Database → Rules**, replace the contents with **`firestore.rules`** from
   this repo, and **Publish**. (You'll add your admin UID in step 6.)

## 5. First sign-in → get your admin UID
1. Push your changes (or run locally) and open the site. A **Sign in** button appears
   top-right of the banner. Sign in with the Google account that should be **admin**
   (yours).
2. In the Firebase console: **Authentication → Users**, copy your account's **User UID**.

## 6. Make yourself admin
Paste that UID in **two** places, then redeploy / re-publish:
1. `assets/firebase-config.js` → `window.HW_ADMIN_UIDS = ["yourUid"];`
2. `firestore.rules` → inside `isAdmin()`'s list → `"yourUid",` → **Publish** again.

Now the banner shows an **Admin** link for you, and `/admin.html` works.

## 7. Grant parent access
- Whoever should see answer keys signs in once. On any `answer-key` page they'll see a
  "Parents only" screen showing **their account id** — have them send it to you.
- Go to **`/admin.html`**, paste their id, click **Make parent**. Done — they can now
  open the answer keys. (You, as admin, already can.)

---

## How it behaves
- **Progress sync:** every quiz already writes to `localStorage`; signed-in users have it
  mirrored to Firestore and merged back on login, so stars/checkmarks follow them across
  devices. Signed-out users still work exactly as before (local only).
- **Answer keys** (`*/answer-key.html`): visible only to `parent`/`admin` accounts. The
  raw files still exist in this public repo — this keeps the learner out during normal
  use; it is **not** protection against someone reading the GitHub repo (by design).

## Privacy note (the learner is a minor)
Each `users/{uid}` doc stores `displayName` + `email` (from the Google profile) so the
admin page can tell accounts apart. If you'd rather store **no** name/email for the
child, say so and I'll switch the code to uid-only (you'd then grant parent purely by
uid, with no friendly list).

## Cost
Fits comfortably in Firebase's free **Spark** plan for this traffic.
