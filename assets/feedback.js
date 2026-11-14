/* Homework Helper — "Get writing feedback" widget.
 *
 * Renders into <div id="hw-coach" data-kind="paragraph|paraphrase">. The learner
 * types their writing; we drop a request into Firestore (feedbackRequests), a local
 * worker on Dune runs a model and writes the coaching back, and we show it live.
 * The browser never talks to Ollama — only to Firestore. Deletes the request after
 * it's read. No-op if Firebase auth isn't configured.
 */
(function () {
  "use strict";
  var host = document.getElementById("hw-coach");
  if (!host) return;
  if (!window.HW_FIREBASE_READY) { return; } // auth not set up → quietly skip

  var KIND = host.getAttribute("data-kind") || "paragraph";
  var LABELS = { paragraph: "paragraph", paraphrase: "paraphrase", research: "research answer", math: "explanation" };
  var LABEL = LABELS[KIND] || "writing";
  var TIMEOUT_MS = 150000; // after this with no reply, assume the coach is offline
  var esc = function (s) { return ("" + (s == null ? "" : s)).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); };

  injectStyles();
  renderIntro();

  function ready(cb, tries) {
    tries = tries || 0;
    if (window.hwAuth && window.hwAuth.db) return cb(window.hwAuth);
    if (tries > 60) return cb(null); // ~15s
    setTimeout(function () { ready(cb, tries + 1); }, 250);
  }

  function renderIntro() {
    host.innerHTML =
      '<div class="coach-card">' +
        '<div class="coach-head"><span class="coach-emoji" aria-hidden="true">💬</span>' +
        '<div><b>Get writing feedback</b><small>A coach reads your writing and gives friendly tips. It never writes it for you.</small></div></div>' +
        '<textarea id="coach-in" class="coach-ta" rows="6" placeholder="Paste or type your ' +
        LABEL + ' here…"></textarea>' +
        '<div class="coach-row"><button id="coach-go" class="coach-btn">Get feedback</button>' +
        '<span id="coach-note" class="coach-note"></span></div>' +
        '<div id="coach-out" class="coach-out" hidden></div>' +
      "</div>";
    document.getElementById("coach-go").onclick = submit;
  }

  function note(t) { var n = document.getElementById("coach-note"); if (n) n.textContent = t || ""; }
  function setBusy(b) {
    var btn = document.getElementById("coach-go");
    if (btn) { btn.disabled = b; btn.textContent = b ? "Coaching…" : "Get feedback"; }
  }
  function showOut(html, cls) {
    var out = document.getElementById("coach-out");
    out.hidden = false; out.className = "coach-out " + (cls || "");
    out.innerHTML = html;
  }

  function submit() {
    var ta = document.getElementById("coach-in");
    var text = (ta.value || "").trim();
    if (text.length < 15) { note("Write a little more first (at least a sentence or two)."); return; }
    ready(function (A) {
      if (!A) { note("Feedback isn't available right now."); return; }
      if (!A.user) {
        note("");
        showOut('<p>Sign in to get feedback on your writing.</p>' +
          '<p><button class="coach-btn" data-hw="signin">Sign in with Google</button></p>', "");
        return;
      }
      sendRequest(A, text);
    });
  }

  function sendRequest(A, text) {
    setBusy(true); note("Sending to the coach…");
    showOut('<div class="coach-think"><span class="coach-spin" aria-hidden="true"></span>' +
      'The coach is reading your writing…</div>', "");
    var ref;
    var timer = setTimeout(function () {
      cleanup();
      showOut("<p>The coach seems to be offline right now. Try again in a bit — your work is safe.</p>", "coach-warn");
      setBusy(false); note("");
      if (ref) ref.delete().catch(function () {});
    }, TIMEOUT_MS);
    var unsub = null;
    function cleanup() { clearTimeout(timer); if (unsub) { try { unsub(); } catch (e) {} unsub = null; } }

    A.db.collection("feedbackRequests").add({
      uid: A.user.uid,
      kind: KIND,
      input: text,
      status: "pending",
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    }).then(function (r) {
      ref = r;
      unsub = r.onSnapshot(function (snap) {
        var d = snap.data(); if (!d) return;
        if (d.status === "done") {
          cleanup(); setBusy(false); note("");
          showOut('<div class="coach-label">Your coach says</div>' + format(d.response), "coach-done");
          r.delete().catch(function () {}); // privacy: remove after reading
        } else if (d.status === "error") {
          cleanup(); setBusy(false); note("");
          showOut("<p>" + esc(d.error || "Something went wrong. Try again.") + "</p>", "coach-warn");
          r.delete().catch(function () {});
        } else if (d.status === "processing") {
          showOut('<div class="coach-think"><span class="coach-spin" aria-hidden="true"></span>' +
            'The coach is thinking…</div>', "");
        }
      }, function () { cleanup(); setBusy(false); showOut("<p>Couldn’t reach the coach. Try again.</p>", "coach-warn"); });
    }).catch(function (e) {
      cleanup(); setBusy(false); note("");
      showOut("<p>Couldn’t send that. Try again.</p>", "coach-warn");
      console.warn("[coach]", e && e.message);
    });
  }

  // Render the model's text simply: paragraphs + "- " bullet lines.
  function format(txt) {
    var lines = String(txt || "").split(/\n+/).map(function (l) { return l.trim(); }).filter(Boolean);
    var html = "", inList = false;
    lines.forEach(function (l) {
      var m = l.match(/^[-*•]\s+(.*)$/);
      if (m) { if (!inList) { html += "<ul>"; inList = true; } html += "<li>" + esc(m[1]) + "</li>"; }
      else { if (inList) { html += "</ul>"; inList = false; } html += "<p>" + esc(l) + "</p>"; }
    });
    if (inList) html += "</ul>";
    return html;
  }

  function injectStyles() {
    if (document.getElementById("coach-css")) return;
    var s = document.createElement("style");
    s.id = "coach-css";
    s.textContent =
      "#hw-coach{max-width:560px;margin:1.5rem auto 0}" +
      ".coach-card{background:#fff;border:1px solid rgba(20,30,60,.12);border-radius:16px;padding:20px;box-shadow:0 1px 3px rgba(20,30,60,.06)}" +
      ".coach-head{display:flex;gap:12px;align-items:flex-start;margin-bottom:12px}" +
      ".coach-emoji{font-size:1.6rem;line-height:1}" +
      ".coach-head b{display:block;font-size:1.1rem;color:#16233b}" +
      ".coach-head small{color:#8b93b0}" +
      ".coach-ta{width:100%;box-sizing:border-box;border:1px solid #cdd3e4;border-radius:12px;padding:12px;font:inherit;font-size:1rem;line-height:1.45;resize:vertical;min-height:120px}" +
      ".coach-ta:focus{outline:3px solid #0d9488;outline-offset:1px;border-color:#0d9488}" +
      ".coach-row{display:flex;align-items:center;gap:12px;margin-top:12px;flex-wrap:wrap}" +
      ".coach-btn{font:inherit;font-weight:600;font-size:1rem;cursor:pointer;color:#fff;background:#0d9488;border:0;border-radius:12px;padding:12px 18px;min-height:44px}" +
      ".coach-btn:hover{background:#0b7c71}.coach-btn:disabled{opacity:.6;cursor:default}" +
      ".coach-note{color:#8b93b0;font-size:.9rem}" +
      ".coach-out{margin-top:14px;border-radius:12px;padding:14px;background:#f4f7fb;border:1px solid #e2e6f0;color:#16233b}" +
      ".coach-out.coach-done{background:#eefcf6;border-color:#bfe9d8}" +
      ".coach-out.coach-warn{background:#fff6ed;border-color:#f3d9b8}" +
      ".coach-out p{margin:.4rem 0}.coach-out ul{margin:.4rem 0;padding-left:1.2rem}.coach-out li{margin:.25rem 0}" +
      ".coach-label{font-size:.72rem;letter-spacing:.08em;text-transform:uppercase;font-weight:700;color:#0d9488;margin-bottom:.3rem}" +
      ".coach-think{display:flex;align-items:center;gap:10px;color:#5b6386}" +
      ".coach-spin{width:16px;height:16px;border:3px solid #cdd3e4;border-top-color:#0d9488;border-radius:50%;display:inline-block;animation:coachspin .8s linear infinite}" +
      "@keyframes coachspin{to{transform:rotate(360deg)}}" +
      "@media (prefers-reduced-motion:reduce){.coach-spin{animation:none}}";
    document.head.appendChild(s);
  }
})();
