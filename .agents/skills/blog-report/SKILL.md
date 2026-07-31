---
name: blog-report
description: Report a private Draft by building its claim-to-source ledger when factual claims, quotations, links, code, uncertainty, or contrary evidence need attributable support.
---

# Blog Report

1. Read the Draft, `brief.md`, `CONTEXT.md`, `docs/editorial-skills.md`, ADRs
   0001, 0003, and 0014, and `docs/research/editorial-workflows.md`. Pull the
   private Workspace before editing.
2. Create the ledger only when absent with
   `pnpm editorial:create -- --slug <slug> --kind sources`. Preserve an existing
   `sources.md` and extend it in place.
3. Inventory every non-obvious claim, quotation, number, external link, code
   assertion, visual, and AI-suggested fact. Prefer primary and authoritative
   sources; record owner, canonical locator, access date, supported claims,
   verification notes, limitations, conflicts, and contrary evidence. Treat AI
   output as a lead, never evidence.
4. Keep confidential material, personal data, credentials, copyrighted source
   archives, and sensitive interview records in an appropriate encrypted vault;
   place only provenance notes in the private Workspace.
5. Mark unsupported claims visibly in `article.md`. Run
   `pnpm workspace:validate`, then commit and push the evidence ledger privately.

Finish when the core claim is supported, serious counterevidence is recorded,
and every remaining gap is explicit. Reporting does not declare the independent
fact-check passed.
