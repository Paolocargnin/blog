---
name: blog-promote
description: Promote a content-complete Draft to Publication candidate when its argument, metadata, controlled tags, source ledger, and prose are stable enough for verification-only changes.
---

# Blog Promote

1. Read the Draft, all sidecars, `CONTEXT.md`, `docs/editorial-skills.md`, and
   ADRs 0002, 0003, 0004, and 0013. Pull the private Workspace before editing.
2. Confirm the Draft is content-complete: public metadata is valid, the source
   ledger exists, known gaps are explicit, and structural or substantive work
   is finished. Run `pnpm content:check`.
3. Show the human the exact Draft and a concise promotion summary. Pause for an
   explicit named approval; an agent never supplies or infers it.
4. Only after approval, run
   `pnpm workspace:promote -- --slug <slug> --approved-by "<Human Name>"`.
   The script validates Post shape and performs the lifecycle move.
5. Run `pnpm workspace:validate`, then commit and push the transition privately.

Finish when the Publication candidate exists and is limited to verification,
minor corrections, and packaging. Return substantive rewriting to Draft with
`pnpm workspace:return -- --slug <slug>`.
