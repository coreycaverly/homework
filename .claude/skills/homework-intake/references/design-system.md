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
   then a skill-specific detective question, then (only after repeated misses) the
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

## Color code quick reference (CSS tokens used in grammar/quiz.html)

- Adjective `--adj:#2563D9`, Adverb `--adv:#11875A`, Article `--art:#C9630F`
- Highlighter `--hl:#FFE14D`, miss/red `--miss:#D93A4A`
- These have dark-mode variants in the quiz's `:root` blocks — keep both when you
  copy the engine.
