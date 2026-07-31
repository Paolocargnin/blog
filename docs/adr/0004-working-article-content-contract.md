# Treat the working-article layout as a content contract

Each working article is a directory whose prose lives in `article.md`; the accepted optional sidecars are `brief.md`, `sources.md`, `notes.md`, `fact-check.md`, `counter-discussion.md`, and `publication-check.md`. Not every article needs every sidecar, but other filenames are rejected by validation. Structural changes require an explicit discussion and migration plan that accounts for existing articles and backward compatibility.

`pnpm content:check` validates the private workspace and public posts locally. The production build refuses invalid public content, and GitHub Actions validates committed public content on every push. Unknown sidecars fail with a migration-oriented error. A pre-commit hook is intentionally deferred so validation does not interrupt exploratory writing.
