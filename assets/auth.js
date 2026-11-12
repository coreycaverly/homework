/* Homework Helper — auth + progress sync + answer-key gating.
 *
 * Fail-safe: if Firebase isn't configured (see assets/firebase-config.js), this
 * file does nothing at all and the site behaves exactly as before.
 *
 * What it does when configured:
 *  - Renders a "Sign in with Google" button in the banner (#hw-auth).
 *  - Mirrors quiz progress (localStorage) to Firestore per signed-in user, and
 *    merges it back on login — so progress follows the learner across devices.
 *    (No quiz code is modified; we wrap localStorage.setItem/removeItem.)
 *  - Gates each subject's answer-key.html page: only parent/admin accounts see it.
 *  - Exposes window.hwAuth helpers used by /admin.html to grant/revoke parent.
 */
(function () {
  "use strict";
  if (!window.HW_FIREBASE_READY) return; // not configured → no-op, site unchanged.

  var CFG = window.HW_FIREBASE_CONFIG;
  var ADMIN_UIDS = window.HW_ADMIN_UIDS || [];
  var SDK = "https://www.gstatic.com/firebasejs/10.12.2/";
  var FILES = ["firebase-app-compat.js", "firebase-auth-compat.js", "firebase-firestore-compat.js"];
  var IS_ANSWER_KEY = /answer-key/.test(location.pathname);
  var LOCKED = window.HW_LOCKED || [];
  var CUR_SLUG = location.pathname.replace(/^\/+/, "").split("/")[0] || "";
  var IS_LOCKED_LESSON = LOCKED.indexOf(CUR_SLUG) > -1;
  var IS_GATED = IS_ANSWER_KEY || IS_LOCKED_LESSON;

  var state = { user: null, role: null, db: null, ready: false };
  window.hwAuth = state;
  state.isAdmin = function () {
    return state.role === "admin" || (state.user && ADMIN_UIDS.indexOf(state.user.uid) > -1);
  };
  state.isParent = function () {
    return state.role === "parent" || state.isAdmin();
  };

  function esc(s) {
    return ("" + (s == null ? "" : s)).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  function loadScript(src) {
    return new Promise(function (res, rej) {
      var s = document.createElement("script");
      s.src = src; s.onload = res; s.onerror = function () { rej(new Error("load " + src)); };
      document.head.appendChild(s);
    });
  }

  /* ---------- progress sync ---------- */
  function snapshot() {
    var o = {};
    for (var i = 0; i < localStorage.length; i++) {
      var k = localStorage.key(i);
      if (k === "hw-reloaded") continue; // session-only UI guard, don't sync
      o[k] = localStorage.getItem(k);
    }
    return o;
  }
  function mergeValue(k, localV, remoteV) {
    if (remoteV == null) return localV;
    if (localV == null) return remoteV;
    if (k.indexOf("hw-done-") === 0) return remoteV > localV ? remoteV : localV; // max ISO date
    try {
      var l = JSON.parse(localV), r = JSON.parse(remoteV);
      if (l && r && typeof l === "object" && typeof r === "object") {
        return JSON.stringify({ cases: Math.max(l.cases || 0, r.cases || 0), stars: Math.max(l.stars || 0, r.stars || 0) });
      }
    } catch (e) { /* not JSON */ }
    return remoteV > localV ? remoteV : localV;
  }
  function applyRemote(remote) {
    if (!remote) return false;
    var changed = false;
    Object.keys(remote).forEach(function (k) {
      var localV = localStorage.getItem(k);
      var merged = mergeValue(k, localV, remote[k]);
      if (merged != null && merged !== localV) {
        try { rawSet(k, merged); changed = true; } catch (e) {}
      }
    });
    return changed;
  }
  var saveTimer = null;
  function queueSave() {
    if (!state.user || !state.db) return;
    clearTimeout(saveTimer);
    saveTimer = setTimeout(pushProgress, 800);
  }
  function pushProgress() {
    if (!state.user || !state.db) return;
    state.db.collection("users").doc(state.user.uid)
      .set({ progress: snapshot(), updatedAt: Date.now() }, { merge: true })
      .catch(function () {});
  }
  var rawSet = localStorage.setItem.bind(localStorage);
  var rawRemove = localStorage.removeItem.bind(localStorage);
  function installMirror() {
    localStorage.setItem = function (k, v) { rawSet(k, v); if (k !== "hw-reloaded") queueSave(); };
    localStorage.removeItem = function (k) { rawRemove(k); if (k !== "hw-reloaded") queueSave(); };
  }
  function refreshAfterMerge() {
    try {
      if (sessionStorage.getItem("hw-reloaded")) return;
      sessionStorage.setItem("hw-reloaded", "1");
    } catch (e) {}
    location.reload();
  }

  /* ---------- sign-in button ---------- */
  function renderButton() {
    var el = document.getElementById("hw-auth");
    if (!el) return;
    if (state.user) {
      var name = state.user.displayName ? state.user.displayName.split(" ")[0] : "Signed in";
      var badge = state.isParent() ? ' <span class="hw-badge">' + (state.isAdmin() ? "admin" : "parent") + "</span>" : "";
      var adminLink = state.isAdmin() ? ' <a class="hw-link" href="/admin.html">Admin</a>' : "";
      el.innerHTML = '<span class="hw-who">' + esc(name) + badge + "</span>" + adminLink +
        ' <button class="hw-btn" data-hw="signout">Sign out</button>';
    } else {
      el.innerHTML = '<button class="hw-btn" data-hw="signin">Sign in</button>';
    }
  }
  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-hw]");
    if (!b) return;
    if (b.dataset.hw === "signin") signIn();
    else if (b.dataset.hw === "signout") { try { sessionStorage.removeItem("hw-reloaded"); } catch (x) {} firebase.auth().signOut(); }
  });
  function signIn() {
    var p = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(p).catch(function (err) { console.warn("[hwAuth] sign-in:", err && err.message); });
  }

  /* ---------- gating: answer keys + locked lessons ---------- */
  function applyNavLocks() {
    // Locked lessons are hidden in nav by CSS (html.hw-lock-nav); reveal for parents.
    document.documentElement.classList.toggle("hw-lock-nav", !state.isParent());
  }
  function gate() {
    applyNavLocks();
    if (!IS_GATED) return;
    var html = document.documentElement;
    if (state.isParent()) { html.classList.remove("hw-gated"); return; }
    var main = document.getElementById("content");
    if (main) main.innerHTML = lockPanel();
    html.classList.remove("hw-gated"); // reveal the lock message (not the real content)
  }
  function lockPanel() {
    var lesson = IS_LOCKED_LESSON && !IS_ANSWER_KEY;
    var heading = lesson ? "Not available yet" : "Parents only";
    if (!state.user) {
      var line = lesson
        ? "This lesson isn't available yet. It's visible to parents — sign in with the family Google account to preview it."
        : "This answer key is for parents. Sign in with the family Google account to view it.";
      return '<div class="hw-lock"><h2>' + heading + "</h2><p>" + line + "</p>" +
        '<p><button class="hw-btn big" data-hw="signin">Sign in with Google</button></p></div>';
    }
    return '<div class="hw-lock"><h2>' + heading + "</h2>" +
      "<p>You're signed in, but this account doesn't have parent access yet. Ask the site admin to grant it.</p>" +
      '<p class="hw-muted">Your account id (give this to the admin): <code>' + esc(state.user.uid) + "</code></p></div>";
  }

  /* ---------- auth state ---------- */
  function onUser(user) {
    state.user = user;
    state.role = null;
    if (!user) { renderButton(); gate(); return; }
    var ref = state.db.collection("users").doc(user.uid);
    ref.get().then(function (snap) {
      var data = snap.exists ? snap.data() : {};
      state.role = data.role || null;
      // Upsert profile for the admin user-list (never touches role).
      ref.set({ displayName: user.displayName || "", email: user.email || "", lastSeen: Date.now() }, { merge: true }).catch(function () {});
      var changed = applyRemote(data.progress || {});
      renderButton();
      gate();
      pushProgress();
      if (changed) refreshAfterMerge();
    }).catch(function (e) {
      console.warn("[hwAuth] load user:", e && e.message);
      renderButton();
      gate();
    });
  }

  /* ---------- admin helpers (used by /admin.html) ---------- */
  state.grantParent = function (uid) {
    return state.db.collection("users").doc(uid).set({ role: "parent" }, { merge: true });
  };
  state.revokeParent = function (uid) {
    return state.db.collection("users").doc(uid).update({ role: firebase.firestore.FieldValue.delete() });
  };
  state.listUsers = function () {
    return state.db.collection("users").get().then(function (q) {
      return q.docs.map(function (d) { return Object.assign({ uid: d.id }, d.data()); });
    });
  };

  /* ---------- boot ---------- */
  (function init() {
    var chain = Promise.resolve();
    FILES.forEach(function (f) { chain = chain.then(function () { return loadScript(SDK + f); }); });
    chain.then(function () {
      firebase.initializeApp(CFG);
      state.db = firebase.firestore();
      installMirror();
      firebase.auth().onAuthStateChanged(onUser);
      state.ready = true;
      renderButton();
    }).catch(function (e) {
      console.warn("[hwAuth] init failed:", e && e.message);
      // Fail CLOSED on gated pages: show a message, never the real content, and
      // leave locked lessons hidden in nav.
      if (IS_GATED) {
        var main = document.getElementById("content");
        if (main) main.innerHTML = '<div class="hw-lock"><h2>Can’t verify access</h2>' +
          "<p>We couldn’t check your access just now. Check your connection and reload the page.</p></div>";
      }
      document.documentElement.classList.remove("hw-gated");
    });
  })();
})();
