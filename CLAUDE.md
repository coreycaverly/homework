# CLAUDE.md — Grammar Detective

Context for anyone (human or Claude) working on this repo.

## What this is

A GitHub Pages site that helps one 6th grader (age 11, ADHD) learn to **find and fix adjective, adverb, and article errors on his own**. It has two parts:

- **Study guide** (`index.md`): rules, traps, practice sentences, cheat card, parent answer key. Printable.
- **Quiz** (`quiz.html`): an interactive tap-to-find quiz with short rounds, hints, and stars.

**Planned:** a Claude skill that takes a photo of a new homework worksheet, diagnoses the errors he missed, and updates the guide and quiz bank to target those gaps.

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

## Design principles (ADHD-friendly)

1. **Short rounds.** 5–6 items per quiz round; one guide section per day, about 5 minutes each.
2. **Immediate feedback.** Every answer gets a one-line "why" rule, not just right or wrong.
3. **Escalating hints, never the answer.** First the read-aloud prompt, then the type-specific detective question, then the target word glows.
4. **Consistent color code everywhere:** Adjective = **blue**, Adverb = **green**, Article = **orange**. Highlighter yellow marks a found word.
5. **Trick items.** About 1 in 6 sentences has no error, to train him not to overcorrect.
6. **Readable type.** Lexend for body text (designed for reading ease), Bricolage Grotesque for headings. Large tap targets (44px or more).
7. **Plain, encouraging copy.** No "wrong!" language. Missed items lead to "Rules to remember" on the results screen.

## Repo layout

```
index.md      Study guide (Jekyll renders it; theme set in _config.yml)
quiz.html     Self-contained quiz: inline CSS + JS, no build step, no dependencies
_config.yml   Jekyll config (theme: jekyll-theme-cayman; excludes CLAUDE.md)
CLAUDE.md     This file
```

**Hosting:** GitHub Pages, deployed from branch `main`, folder `/ (root)`. A push to main redeploys in about 1 minute.

## Quiz data format

The question bank is the `BANK` array near the top of the `<script>` in `quiz.html`:

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

## The planned skill: what it should do

**Input:** a photo of a completed worksheet (his pencil marks plus the circle counts).

1. **Read** the passage, his corrections, and the error counts.
2. **Diagnose** each error as found, missed, or wrong fix. Give a per-type score (e.g. "Adverbs 2/5").
3. **Map** the misses to the gaps in the table above, adding a new row if a new pattern shows up.
4. **Add 3–6 original quiz items** that target the misses, following the rules above.
5. **Update `index.md`** only if a new trap appears. Add it under the matching section using the same Wrong / Right / Clue format.
6. **Write a short parent summary:** score, top gap, one thing to practice tonight.
7. **Commit** with a message like `Add 5 adverb items from Passage 25 diagnosis`.

## Privacy

- The site is **public**. Never publish the child's name, school, photos of his work, or mention of ADHD.
- Keep worksheet photos and diagnosis notes out of the repo, or in a private repo.
- The parent answer key is currently on the public page. Move it to a separate page or remove it if he shouldn't be able to see it.

## Ideas for later

- Saved progress per type, so the quiz serves more of whatever he misses most (`localStorage` already stores cases closed and stars).
- A "full passage" mode that mimics the worksheet format, with circle counters he crosses off.
- A `print.css` for a cleaner printed guide.
