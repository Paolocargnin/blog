---
name: blog-fact-check
description: Independently fact-check a Publication candidate when every surviving factual claim must be traced to attributable evidence before publication can proceed.
---

# Blog Fact Check

Keep verification independent from drafting.

1. Read `docs/editorial-skills.md`, ADRs 0003 and 0014, and the Publication
   candidate only to identify its paths. Create the record when absent with
   `pnpm editorial:create -- --slug <slug> --kind fact-check`.
2. Dispatch a fresh checker subagent or separate human who did not draft the
   article. Give it the raw `article.md`, optional `sources.md`, and
   `fact-check.md` paths—no proposed verdict, suspected answer, or drafting
   conclusions.
3. Have the checker verify every claim, quotation, name, date, number, link,
   code sample, metadata field, visual, and AI-touched fact against primary or
   authoritative evidence. Record uncertainty and failures in `fact-check.md`;
   keep the review separate from the article.
4. Let the Author apply fixes. Recheck the final wording, run
   `pnpm editorial:digest -- --slug <slug>`, and record that exact value as
   `candidateDigest`. Set `independent: true` and `status: passed` only when
   every checklist item and finding is resolved and no verification marker
   remains. Any later article or ledger edit requires a fresh digest and check.
5. Run `pnpm editorial:check -- --slug <slug>` to expose the next blocking gate,
   then validate, commit, and push the review evidence privately.

Substantive rewriting returns the candidate to Draft with
`pnpm workspace:return -- --slug <slug>` and invalidates its review evidence.
Finish only on an independently reproducible passed record.
