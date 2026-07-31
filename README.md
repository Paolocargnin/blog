# PC - the blog

The public Astro site for PC - the blog. Unpublished writing remains in the
private `content/workspace/` repository and must never be committed here.

## Local development

Use Node 24.11.1 and pnpm 10.32.1, then install dependencies with `pnpm
install`.

- `pnpm dev` — run the local development server.
- `pnpm format` — check formatting.
- `pnpm type-check` — run strict Astro and TypeScript checks.
- `pnpm test` — run representative automated tests.
- `pnpm content:check` — validate the current public-content baseline.
- `pnpm build` — create a production build.
- `pnpm quality` — run all required checks.
