/* Homework Helper — inline practice answers.
 *
 * Turns each item of a guide's practice list into an answer box: type an answer and
 * Check it against the guide's answer key (instant ✓/✗), or tap 💬 to get AI coaching
 * on that specific question. Driven by a <div class="hw-practice" data-kind="…"
 * data-answers='["..",...]'> placed right after the practice <ol>. Answers are optional
 * (no answers → feedback-only). No-op if there's no practice marker.
 */
(function () {
  "use strict";
  var marker = document.querySelector(".hw-practice");
  if (!marker) return;
  var KIND = marker.getAttribute("data-kind") || "math";
  var ANSWERS = [];
  try { ANSWERS = JSON.parse(marker.getAttribute("data-answers") || "[]"); } catch (e) {}

  var ol = null, el = marker.previousElementSibling;
  while (el) { if (el.tagName === "OL") { ol = el; break; } el = el.previousElementSibling; }
  if (!ol) return;

  injectStyles();
  var items = ol.querySelectorAll(":scope > li");
  for (var i = 0; i < items.length; i++) enhance(items[i], i);

  function esc(s) { return ("" + (s == null ? "" : s)).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function qtext(li) {
    var clone = li.cloneNode(true);
    var ui = clone.querySelector(".hw-pr"); if (ui) ui.parentNode.removeChild(ui);
    return (clone.textContent || "").replace(/\s+/g, " ").replace(/_{2,}.*$/, "").trim();
  }

  function enhance(li, i) {
    var hasAns = ANSWERS[i] != null && ANSWERS[i] !== "";
    var wrap = document.createElement("span");
    wrap.className = "hw-pr";
    wrap.innerHTML =
      '<input class="hw-pr-in" type="text" aria-label="Your answer" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="your answer">' +
      (hasAns ? '<button class="hw-pr-btn" data-act="check">Check</button>' : "") +
      '<button class="hw-pr-btn hw-pr-fb" data-act="fb" title="Get feedback">💬</button>' +
      '<span class="hw-pr-res" aria-live="polite"></span>';
    li.appendChild(wrap);
    var inp = wrap.querySelector(".hw-pr-in");
    var res = wrap.querySelector(".hw-pr-res");

    wrap.addEventListener("click", function (e) {
      var b = e.target.closest("[data-act]"); if (!b) return;
      if (b.dataset.act === "check") doCheck();
      else if (b.dataset.act === "fb") doFeedback(b);
    });
    inp.addEventListener("keydown", function (e) {
      if (e.key === "Enter") { e.preventDefault(); hasAns ? doCheck() : doFeedback(); }
    });

    function doCheck() {
      var v = inp.value.trim();
      if (!v) { res.className = "hw-pr-res"; res.textContent = "type an answer"; return; }
      if (isCorrect(v, ANSWERS[i])) { res.className = "hw-pr-res ok"; res.textContent = "✓ correct"; }
      else { res.className = "hw-pr-res no"; res.textContent = "not quite — try again"; }
    }
    function doFeedback(btn) {
      if (btn) btn.disabled = true;
      res.className = "hw-pr-res"; res.innerHTML = '<span class="hw-pr-spin" aria-hidden="true"></span> coach is thinking…';
      sendCoach(qtext(li), inp.value.trim(), res, function () { if (btn) btn.disabled = false; });
    }
  }

  function norm(s) {
    return (s || "").toString().toLowerCase()
      .replace(/−/g, "-").replace(/½/g, ".5").replace(/¼/g, ".25").replace(/¾/g, ".75")
      .replace(/[$%]/g, "")
      .replace(/\b(square units|units|km|cm|mm|quadrant)\b/g, "")
      .replace(/[a-z]\s*=\s*/g, "")
      .replace(/[,\s]/g, "");
  }
  function isCorrect(his, key) {
    var a = norm(his), b = norm(key);
    if (!a) return false;
    if (a === b) return true;
    var na = parseFloat(a), nb = parseFloat(b);
    if (isFinite(na) && isFinite(nb) && Math.abs(na - nb) < 1e-9 &&
        a.replace(/[^0-9.\-]/g, "") === a && b.replace(/[^0-9.\-]/g, "") === b) return true;
    return false;
  }

  // ---- AI coach (reuses the feedbackRequests queue) ----
  function ready(cb, n) {
    n = n || 0;
    if (window.hwAuth && window.hwAuth.db) return cb(window.hwAuth);
    if (n > 60) return cb(null);
    setTimeout(function () { ready(cb, n + 1); }, 250);
  }
  function sendCoach(question, answer, res, done) {
    if (!window.HW_FIREBASE_READY) { fail(res, "feedback isn't set up"); return done && done(); }
    ready(function (A) {
      if (!A) { fail(res, "coach unavailable"); return done && done(); }
      if (!A.user) { res.className = "hw-pr-res"; res.innerHTML = '<button class="hw-pr-link" data-hw="signin">sign in</button> for feedback'; return done && done(); }
      var input = "Practice question: " + question + "\n\nMy answer:\n" + (answer || "(left blank)");
      var ref, un;
      var to = setTimeout(function () { if (un) un(); if (ref) ref.delete().catch(function () {}); fail(res, "coach offline — try later"); done && done(); }, 150000);
      A.db.collection("feedbackRequests").add({
        uid: A.user.uid, kind: KIND, input: input, status: "pending",
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      }).then(function (r) {
        ref = r;
        un = r.onSnapshot(function (sn) {
          var d = sn.data(); if (!d) return;
          if (d.status === "done") { clearTimeout(to); un(); showFb(res, d.response); r.delete().catch(function () {}); done && done(); }
          else if (d.status === "error") { clearTimeout(to); un(); fail(res, "try again"); r.delete().catch(function () {}); done && done(); }
        });
      }).catch(function () { clearTimeout(to); fail(res, "couldn't send"); done && done(); });
    });
  }
  function fail(res, msg) { res.className = "hw-pr-res no"; res.textContent = msg; }
  function showFb(res, txt) {
    res.className = "hw-pr-res";
    res.textContent = "";
    var box = document.createElement("div");
    box.className = "hw-pr-fbbox";
    box.textContent = txt;
    res.appendChild(box);
  }

  function injectStyles() {
    if (document.getElementById("hw-pr-css")) return;
    var s = document.createElement("style"); s.id = "hw-pr-css";
    s.textContent =
      ".hw-pr{display:inline-flex;flex-wrap:wrap;align-items:center;gap:6px;margin-left:8px;vertical-align:middle}" +
      ".hw-pr-in{width:9rem;max-width:45vw;padding:6px 10px;border:1px solid #cdd3e4;border-radius:8px;font:inherit;font-size:.95rem;min-height:36px}" +
      ".hw-pr-in:focus{outline:2px solid #0d9488;outline-offset:1px;border-color:#0d9488}" +
      ".hw-pr-btn{font:inherit;font-size:.85rem;font-weight:600;cursor:pointer;border:1px solid #cdd3e4;background:#fff;color:#16233b;border-radius:8px;padding:6px 10px;min-height:36px}" +
      ".hw-pr-btn:hover{border-color:#0d9488}.hw-pr-btn:disabled{opacity:.5;cursor:default}" +
      ".hw-pr-fb{padding:6px 9px}" +
      ".hw-pr-link{font:inherit;cursor:pointer;border:0;background:none;color:#0d6b64;text-decoration:underline;padding:0}" +
      ".hw-pr-res{font-size:.9rem;font-weight:600}" +
      ".hw-pr-res.ok{color:#15803d}.hw-pr-res.no{color:#be185d}" +
      ".hw-pr-fbbox{display:block;flex-basis:100%;font-weight:400;color:#16233b;background:#eefcf6;border:1px solid #bfe9d8;border-radius:10px;padding:10px 12px;margin-top:6px;white-space:pre-wrap;line-height:1.45}" +
      ".hw-pr-spin{display:inline-block;width:12px;height:12px;border:2px solid #cdd3e4;border-top-color:#0d9488;border-radius:50%;animation:hwprspin .8s linear infinite;vertical-align:middle}" +
      "@keyframes hwprspin{to{transform:rotate(360deg)}}" +
      "@media (prefers-reduced-motion:reduce){.hw-pr-spin{animation:none}}" +
      "@media (max-width:540px){.hw-pr{margin-left:0;margin-top:6px}}";
    document.head.appendChild(s);
  }
})();
