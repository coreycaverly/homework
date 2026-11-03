# Quiz format (how to build a subject quiz)

The canonical engine is `grammar/quiz.html`. Read it before building a quiz. It is a
single self-contained HTML file: inline CSS, a `BANK` data array near the top of the
`<script>`, and a small state machine that runs each item through phases
**find → fix → (name the type) → done**, with escalating hints, stars, and
`localStorage` progress. Reuse this; don't rebuild it from scratch.

There are two quiz styles. Pick by subject.

## Style A — Find & fix (editing subjects)

Best for grammar, editing, proofreading, punctuation, capitalization — anything where
the task is "spot the wrong word in a sentence and correct it." **Copy
`grammar/quiz.html`** and change only the data/config:

- `BANK` — the items. Each item:

  ```js
  {t:'adv',                                   // type key: 'adj' | 'adv' | 'art' (your subject's types)
   s:"The puppy ran quick across the yard.",  // sentence, words separated by single spaces
   w:"quick",                                 // the wrong word exactly as written (punctuation stripped), or null for a no-error item
   fix:"quickly",                             // the correct word
   o:["quicker","quickness"],                 // 2 distractors, which must be WRONG in context
   why:"How did it run? Quickly. It describes the verb ran, so it needs -ly."}
  ```

- `NAME`, `HINT`, `RULE`, and the color tokens / topic labels for your subject's types.

**Rules for items** (same as the site's existing rules):
- `w` must appear **only once** in the sentence; the code matches the first token
  equal to `w` after punctuation is stripped.
- Exactly one error per item. `t` is the type of the **correct** word
  (*terribly → terrible* is an adjective item).
- Distractors must be clearly wrong — never an option that would also be grammatical.
- Keep at least one no-error item per type.
- Aim for ~15–20 items per type over time; add 3–6 per intake.

## Style B — Multiple choice (question subjects)

Best for math facts, vocabulary, science terms, spelling, definitions — anything that
is a question with one right answer. Keep the **same engine shape and every ADHD
behavior** (short rounds, one-line why, escalating hints, stars, `localStorage`,
color per type, ≥44px targets, encouraging copy, ~1-in-6 trick where sensible).
Reuse the CSS and the state/stars/results code from `grammar/quiz.html`; replace the
find/fix phases with a single choose-the-answer phase. Item shape:

```js
{t:'mult',                                  // type/topic key for color + grouping
 q:"What is 7 × 8?",                         // the question (use `prompt`/`q`, not a sentence to tap)
 a:"56",                                     // the correct answer
 o:["54","48","63"],                         // 3 distractors, plausible but wrong
 why:"7 × 8 = 56. Think 7 × 8 = (7 × 4) × 2 = 28 × 2."}
```

Render the question as a prompt and the choices as the existing `.choice` buttons.
A "trick" item in this style is one whose obvious-looking distractor is a common
mistake; there is usually no "no answer" option, so trick items are optional here.

## Keep intact when you copy

- The `home()` / results screen, the stars and `localStorage` keys, the dots
  progress, the reduced-motion and dark-mode CSS, and the footer links
  (`./` = guide, `../` = hub). Just point them at the right subject.
