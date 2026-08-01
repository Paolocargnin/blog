---
name: blog-correct
description: Correct or revise an existing public Post when a typo, factual error, meaning-changing clarification, or substantial revision must preserve identity, history, and a visible record where required.
---

# Blog Correct

1. Read the Post, `CONTEXT.md`, `docs/editorial-skills.md`, and ADRs 0005, 0010,
   and 0012. Inspect Git status and preserve unrelated work.
2. Classify the change with the human:
   - `typo` for spelling, punctuation, or formatting that does not change
     meaning;
   - `correction` for a factual or meaning-changing fix;
   - `revision` for a substantial update.
3. Prepare a complete replacement Markdown file outside the public Posts
   directory. Preserve the stable `id`, original `publishedAt`, and slug. For a
   Correction or revision, agree a date and concise reader-facing summary.
4. Show the exact proposed diff and pause for named human approval. Apply it
   only with `pnpm post:correct -- --slug <slug> --replacement <path> --kind
   <kind> --approved-by "<Human Name>"`; add `--date YYYY-MM-DD --summary
   "<summary>"` for a Correction or revision. The script owns the public file
   mutation and visible history metadata.
5. Run `pnpm quality`, review the diff, commit on a fresh branch, push, and open
   a pull request. Meaning-changing changes require independent review and a
   human merge.

Finish at a reviewable pull request. Typographic fixes remain silent in the
page but visible in Git; Corrections and revisions remain visible to readers.
