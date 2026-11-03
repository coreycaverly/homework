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

## What you accept as input

- One or more **images** of a worksheet (completed with his pencil marks, or blank).
  Read them with vision. A completed sheet lets you **diagnose** (found / missed /
  wrong fix); a blank sheet you use only to learn the skill being taught.
- Optional context from the user: subject name, which pages to target, error counts,
  or "just add N items."

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
index.md                         Hub. Subject cards live between the
                                 <!-- homework-intake:subjects:start/end --> markers.
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

### 1. Read the worksheet
Look at the image(s). Identify: the **subject**, the specific **skill/topic** being
taught, and — if his marks are visible — each planted error and whether he **found**
it, **missed** it, or applied a **wrong fix**. Note the error counts if the sheet
shows them.

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
- **New subject:** insert a subject card just before
  `<!-- homework-intake:subjects:end -->` in `index.md`. Never touch existing cards.
- Ensure every subject page has the breadcrumb `[← All subjects](../)` at the top,
  the guide links to its quiz, and the answer key links back to the guide. The quiz's
  footer links to `./` (guide) and `../` (hub). These are the only nav you manage.

### 6. Write a short parent summary (completed sheets)
In your chat reply (not on the site): the score, the top gap, and one thing to
practice tonight. Keep it to a few lines.

### 7. Commit
Stage the derived content only (guides, quizzes, answer keys, hub). Confirm
`git status` shows nothing under `_intake/`. Commit with a clear message, e.g.
`Add 5 adverb items from a Passage 25 diagnosis` or
`Add Math Detective subject (multiplication facts)`. Do not push unless asked.

## Before you finish — checklist
- [ ] Nothing from `_intake/` is staged or committed.
- [ ] No worksheet text copied verbatim; items are original.
- [ ] Answer key (if any) is linked only from the guide's parent note.
- [ ] Hub card added between the markers; existing cards untouched.
- [ ] Each page has correct breadcrumb/quiz/back links.
- [ ] Quiz still self-contained (no new dependencies) and matches the color code.
- [ ] You added, didn't remove.
