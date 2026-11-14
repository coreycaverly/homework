# Design system (read before writing any page)

Everything you generate must match what's already on the site. Reuse, don't reinvent.

## The base theme

- **Guides** (`<subject>/index.md`) are Markdown rendered by Jekyll with the
  `jekyll-theme-cayman` theme (set in `_config.yml`). The banner is styled by the
  shared `_includes/head-custom.html` (ruled-notebook-paper look) — it applies to
  every page automatically. Do not add per-subject theme CSS unless asked.
- **Quizzes** (`<subject>/quiz.html`) are **Jekyll pages that use the site theme** so
  they match the guides. Each one starts with front matter (`title:` + `layout: default`),
  then the quiz body wrapped in `{% raw %} … {% endraw %}` (so Liquid leaves the JS
  alone): a `<div id="app"></div>`, a `.quiz-nav` footer, a scoped `<style>`, and the
  `<script>`. No `<!doctype>`/`<head>`/`<body>` — the theme supplies the banner,
  background, fonts, and footer. Style only the quiz UI, scoped under `#app`; no
  dark-mode palette (the theme is light). Model new quizzes on `grammar/quiz.html`.

## ADHD-friendly principles (non-negotiable)

1. **Short rounds.** 5–6 items per quiz round; one guide section ≈ 5 minutes.
2. **Immediate feedback.** Every answer gets a one-line "why" rule, not just
   right/wrong.
3. **Escalating hints, never the answer.** First a read-aloud / re-check prompt,
   then a skill-specific question, then (only after repeated misses) the
   target glows or is pointed at.
4. **Consistent color code.** Grammar uses Adjective = **blue**, Adverb = **green**,
   Article = **orange**; a found/fixed word is highlighter **yellow**. A new subject
   picks its own small, consistent palette and uses it everywhere (guide + quiz).
5. **Trick items.** About 1 in 6 items has no error / is already correct, to train
   against overcorrecting. Keep at least one per type where it makes sense.
6. **Readable type, large targets.** Tap targets ≥ 44px. The quiz uses Lexend for
   body and Bricolage Grotesque for headings; keep those.
7. **Plain, encouraging copy.** No "wrong!" language. Missed items lead to a
   "Rules to remember" recap, never scolding.
8. **Chunk + pass structure.** Guides teach a multi-pass method (one pass per error
   type / skill), stress that paragraph 2 counts as much as paragraph 1, and frame
   completion as "not done until every circle is crossed off."
9. **Write it + finish it.** His real gaps are written expression and completing work
   (see SKILL.md). Favor content that builds complete-sentence, restate-and-explain
   habits, and end every guide with a **STOP & CHECK** finish box.

## House methods (use these names and shapes site-wide)

These are the frameworks his learning center uses — keep the names so everything matches.

- **CUPS+E** (editing): Capitals · Usage (who + did what) · Punctuation · Spelling
  (homophones: to/too/two, there/their/they're) · +Expand (add when/where/how/why).
- **ARMS** (revision): Add a detail · Remove what repeats · Move a sentence · Substitute
  a stronger word.
- **ACE** (explain reasoning in any subject): Answer in a complete sentence that restates
  the question · Calculate/state it with labels (not bare numbers) · Explain why.
- **STOP & CHECK** finish box: a short checklist a session isn't done until every box is
  ticked (e.g. "☐ complete sentences ☐ capitals & end marks ☐ I whisper-read it"). Put one
  at the end of guides and practice sections. This is the fix for rushed/late/incomplete work.
- **Slow-down steps:** who + did what? → whisper-read (period where your voice stops) →
  CUPS+E check. "Restate the question" is the default first sentence of any written answer.

A good "written expression" quiz mixes: homophone/capital fixes, "sentence vs. fragment
vs. run-on", and "which explanation is stronger?" (the ACE one). Use the multiple-choice
engine for these.

## Guide format conventions

- Front matter: `--- \n title: <Subject> Study Guide \n ---`.
- First line after front matter: breadcrumb `[← All subjects](../) · **<Subject>**`.
- Teach traps with a **Wrong / Right / Clue** table:

  | Wrong | Right | Clue |
  | --- | --- | --- |
  | its **power** hind legs | its **powerful** hind legs | power is a thing; powerful describes |

- Include a **cheat card** (cut-out summary) and short **practice** rounds.
- Last line: a small parent note linking the answer key:
  `<small>Parents: the [answer key for the practice section](answer-key.html) is on a separate page.</small>`

## Practice answers + AI coach (every guide's practice list is interactive)

Each guide's practice list becomes on-page answer boxes via `assets/practice.js`. The
learner types an answer and either **Check**s it (instant ✓/✗) or taps **💬** for AI
coaching on that one question (a local model on the "Dune" box, through a Firestore
queue — the full backend is in `CLAUDE.md` under "Inline practice answers + AI coach").
When you write a guide, do these three things:

1. **One question per line.** Each practice item must be its own list line (`1.`, `2.`, …
   on separate lines) so it renders as its own `<li>` and gets its own box. Do **not**
   pack several questions onto one line — that renders as a single item with one box.
2. **Add the marker right after the practice `<ol>`** (before the Cheat card):

   ```
   <div class="hw-practice" data-kind="KIND" data-answers='["ANS_1","ANS_2"]'></div>
   <script src="{{ '/assets/practice.js' | relative_url }}" defer></script>
   ```
3. **Pick `data-kind` and `data-answers`:**
   - `data-kind` chooses the coaching prompt + model: **`paragraph`** or **`paraphrase`**
     (editing/writing), **`research`** (restate + what/when/where/why, in own words),
     **`math`** (reasons to catch a wrong answer, never reveals it). Default to `math`
     for any subject with equations/computation; use the writing kinds for English.
   - `data-answers` is a JSON array with **one answer per question, in the same order**.
     Include it when each question has a definite answer (adds the instant ✓/✗ Check).
     **Omit it** for open/free-response practice (💬 AI feedback only) — e.g. "explain
     it", paraphrasing, research answers. Keep answers in the canonical form a 6th grader
     would type (`"30 square units"`, `"$48"`, `"x = 6"`, `"−6"`); the matcher is lenient
     (strips `$ %`, units, `x =`, normalizes `−`/`½`, numeric-compares) but keep them simple.

To add a **new feedback kind + model** (e.g. a dedicated science or history model), add a
`FOCUS` prompt in `tools/feedback-worker/worker.js` and a kind→model entry in
`tools/feedback-worker/models.json` — no site change beyond the new `data-kind`.

## Color code quick reference (CSS tokens used in grammar/quiz.html)

## Color code quick reference (CSS tokens used in grammar/quiz.html)

- Adjective `--adj:#2563D9`, Adverb `--adv:#11875A`, Article `--art:#C9630F`
- Highlighter `--hl:#FFE14D`, miss/red `--miss:#D93A4A`
- These have dark-mode variants in the quiz's `:root` blocks — keep both when you
  copy the engine.
