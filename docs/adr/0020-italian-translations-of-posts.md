---
status: accepted
---

# Offer Italian translations of Posts

Paolo writes and talks in Italian, and many of his readers do too, so Posts can
now have an Italian translation. English stays the language of record: ADR
0013's site-wide language becomes "English, with optional Italian
translations".

## Decision

- A translation lives in `src/content/translations/it/<post-slug>.md`, next to
  the public Posts, and is served at `/it/posts/<post-slug>/`. Italian is the
  only translation language.
- It carries only what changes with the language: `title`, `description`, the
  body and, when the Post has visible corrections, `corrections` with the same
  dates and kinds and translated summaries. Everything else (stable id, dates,
  Tags, Sources, the AI-generated notice) comes from the Post, so a translation
  can never disagree with it about facts or state.
- Each language links to the other at the top of the article and through
  `hreflang` alternates. The AI-generated notice and the corrections block are
  shown in Italian on Italian pages. Lists, Tags, feeds and the rest of the
  site stay in English.
- `pnpm content:check` rejects a translation without a matching Post, with
  extra metadata, or with corrections that don't match the Post's;
  `pnpm site:check` requires a built Italian route for each translation.

## Consequences

When a Post changes meaning, its translation must change with it: a Correction
updates both files. AI-generated Posts (ADR 0019) are published with their
Italian translation, and `pnpm post:review` still acts on the English Post,
whose state the translation inherits.
