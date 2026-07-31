---
name: blog-package
description: Package a verified Publication candidate when metadata, links, accessibility, public Sources, AI disclosure, rendering, and final author review must become a complete publication record.
---

# Blog Package

1. Read the candidate and every sidecar plus `docs/editorial-skills.md`, ADRs
   0003, 0006, 0013, 0014, and 0015. Confirm fact-check is passed and
   counter-discussion is resolved before packaging.
2. Create `publication-check.md` only when absent with
   `pnpm editorial:create -- --slug <slug> --kind publication-check`.
3. Check the final title, description, date, controlled tags, citations, links,
   code, alt text, heading order, small-screen rendering, and prose after all
   review fixes. Record the preparer and date; resolve every checklist item.
4. Propose `sourcesProposal: included` or `omitted` with a rationale. When
   included, curate a public `## Sources` section in the Post; keep private,
   confidential, or exhaustive ledger details in `sources.md`.
5. Record `aiDisclosure: included` or `not-material` with a rationale. When AI
   contribution is unusually material or relevant to the subject, add a candid
   public `## AI disclosure` while keeping the Author accountable.
6. After the final public text and private ledger are settled, run
   `pnpm editorial:digest -- --slug <slug>` and record that exact value as
   `candidateDigest`. Set `status: ready`, then run
   `pnpm editorial:check -- --slug <slug>`, `pnpm content:check`, and the
   relevant render/link checks. If the router returns to fact-check or
   counter-discussion, re-review this exact digest before packaging again.
   Commit and push the package privately.

Finish when deterministic gates agree that the exact final candidate is ready.
Any later substantive change invalidates the package and returns to Draft.
