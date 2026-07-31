---
name: blog-counter-discuss
description: Run an adversarial counter-discussion on a Publication candidate when its thesis, evidence, assumptions, missing perspectives, fairness, and strongest objections need a separate review.
---

# Blog Counter Discuss

1. Read `docs/editorial-skills.md`, ADR 0003, the candidate, source ledger, and
   passed fact-check. Create the record when absent with
   `pnpm editorial:create -- --slug <slug> --kind counter-discussion`.
2. Dispatch a fresh adversarial subagent or separate human with the raw
   candidate and evidence paths. Ask it to steelman the strongest objections,
   seek counterexamples, identify missing perspectives, test causal claims and
   uncertainty, and inspect whether the piece earns its conclusion. It writes
   findings to `counter-discussion.md` and does not silently rewrite the Post.
3. Put every finding in the frontmatter `findings` array. The Author resolves
   each as `fixed`, `rejected`, or `accepted` and records a non-empty rationale.
   Re-review fixes that affect the finding.
4. Set `status: resolved` only when no open checkbox or undispositioned finding
   remains. Run `pnpm editorial:check -- --slug <slug>`, validate, commit, and
   push the review evidence privately.

Substantive rewriting returns the candidate to Draft with
`pnpm workspace:return -- --slug <slug>` and invalidates all review evidence.
Finish when a reader can audit every challenge and its resolution.
