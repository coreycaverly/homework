# Homework Helper

A small GitHub Pages site of **study guides and quizzes** for one 6th‑grade student,
organized by **subject → lesson**. It's built and maintained with **Claude Code** using the
`homework-intake` skill in this repo, and it's meant to be worked on from **more than one
computer** — everything needed is committed here.

Live site: **https://homework.caverly.net** · deployed by GitHub Pages from `main`.

## What's in the repo

```
index.md                 Root menu (lists the SUBJECTS; generated from _data/subjects.yml)
_data/subjects.yml       The registry: subjects → lessons (name, slug, emoji, added, quiz, blurb)
<subject>/index.md       A subject page listing its lessons (only when a subject has >1 lesson)
<lesson>/                One folder per lesson:
  index.md                 landing (Guide + Quiz buttons; reads the registry)
  guide.md                 the study guide  → /<lesson>/guide.html
  quiz.html                a self-contained quiz (inline CSS/JS, no build step)
  answer-key.md/.html      parent answer key (only for some lessons)
_layouts/ _includes/     Cayman theme override (banner, fonts, home link)
_config.yml              Jekyll config (theme: jekyll-theme-cayman)
CLAUDE.md                Project context + learner profile + design principles
.claude/skills/homework-intake/   The skill that builds all of the above
_intake/                 GITIGNORED, local-only: the child's scans + diagnosis notes
```

## How to work on it (with Claude Code)

1. **Clone** the repo and open it in Claude Code. The `homework-intake` skill autoloads from
   `.claude/skills/`.
2. **Sync first:** `git switch main && git pull` so you have everyone's latest work.
3. **Run the skill:** share a photo/scan of a worksheet (or a PDF) and say
   *"intake this worksheet"*, or type `/homework-intake`. It reads the work, builds or extends
   the right lesson (guide + quiz + answer key), updates navigation, and keeps the child's
   scans private.
4. When it's done it **commits and pushes to `main`**, which redeploys the site in ~1 minute.

See `.claude/skills/homework-intake/SKILL.md` for the full workflow and rules.

## Prerequisites on each machine

- **git** with push access to this repo's `main` branch.
- **python3** with **`pypdf`** (`pip3 install pypdf`) — only needed to read PDF worksheets;
  image scans are read directly.
- **node** — used to validate quiz question banks before committing.
- **gh** CLI (optional) — only to check the GitHub Pages build after a push.

## Privacy (important)

- The repo and site are **public**. Never publish the student's name, school, photos of their
  work, or personal details. The skill writes **original** content only.
- Worksheet scans and diagnosis notes live in **`_intake/`**, which is **gitignored** — they
  stay on the machine that made them and are never committed or deployed. That means a
  collaborator will see the derived guides/quizzes but **not** the raw scans, by design.

## Deploying / previewing

- **Deploy:** push to `main`. GitHub Pages rebuilds automatically (classic branch build, no
  Action). `_intake/`, `.claude/`, `CLAUDE.md`, and `README.md` are excluded from the build.
- **Local preview (optional):** `bundle install` then `bundle exec jekyll serve` if you have
  Ruby/Bundler; otherwise just push to `main` and check the live site.
