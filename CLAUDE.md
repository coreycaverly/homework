# CLAUDE.md — Homework Helper

Context for anyone (human or Claude) working on this repo.

## What this is

A GitHub Pages homework site for one 6th grader (age 11, ADHD). It started as a single grammar unit and is now **multi-subject** (English, Math, Science, Spanish), each subject holding one or more **lessons**. Every lesson has:

- **Study guide** (`<lesson>/guide.html`): rules, traps, practice, cheat card, STOP & CHECK finish box. Printable.
- **Quiz** (`<lesson>/quiz.html`): a short interactive quiz (find-and-fix for editing lessons, multiple-choice otherwise) with hints, stars, and `localStorage` progress.
- **Answer key** (`<lesson>/answer-key.html`): kept off the student flow, linked only from the guide's parent note.

It's built so his real cross-class gaps — **written expression** and **completing/checking work** — are targeted, not just content recall (see "The bigger pattern" below). The **homework-intake skill** (`.claude/skills/homework-intake/`) turns a photo/scan of a worksheet into new lessons and quiz items.

**No theme gimmick:** plain names and plain copy — an earlier "Detective" theme was removed because he found it lame.

## The homework this supports

His class uses **Editor in Chief® Level 2** (The Critical Thinking Co.), unit "Adjectives, Adverbs, Articles." Each assignment is a short passage with planted errors. Circles in the top-right corner tell how many errors of each type are hidden (e.g. Adjective ①②③④, Adverb ①②③④⑤, Article ①②). The student marks his corrections in pencil.

**Copyright:** Do not copy Editor in Chief passages onto the public site. Write original sentences that test the same skills.

## Learner profile: what's tripping him up

This is based on Passage 23 "Deadly Dino" (he found 10 of 11 errors) and Passage 24 "Wish You Were Here" (he found about 5 of 11).

| Gap | Evidence | What to teach |
| --- | --- | --- |
| **Thinks adverbs = "-ly words"** (main gap) | Missed *Tomorrow→Yesterday*, *enoughly→enough*, *anywhere→there* | Adverbs answer **how / when / where / how much**. Not all end in -ly; some never take -ly (*enough, fast, hard, soon, there, yesterday*) |
| **Fixes form, not meaning** | Missed *better/worse → best/worst* and the past/future time mismatch | A read-aloud "does this make sense?" check for time words and comparisons |
| **Accuracy drops after paragraph 1** | 4 of 4 right in paragraph 1, 2 of 7 in paragraph 2 | Short chunks; a 3-pass method (one pass per error type) |
| **Doesn't use the error count** | Stopped with 3 adverb circles still open | "Not done until every circle is crossed off" |

**Strengths:** He reliably catches nouns used as adjectives (*power → powerful*), missing -ly (*popular → popularly*), -er/-est in obvious cases, and *a/an* before vowels.

### The bigger pattern (all subjects)

Across every class, he **masters the content** (strong test scores) but loses points on two things: **written expression** (incomplete sentences, run-ons, thin answers that don't restate the question or explain the reasoning) and **completing/turning in work** (rushed, late, or incomplete). So the site aims past content recall: it builds written-expression and finish-it habits using the house methods **CUPS+E** (edit), **ARMS** (revise), **ACE** (explain reasoning), and a **STOP & CHECK** finish box. The `writing/` subject is the cross-subject toolkit; other subjects should add an "explain it / write it" angle where it fits. (Full guidance lives in the homework-intake skill.)

## Design principles (ADHD-friendly)

1. **Short rounds.** 5–6 items per quiz round; one guide section per day, about 5 minutes each.
2. **Immediate feedback.** Every answer gets a one-line "why" rule, not just right or wrong.
3. **Escalating hints, never the answer.** First the read-aloud prompt, then the type-specific question, then the target word glows.
4. **Consistent color code everywhere:** Adjective = **blue**, Adverb = **green**, Article = **orange**. Highlighter yellow marks a found word.
5. **Trick items.** About 1 in 6 sentences has no error, to train him not to overcorrect.
6. **Readable type.** Lexend for body text (designed for reading ease), Bricolage Grotesque for headings. Large tap targets (44px or more).
7. **Plain, encouraging copy.** No "wrong!" language. Missed items lead to "Rules to remember" on the results screen.

## Repo layout

```
index.md               Hub — a calm menu generated from _data/subjects.yml (areas → subjects)
_data/subjects.yml     Subject registry (name, slug, emoji, area, added date, blurb)
grammar/
  index.md             Subject LANDING: Guide + Quiz buttons + date/progress (reads the registry)
  guide.md             Grammar study guide → /grammar/guide.html (theme set in _config.yml)
  quiz.html            Quiz: a Jekyll page (layout: default) that renders inside the
                       site theme; inline CSS + JS wrapped in {% raw %}, no external deps
  answer-key.html      Parent answer key (rendered from answer-key.md), kept off the guide
_includes/
  head-custom.html     Shared banner styling (ruled-notebook-paper look)
_layouts/
  default.html         Cayman layout override that strips the "View on GitHub" / owner links
_config.yml            Jekyll config (theme: jekyll-theme-cayman; excludes CLAUDE.md, .claude, _intake)
CLAUDE.md              This file
_intake/               GITIGNORED: raw worksheet scans + diagnosis notes (never committed/published)
.claude/skills/homework-intake/   The intake skill (autoloaded by Claude Code, excluded from the site)
```

**Navigation (3 levels, all from `_data/subjects.yml`):** the **root** (`index.md`) is a short menu of **areas** (English, Math, Science, Spanish). An area with several subjects has an **area page** (`<area>/index.md`, e.g. `english/`) listing them; a single-subject area links straight to the subject. Each **subject** folder has a **landing** (`index.md`: Guide + Quiz buttons + date/progress), a **guide** (`guide.md`), a **quiz**, and an **answer key**. Every page's banner links home. The **homework-intake skill** creates and wires these up (see below).

**URLs:** root `/` (areas) · area `/english/` · subject landing `/grammar/` · guide `/grammar/guide.html` · quiz `/grammar/quiz.html` · answer key `/grammar/answer-key.html`.

**Progress:** each quiz writes `localStorage['hw-done-<slug>']` on finish; the hub and the subject landing read it to show a "done" check (per-device, client-only).

**Hosting:** GitHub Pages, deployed from branch `main`, folder `/ (root)`, classic branch build (no GitHub Action). A push to main redeploys in about 1 minute.

## Quiz data format

The question bank is the `BANK` array near the top of the `<script>` in `grammar/quiz.html`:

```js
{t:'adv',                                   // 'adj' | 'adv' | 'art'
 s:"The puppy ran quick across the yard.",  // sentence, words separated by single spaces
 w:"quick",                                 // the wrong word exactly as written (punctuation stripped), or null for a no-error item
 fix:"quickly",                             // the correct word
 o:["quicker","quickness"],                 // 2 distractors, which must be WRONG in context
 why:"How did it run? Quickly. It describes the verb ran, so it needs -ly."}
```

**Rules for adding items:**

- `w` must appear **only once** in the sentence. The code matches the first token whose text equals `w` after punctuation is stripped.
- Each item has exactly one error. The type `t` is the type of the **correct** word (*terribly → terrible* is `adj`).
- Distractors must be clearly wrong. Avoid options that would also be grammatical, like "better" for "Mia did good."
- Keep at least 1 no-error item per type.
- The bank has about 12 items per type. Aim for 15–20.

**Suggested refactor before the skill exists:** move `BANK` to `data/questions.json` and load it with `fetch('data/questions.json')`, so the skill edits JSON instead of JavaScript.

## The homework-intake skill

Implemented at `.claude/skills/homework-intake/` (autoloaded by Claude Code, excluded
from the published site). It turns a scan/photo of a worksheet into a study guide and
quiz, organized by subject, reusing the base theme, auto-managing navigation, and
keeping answer keys and the child's scans private. Its SKILL.md and `references/` hold
the full workflow; the summary below is the original intent it was built from.

**Input:** a photo of a completed worksheet (his pencil marks plus the circle counts).

1. **Read** the passage, his corrections, and the error counts.
2. **Diagnose** each error as found, missed, or wrong fix. Give a per-type score (e.g. "Adverbs 2/5").
3. **Map** the misses to the gaps in the table above, adding a new row if a new pattern shows up.
4. **Add 3–6 original quiz items** that target the misses, following the rules above.
5. **Update `grammar/index.md`** only if a new trap appears. Add it under the matching section using the same Wrong / Right / Clue format. (If it reveals a missing answer-key entry, update `grammar/answer-key.md` too.)
6. **Write a short parent summary:** score, top gap, one thing to practice tonight.
7. **Commit** with a message like `Add 5 adverb items from Passage 25 diagnosis`.

## Privacy

- The site is **public**. Never publish the child's name, school, photos of his work, or mention of ADHD.
- Keep worksheet photos and diagnosis notes out of the repo, or in a private repo.
- The parent answer key lives on its own page (`grammar/answer-key.html`), linked only by a small note at the bottom of the guide — not in the student's quiz flow. The site is public, so this is obscurity, not real gating; if he must not reach it, move the key to a private repo instead.

## Ideas for later

- Saved progress per type, so the quiz serves more of whatever he misses most (`localStorage` already stores cases closed and stars).
- A "full passage" mode that mimics the worksheet format, with circle counters he crosses off.
- A `print.css` for a cleaner printed guide.
