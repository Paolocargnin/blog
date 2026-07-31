---
name: blog-workflow
description: Route a blog article to the next repository-local editorial skill when the user asks what to do next or needs the current Note, Draft, Publication candidate, or Post state inspected.
---

# Blog Workflow

Route; do not perform the routed stage in the same invocation.

1. Read `CONTEXT.md` and `docs/editorial-skills.md`.
2. Ask once for the article slug when absent.
3. Run `pnpm editorial:status -- --slug <slug>`. Preserve the private
   Workspace and stop on lifecycle ambiguity or validation failure.
4. Report the detected stage, recommend exactly one skill from the table, and
   give the user a ready-to-run `$skill-name` prompt with the slug.

| `nextSkill` | Route |
| --- | --- |
| `blog-capture` | `$blog-capture` — no working article exists. |
| `blog-develop` | `$blog-develop` — shape a Note or incomplete Draft. |
| `blog-report` | `$blog-report` — build the private evidence ledger. |
| `blog-promote` | `$blog-promote` — request human promotion approval. |
| `blog-fact-check` | `$blog-fact-check` — run the independent verification pass. |
| `blog-counter-discuss` | `$blog-counter-discuss` — challenge and resolve findings. |
| `blog-package` | `$blog-package` — finish the publication package. |
| `blog-publish` | `$blog-publish` — request human publication approval and prepare a PR. |
| `blog-correct` | `$blog-correct` — prepare a Post-publication change. |

Finish when the user can invoke one unambiguous next skill. Read-only routing
never advances lifecycle state.
