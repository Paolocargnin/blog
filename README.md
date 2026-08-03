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

Use `$blog-workflow` when an article's next editorial step is unclear. The
[editorial skill suite](docs/editorial-skills.md) documents the router, review
evidence, human gates, and deterministic lifecycle commands.

## Publishing configuration

The site exposes RSS at `/rss.xml`, a generated sitemap index at
`/sitemap-index.xml`, and `robots.txt`. Canonical URLs and social metadata use
`PUBLIC_SITE_URL`; the Cloudflare Worker production environment should set it
to the canonical HTTPS origin. It falls back to
`https://blog.cargnin-paolo.workers.dev` until a custom domain is configured.

Cloudflare Web Analytics is intentionally opt-in and production-only. Add the
following production environment value in the Cloudflare dashboard after
creating the Analytics site:

- `PUBLIC_CLOUDFLARE_WEB_ANALYTICS_TOKEN` — the public Cloudflare beacon token.

Do not configure that value for Preview deployments or local development. Do
not also enable one-click Web Analytics injection: this site renders the beacon
itself to keep its environment boundary explicit. The token is public browser
configuration, but it is not committed. See `.env.example` for the complete,
secret-free environment contract and [Editorial process](/editorial/) for the
publication policy.

## Cloudflare deployment

The site is a pre-rendered Astro application served as static assets by the
`blog` Cloudflare Worker. It does not use Astro's Cloudflare SSR adapter.

- `pnpm preview:cloudflare` — build and preview the static Worker locally.
- `pnpm deploy` — build and deploy the static Worker.

Cloudflare Workers Builds should use `pnpm build` as its build command and
`npx wrangler deploy` as its deploy command. The checked-in `wrangler.jsonc`
prevents Cloudflare's automatic Astro setup from converting the site to SSR.
See [deployment and recovery](docs/deployment.md) for connected-repository
previews, production configuration, rollback, and emergency recovery.
