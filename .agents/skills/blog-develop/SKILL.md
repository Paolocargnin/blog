---
name: blog-develop
description: Develop a selected private Note into an article-shaped Draft and brief when the user is ready to commit raw fragments to a reader promise and structure.
---

# Blog Develop

1. Read the Note, `CONTEXT.md`, `docs/workspace.md`,
   `docs/editorial-skills.md`, and ADRs 0002, 0004, 0005, 0006, 0009, and 0013.
   Pull the private Workspace before editing.
2. If exploration is still thin, route the user to `$writing-fragments` on the
   Note's `article.md` and pause. Once the user chooses to develop it, run
   `pnpm workspace:develop -- --slug <slug>`. The script preserves the raw Note
   as `notes.md` and creates the stable-id Draft `article.md`.
3. Run `pnpm editorial:create -- --slug <slug> --kind brief`. Complete the
   reader promise, claim or question, why-now, disconfirming evidence, reporting
   plan, verification level, and exit gate in `brief.md`.
4. Offer exactly two prose routes: `$writing-shape` for paragraph-by-paragraph
   argument or `$writing-beats` for a beat-led journey. Give the user the exact
   invocation with `notes.md` as the read-only pile and `article.md` as output,
   then pause. Preserve their prose methods instead of reproducing them here.
5. When the user returns, ensure known evidence gaps remain visible, run
   `pnpm workspace:validate`, then commit and push the Draft privately.

Finish when the Draft has a stable identity, a feasible brief, an intentional
shape, and visible reporting gaps. Route missing evidence to `$blog-report`.
