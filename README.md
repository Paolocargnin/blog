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
- `pnpm content:check` — validate public Posts and the local Workspace when it
  is present.
- `pnpm content:check:public` — validate only public Posts, as production does.
- `pnpm workspace:validate` — validate the local private Workspace contract.
- `pnpm build` — validate and create a production build from public Posts only.
- `pnpm quality` — run all required checks.

See [the private Workspace guide](docs/workspace.md) for setup, lifecycle,
sync, recovery, and sensitive-source boundaries.
