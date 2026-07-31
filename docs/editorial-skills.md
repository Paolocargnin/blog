# Editorial skill suite

Workflow version 1 turns the private Workspace lifecycle into small,
repository-local skills. Use `$blog-workflow` with an article slug whenever the
next step is unclear; it runs `pnpm editorial:status -- --slug <slug>` and
routes to exactly one skill.

| Article state                                | Next skill              | Purpose                                                              |
| -------------------------------------------- | ----------------------- | -------------------------------------------------------------------- |
| No working article                           | `$blog-capture`         | Capture an atomic private Note.                                      |
| Note or incomplete Draft                     | `$blog-develop`         | Preserve the Note, create a Draft, and shape its prose.              |
| Draft with explicit verification gaps        | `$blog-report`          | Build private claim-to-source provenance.                            |
| Content-complete Draft                       | `$blog-promote`         | Stop for human approval, then create a Publication candidate.        |
| Candidate without a passed independent check | `$blog-fact-check`      | Verify every surviving claim against attributable evidence.          |
| Candidate with open adversarial findings     | `$blog-counter-discuss` | Challenge the piece and resolve every finding explicitly.            |
| Candidate missing its final package          | `$blog-package`         | Complete metadata, accessibility, Sources, and disclosure decisions. |
| Candidate with every gate satisfied          | `$blog-publish`         | Stop for human approval and prepare a publication pull request.      |
| Existing Post                                | `$blog-correct`         | Prepare a transparent typo fix, Correction, or revision.             |

## Deterministic commands

Skills may edit prose and evidence inside existing Markdown files. These
commands own file creation, movement, validation, and public-state changes:

```sh
pnpm workspace:create -- --slug <slug>
pnpm workspace:develop -- --slug <slug>
pnpm editorial:create -- --slug <slug> --kind <brief|sources|fact-check|counter-discussion|publication-check>
pnpm workspace:promote -- --slug <slug> --approved-by "Human Name"
pnpm workspace:return -- --slug <slug>
pnpm editorial:check -- --slug <slug>
pnpm editorial:digest -- --slug <slug>
pnpm workspace:publish -- --slug <slug> --approved-by "Human Name" --approved-digest <digest>
pnpm post:correct -- --slug <slug> --replacement <post.md> --kind <typo|correction|revision> --approved-by "Human Name" [--date YYYY-MM-DD --summary "Visible explanation"]
```

Promotion and publication flags record a human decision; they are not agent
self-approval. Publication approval also names the SHA-256 digest of the exact
candidate and optional private ledger that the human inspected. An agent pauses
so the named human can inspect the exact files and expressly authorize the
command. Publication still finishes through a reviewed pull request and human
merge.

## Evidence contract

`sources.md`, when the piece needs attributable evidence, is the exhaustive
private ledger; purely personal pieces may omit it. `fact-check.md` records a
fresh, independent check and reaches `status: passed` only when every item is
resolved.
`counter-discussion.md` keeps adversarial findings separate from the article;
each finding has a `fixed`, `rejected`, or `accepted` disposition plus a
rationale before the record reaches `status: resolved`.

`publication-check.md` proposes whether the public Post includes or omits its
`## Sources` section, with a rationale either way. An included section must be
the final Post section and contain a curated Markdown list of public sources. It
also records whether a Post-specific `## AI disclosure` is included or judged
not material. The publication script rejects missing evidence, open checkboxes,
unresolved verification markers, unresolved counter-discussion findings, and
inconsistent Sources or disclosure decisions. All three review records must
name the digest of the current `article.md` and optional `sources.md`; an edit
makes them stale.

## Composition and evolution

`$blog-capture` hands exploratory prose to `$writing-fragments`.
`$blog-develop` hands the preserved `notes.md` pile to either `$writing-shape`
or `$writing-beats`; the local suite does not duplicate their prose methods.
The Draft router recognizes `<!-- TODO: SOURCE -->`,
`<!-- TODO: VERIFY -->`, `<!-- TODO: VERIFY NUMBER -->`, and
`<!-- TODO: SEEK COUNTEREXAMPLE -->` as explicit reporting gaps and sends the
article to `$blog-report` until they are resolved.

The suite and its evidence schema are versioned with this repository. Change
`editorialWorkflowContract.version` only with a documented migration that
preserves existing Workspace articles and review records. Update the router,
skills, deterministic scripts, tests, and this document together; use evidence
from real writing sessions to justify backward-compatible improvements.
