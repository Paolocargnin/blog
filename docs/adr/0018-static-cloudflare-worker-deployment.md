---
status: accepted
---

# Serve the pre-rendered blog through a static Cloudflare Worker

Cloudflare's connected-repository flow creates a static Cloudflare Worker. Its
automatic Astro setup attempts to add the SSR adapter, which is unnecessary for
this fully pre-rendered site and fails on the existing repository's missing
starter-only `public/.assetsignore` file.

## Decision

- Serve the Astro build's `dist/` directory as static Worker assets.
- Keep the deployment configuration in `wrangler.jsonc`, with no Worker
  `main` entrypoint and `not_found_handling: "404-page"` so the existing Astro
  404 page remains the response for unknown routes.
- Use the checked-in Wrangler CLI for `pnpm deploy`; Cloudflare Workers Builds
  builds with `pnpm build` and deploys with `npx wrangler deploy`.
- Keep canonical URLs and the optional Cloudflare Web Analytics beacon
  production-gated through the documented public environment variables.

## Consequences

This supersedes only ADR 0011's choice of Cloudflare Pages. The public/private
content boundary and privacy-first analytics policy remain unchanged. The
custom public origin `https://pctb.it` is canonical; if it changes,
`PUBLIC_SITE_URL` must be updated and the Worker redeployed.
