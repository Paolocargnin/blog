# Private Workspace

`content/workspace/` is a separate, private Git repository for unpublished
Notes, Drafts, Publication candidates, evidence ledgers, and editorial review
records. It is ignored by this public repository. Do not force-add it, copy it
into `src/content/posts/`, or place secrets, confidential sources, personal
data, copyrighted source archives, or credentials in this repository.

GitHub private repositories provide versioned sync and access controls; they
are not an end-to-end encrypted vault. Keep material that needs provider-blind
confidentiality in a separate encrypted vault, as required by ADR 0001.

## First-time setup

After creating the private `Paolocargnin/blog-workspace` repository and adding
the intended collaborator, initialize the stable local path:

```sh
pnpm workspace:init -- --remote git@github.com:Paolocargnin/blog-workspace.git
git -C content/workspace add content-contract.json
git -C content/workspace commit -m "chore: initialize editorial workspace"
git -C content/workspace push -u origin main
```

The private repository intentionally contains only the contract until a Note
is captured. Git does not retain empty directories; the lifecycle commands
create them locally as needed.

## Lifecycle commands

```sh
pnpm workspace:create -- --slug an-article-idea
pnpm workspace:develop -- --slug an-article-idea
pnpm editorial:create -- --slug an-article-idea --kind brief
pnpm editorial:create -- --slug an-article-idea --kind sources
pnpm workspace:validate
pnpm workspace:promote -- --slug an-article-idea --approved-by "Paolo Cargnin"
pnpm editorial:status -- --slug an-article-idea
pnpm editorial:check -- --slug an-article-idea
pnpm editorial:digest -- --slug an-article-idea
pnpm workspace:publish -- --slug an-article-idea --approved-by "Paolo Cargnin" --approved-digest <digest>
pnpm workspace:return -- --slug an-article-idea
```

`workspace:create` creates a raw Note. `workspace:develop` preserves its raw
fragments in `notes.md`, creates the Draft `article.md`, and assigns its stable
UUID. `workspace:promote` validates a content-complete Draft and moves it to a
Publication candidate only after the named human explicitly approves it.
`workspace:publish` rechecks the independent fact-check, resolved
counter-discussion, public Sources proposal, and publication package before it
copies an approved candidate to `src/content/posts/`. The approved digest binds
the named human decision and every review record to the exact candidate and
optional private ledger; any later edit makes approval stale. The command never
overwrites a Post and still requires a reviewed publication pull request before
merge.

`workspace:return` moves a candidate back to Draft when substantive work is
needed and invalidates its review evidence. Use `$blog-workflow` or
`pnpm editorial:status` when the next stage is unclear. See the
[editorial skill suite](editorial-skills.md) for the full router and evidence
contract.

The approval flag is intentionally not a shorthand for agent approval. An AI
must stop and ask a human to inspect the work and run or expressly authorize
the approved command.

## Sync, conflicts, and recovery

Before editing, run `git -C content/workspace pull --ff-only`. Commit each
meaningful writing or review step, then push it to the private remote. When a
pull reports a conflict, stop editing the conflicting files, inspect both
versions, preserve the source and review evidence from each, resolve the
conflict deliberately, run `pnpm workspace:validate`, then commit the
resolution. Never use a force push for shared editorial history.

If a device is lost or the local workspace is corrupted, clone the private
remote back into `content/workspace/`, run `pnpm workspace:validate`, and use
Git history to recover a known-good revision. If the remote itself is
unavailable, restore from an independently maintained encrypted backup. Public
Git history and deployment artifacts are not a backup for private workspace
material.
