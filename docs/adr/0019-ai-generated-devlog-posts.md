---
status: accepted
---

# Publish AI-generated project updates behind a visible notice

Paolo wants frequent updates on his projects without running each one through
the private Workspace lifecycle. The `daily-blogs-publish` skill lets Claude
read what Paolo did across his Claude sessions and repositories, then write one
or more Posts on its own, in an irreverent voice that may roast the Author and
show off what Claude itself built.

## Decision

- Such a Post is an **AI-generated Post**: it carries `aiGenerated: true` and
  renders a visible notice above the text, a badge in Post lists, and a prefix
  in the RSS description, all saying it is AI-generated and not yet reviewed.
- AI-generated Posts skip the Workspace stages, fact-check, counter-discussion,
  and publication digest required by ADRs 0002 and 0003. Everything else
  stands: they use the normal Post metadata, controlled Tags, and `pnpm
  quality`, and they reach `main` only through a pull request that satisfies
  ADR 0012. The merge remains a human act.
- They describe only work that actually happened: sessions, commits, files,
  screenshots and recordings Claude can point to. Visuals must be real captures
  or clearly labelled illustrations, never fake screenshots.
- Review removes the notice. `pnpm post:review -- --slug <slug> --approved-by
  "Paolo Cargnin"` deletes `aiGenerated`, sets `updatedAt`, and appends a dated
  `revision` that says the Post was reviewed. The field is never set to
  `false`. Before review, edits to an AI-generated Post need no Correction
  record; after review, ADR 0010 applies as usual.
- Two Tags join the controlled vocabulary for this kind of Post: `devlog` and
  `games`.

## Consequences

The public record makes the difference between Paolo's writing and Claude's
account of his work explicit, including in feeds. ADR 0003 still governs every
other Post. The Editorial process page documents the lane at
`/editorial/#ai-generated-posts`.
