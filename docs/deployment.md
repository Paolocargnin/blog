# Deployment and recovery

`main` is the publication boundary. A change reaches production only after the
GitHub pull request has passed the aggregate **Quality** check, received an
approval from a Reviewer, has no unresolved conversations, and its Cloudflare
preview has been inspected.

## Deploy and preview

The `blog` Cloudflare Worker serves Astro's pre-rendered `dist/` assets. It
uses the checked-in `wrangler.jsonc`; do not accept Cloudflare's Astro SSR
auto-setup.

In Cloudflare Workers Builds, connect the public `Paolocargnin/blog` GitHub
repository to the `blog` Worker with these commands:

- production branch: `main`
- build command: `pnpm build`
- deploy command: `npx wrangler deploy`

Workers Builds creates a stable preview URL for each pull-request branch and
posts it to the pull request. Before approval, the pull-request author and
Reviewer should inspect that URL, including the rendered article, links, and
any requested correction. A merge then deploys the reviewed `main` commit.

For a local production-like check, run `pnpm preview:cloudflare`. A manual
production deploy, used only when the normal connected-repository flow is
unavailable, is `pnpm deploy` from the reviewed commit.

## Production configuration and analytics

Set `PUBLIC_SITE_URL=https://blog.cargnin-paolo.workers.dev` in the Worker
production environment. When a custom domain becomes canonical, replace that
value with its HTTPS origin and redeploy.

Create a Cloudflare Web Analytics site for the production hostname, then set
its public beacon token as `PUBLIC_CLOUDFLARE_WEB_ANALYTICS_TOKEN` in the
production environment only. Leave it unset for previews and local work. This
site renders the beacon itself; do not enable one-click injection as well.

## Rollback and emergency recovery

1. Pause publication and record the failed URL, commit, and time in the pull
   request or incident note.
2. In Cloudflare, open **Workers & Pages → blog → Deployments**, select the
   last known-good version, and choose **Rollback**. This makes that version
   active immediately without rewriting Git history.
3. Verify the production origin, `/`, `/posts/`, the affected route, RSS,
   sitemap, and `robots.txt`. Confirm analytics remains production-only.
4. Open a corrective pull request from the failed commit; retain the rollback
   evidence and use the same Quality, preview, review, and merge gates.

An authenticated operator can also run `pnpm exec wrangler rollback
<VERSION_ID>` from this repository. Cloudflare retains up to 100 recent Worker
versions for rollback; static assets have no mutable Worker bindings to repair.

If GitHub protection or Cloudflare Builds is unavailable, do not push to
`main`. Restore the GitHub rule and Build connection first, then use the
normal pull-request path. If access itself is lost, Paolo Cargnin, as the
repository administrator and Author, must restore it and record the recovery
in the relevant issue.
