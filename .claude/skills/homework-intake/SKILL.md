---
name: homework-intake
description: >-
  Turn a scan or photo of a homework worksheet into a study guide and quiz on
  this homework site, or add to an existing subject. Use when the user shares
  homework images, says "intake this worksheet", "add a subject", "diagnose this
  homework", "build a guide/quiz from this", or wants to refresh practice content
  for the learner. Organizes everything by subject, auto-manages site navigation,
  keeps parent answer keys discreet, reuses the existing theme, and never
  publishes the child's scans.
---

# Homework Intake

Build or extend this GitHub Pages homework site from a photo/scan of a worksheet.
The site helps one learner find and fix his own homework mistakes. Your job is to
read a worksheet, figure out what skill it tests and where he's struggling, and
produce original study + quiz content that targets those gaps — in the site's
existing style, organized by subject.

## The learner (default — assume this unless told otherwise)

- 11 years old, 6th grade, has ADHD.
- Design everything for him: short rounds, immediate one-line feedback, escalating
  hints that never give the answer, consistent color coding, large tap targets,
  plain encouraging copy, and roughly 1-in-6 "no error / trick" items so he learns
  not to overcorrect. Full rules in `references/design-system.md` — read it before
  writing any page.

### The real pattern: it's not content, it's expression + completion

Across his classes he **masters the content** (strong test scores) but loses points on
two things, in every subject:

1. **Written expression** — incomplete sentences and fragments, run-ons, thin answers
   that don't restate the question or explain the reasoning. He *can* do the work; he
   doesn't put it into clear, complete written form.
2. **Completing and checking work** — rushed, late, or incomplete items. He needs a
   slow-down/finish habit, not more content drills.

So the site's job is bigger than content recall. **Prefer content that also builds
written-expression and finish-it habits.** Use these house methods (keep the names — his
learning-center coach uses the same ones, so consistency matters):

- **CUPS+E** editing checklist: **C**apitals · **U**sage (who + did what) · **P**unctuation ·
  **S**pelling (homophones) · **+E**xpand (add a when/where/how/why detail).
- **ARMS** revision: **A**dd a detail · **R**emove what repeats · **M**ove a sentence ·
  **S**ubstitute a stronger word.
- **ACE** for explaining reasoning (math, science, history): **A**nswer in a complete
  sentence that restates the question · **C**alculate/state it with labels · **E**xplain
  why it's right.
- **STOP & CHECK** + whisper-read: the work isn't done until it's checked. Build this into
  every guide ("not done until every box is ticked") — it's the fix for late/incomplete work.

When you build or extend a subject, add an **"explain it / write it" angle** where it
fits (e.g. "which answer is stronger?", "fix the fragment", "restate the question"), not
just "what's the right answer?".

## What you accept as input

- **Any number of images and/or PDFs**, in one message or across several. Read images
  with vision; read PDFs page by page. A completed sheet (his pencil marks visible)
  lets you **diagnose** (found / missed / wrong fix); a blank sheet you use only to
  learn the skill being taught.
- A single input set may contain **several worksheets**, and those worksheets may span
  **several subjects** — so always start by grouping the inputs (step 0) before you
  build anything.
- Optional context from the user: subject name(s), which pages to target, error counts,
  or "just add N items."

### Multiple documents — how to handle them

- **Group first.** Sort the inputs into **worksheets**. One worksheet may be spread
  across several images or PDF pages (front/back, multi-page, or a close-up plus a wide
  shot) — keep those together. Different worksheets are processed separately.
- **When grouping is ambiguous, ask** before generating: confirm how many worksheets
  there are and which subject each belongs to. A wrong grouping produces wrong content.
- **Process one worksheet at a time** through the workflow below, but **batch all
  content for the same subject together** (one guide/quiz/answer-key update per subject,
  even if two worksheets target it) so you don't thrash the same files.
- **Report per worksheet.** Give a short diagnosis/summary for each, and note the
  subject each one landed in.

## Core rules (do not violate)

1. **Additive, never subtractive.** Add subjects, sections, and quiz items; update
   navigation. Never delete or rewrite existing content unless the user explicitly
   asks you to remove something.
2. **Reuse the base theme.** Use the existing cayman theme, the shared banner in
   `_includes/head-custom.html`, and the existing `grammar/quiz.html` engine as your
   reference implementation. Do not introduce a new theme or restyle existing pages.
3. **Copyright.** Never copy the worksheet's passages, problems, or wording onto the
   public site. Write **original** items that test the same skill.
4. **Privacy.** The repo and site are **public**. Never publish the child's name,
   school, photos of his work, or any mention of ADHD. Raw scans and diagnosis notes
   live only in `_intake/` (gitignored, never committed, never on the site).
5. **Answer keys are available but not advertised.** Each subject's answer key is a
   separate `answer-key.html`, linked only by a small "Parents:" note at the bottom
   of that subject's guide — never from the student quiz flow or the hub.
6. **Organize by subject.** Everything for a subject lives in its own top-level
   folder (`grammar/`, `math/`, `spelling/`, …).

## Repo map (where things go)

```
index.md                         Hub — generated from _data/subjects.yml (don't hand-edit)
_data/subjects.yml               Subject registry (name, slug, emoji, area, added date)
<subject>/
  index.md                       Study guide (cayman + base design)
  quiz.html                      Self-contained quiz (no build step, no deps)
  answer-key.html                Parent answer key (rendered from answer-key.md)
  answer-key.md                  Source for the above
_intake/                         GITIGNORED. Raw scans + diagnosis notes per subject.
_config.yml                      Jekyll config; excludes .claude and _intake
.claude/skills/homework-intake/  This skill (autoloaded, excluded from the site)
```

## Workflow

Follow these steps in order. Keep sessions short and the output focused.

### 0. Group the inputs into worksheets
Look at everything provided. Decide how many distinct **worksheets** there are, which
images/PDF pages belong to each (front/back and multi-page stay together), and which
**subject** each worksheet is. If this is at all ambiguous, state your grouping and
ask the user to confirm before generating. Then run steps 1–6 **per worksheet**, and
batch everything for the same subject into a single set of file updates.

### 1. Read the worksheet
Look at that worksheet's image(s)/page(s). Identify: the **subject**, the specific
**skill/topic** being taught, and — if his marks are visible — each planted error and
whether he **found** it, **missed** it, or applied a **wrong fix**. Note the error
counts if the sheet shows them.

### 2. Diagnose (completed sheets only)
Score it per skill/type (e.g. "Adverbs 2/5"). Map each miss to a gap. If a new kind
of mistake shows up that isn't already described in the subject guide, note it as a
new trap to add. Write the diagnosis to `_intake/<subject>/diagnosis-<date>.md` using
`templates/diagnosis.md`. This file is **never committed**.

### 3. Decide: new subject or existing?
- **New subject:** create `<subject>/` with a guide, quiz, and answer key from the
  templates (see step 4). Pick a subject **color** and **emoji** not already used by
  another subject (grammar uses 📝 and blue/green/orange).
- **Existing subject:** add to the guide and quiz in place, additively.

### 4. Create / update the pages
- **Guide** (`<subject>/index.md`): start from `templates/guide.md`. Keep the
  breadcrumb, the 3-pass method framing, the Wrong / Right / Clue table format, the
  cheat card, and the discreet parent link. Add only sections the worksheet justifies.
- **Quiz** (`<subject>/quiz.html`): see `references/quiz-format.md`. For
  editing / find-the-error subjects, **copy `grammar/quiz.html`** and swap its data
  and labels — do not rewrite the engine. For other subjects, build the
  multiple-choice variant described in that reference, preserving every ADHD behavior.
  Add **3–6 original items** per intake that target the diagnosed gaps. Keep at least
  one trick/no-error item per type where it makes sense.
- **Answer key** (`<subject>/answer-key.md` → `answer-key.html`): from
  `templates/answer-key.md`, if the subject's practice section has one.

### 5. Auto-manage navigation
- The hub (`index.md`) is **generated from `_data/subjects.yml`** — you don't edit the hub
  HTML. To add a subject, add an entry `{ name, slug, emoji, added: <today> }` under the
  matching `area:` block; if no area fits, add a new area block (`- area: … / emoji: … /
  subjects: …`). The `slug` must equal the folder name. Set `added` to today's date so the
  hub shows when it was added. Never remove existing entries.
- Every page's banner already links home ("← Homework Helper") via `_layouts/default.html`,
  so you don't add that. Still give each subject guide the breadcrumb `[← All subjects](../)`
  at the top, link the guide to its quiz, and link the answer key back to the guide; the
  quiz footer links to `./` (guide) and `../` (hub).
- **Progress:** every quiz, on finish, sets `localStorage['hw-done-<slug>']` to the date, and
  the hub shows a per-quiz "done" checkbox from it. New quizzes copied from an existing one
  must keep that line in `finish()` (swap the slug) so completion is tracked.

### 6. Write a short parent summary (completed sheets)
In your chat reply (not on the site): the score, the top gap, and one thing to
practice tonight. Keep it to a few lines.

### 7. Commit
Once every worksheet in the batch is processed, stage the derived content only
(guides, quizzes, answer keys, hub). Confirm `git status` shows nothing under
`_intake/`. Commit **per subject** (not per worksheet) with a clear message, e.g.
`Add 5 adverb items from a Passage 25 diagnosis` or
`Add Math Detective subject (multiplication facts)`. Do not push unless asked.

## Before you finish — checklist
- [ ] Every worksheet in the batch was processed, and each was reported with its subject.
- [ ] Nothing from `_intake/` is staged or committed.
- [ ] No worksheet text copied verbatim; items are original.
- [ ] Answer key (if any) is linked only from the guide's parent note.
- [ ] Hub card added between the markers; existing cards untouched.
- [ ] Each page has correct breadcrumb/quiz/back links.
- [ ] Quiz still self-contained (no new dependencies) and matches the color code.
- [ ] You added, didn't remove.
