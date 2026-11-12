/* Homework Helper — Firebase configuration (PUBLIC values, safe to commit).
 *
 * These are web API keys, which Firebase is designed to expose in the browser.
 * Real protection comes from the Firestore security rules (see firestore.rules),
 * not from hiding these values.
 *
 * ──────────────────────────────────────────────────────────────────────────
 * UNTIL you replace apiKey below with a real value, auth is DISABLED and the
 * site behaves exactly as before: no sign-in, no answer-key gating, no sync.
 * ──────────────────────────────────────────────────────────────────────────
 *
 * Fill these from: Firebase console → Project settings → "Your apps" (Web app).
 */
window.HW_FIREBASE_CONFIG = {
  apiKey: "AIzaSyAKGxYD4lykbP4DorcH6BuBMdrnbncfew0",
  authDomain: "homework-1f388.firebaseapp.com",
  projectId: "homework-1f388",
  messagingSenderId: "1044597967850",
  appId: "1:1044597967850:web:5d4d1dad41a78cc90e4093",
  measurementId: "G-HW1PRRPRRR"
  // storageBucket / messagingSenderId are not needed for auth + Firestore.
};

/* Admin UIDs — accounts allowed to grant/revoke "parent" access on /admin.html.
 * Get yours from Firebase console → Authentication → Users AFTER your first
 * sign-in, then paste it here (and into firestore.rules). */
window.HW_ADMIN_UIDS = [
   "UnV9SrcUQBgnP3tObnyHMvV6Ol43",
   "mzsQ7kcc1JdWi4Z5LdjS7Yw7xDj2"
];

/* Derived flag — do not edit. Auth turns on only when apiKey is really set. */
window.HW_FIREBASE_READY =
  typeof window.HW_FIREBASE_CONFIG.apiKey === "string" &&
  window.HW_FIREBASE_CONFIG.apiKey.length > 0 &&
  window.HW_FIREBASE_CONFIG.apiKey.indexOf("REPLACE") === -1;
