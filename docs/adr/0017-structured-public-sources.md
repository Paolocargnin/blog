---
status: accepted
---

# Render public Sources from structured Post metadata

Public Sources are part of a Post's publication record, not prose that the
browser should infer after Markdown renders. A `## Sources` heading and list
made the reading surface depend on client-side DOM reshaping and could not
express a consistent card layout safely.

## Decision

Content contract v2 adds an optional `sources` frontmatter field. When present,
it is a non-empty list of strict records with `title`, absolute public HTTP(S)
`url`, and reader-facing `description`. The Post layout renders those records
through its own Sources component, using the same heading-and-card structure as
Corrections. The Markdown body must not contain a `## Sources` section.

The publication check's `sourcesProposal: included` requires this field; an
`omitted` proposal requires that it be absent. Private source ledgers remain in
`sources.md` and are never published automatically.

## Migration

This repository has no existing public Posts or in-progress Workspace articles
to convert. New and future articles use the v2 frontmatter field. Any article
created against contract v1 must move each final Markdown Sources list item into
`sources` before it can pass the v2 content and publication checks. The
Workspace manifest is updated from `{ "version": 1 }` to `{ "version": 2 }`.
