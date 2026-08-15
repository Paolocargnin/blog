# Forking PC - the blog

This repository is reusable as a public Astro blog plus a separate private
editorial Workspace. A fork receives the site, lifecycle scripts, local skills,
tests, and Cloudflare-first deployment configuration. It does **not** receive
Paolo's private Workspace or make every deployment provider supported.

## 1. Fork and verify the public project

Follow [GitHub's forking guide](https://docs.github.com/en/pull-requests/how-tos/work-with-forks/fork-a-repo),
or use GitHub CLI:

```sh
gh repo fork Paolocargnin/blog --clone=true
cd blog
corepack enable
pnpm install
pnpm quality
```

The project currently pins Node 24.11.1 and pnpm 10.32.1 in `package.json`.
See the official [pnpm installation guide](https://pnpm.io/installation) if
Corepack is unavailable in your Node installation.

## 2. Replace the publication identity

Search the fork before changing anything:

```sh
rg -n "Paolo|Cargnin|PC - the blog|pctb\.it|ATHENS|Athens|Paolocargnin|blog-workspace"
```

At minimum, review and replace the values in:

- `src/layouts/BaseLayout.astro` — site name, canonical fallback, and structured
  Author identity;
- `src/components/SiteHeader.astro` and `src/components/SiteFooter.astro` —
  public brand, issue label, Author, and location;
- `src/pages/index.astro`, `src/pages/posts/index.astro`,
  `src/pages/editorial/index.astro`, and `src/pages/rss.xml.js` — reader-facing
  descriptions and editorial accountability;
- `astro.config.mjs` and `.env.example` — canonical public origin;
- `wrangler.jsonc` — a unique Cloudflare Worker name;
- `CONTEXT.md`, `README.md`, `docs/workspace.md`, and `docs/deployment.md` — your
  domain language, repository names, ownership, and recovery path;
- `tests/cloudflare-worker.test.mjs` and any fixture text that deliberately
  asserts the identity or origin you changed.

Historical ADRs explain the upstream project's decisions. Preserve them as
history or add a superseding ADR for a different decision; do not silently make
an old decision claim that it was made by somebody else.

Run `pnpm quality` after personalization. A successful build is the first proof
that the fork no longer depends on an inconsistent mix of identities or URLs.

## 3. Create the private Workspace

Create a new empty **private** repository. GitHub documents the UI and CLI
options in [Creating a new repository](https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-new-repository).

```sh
gh repo create YOUR_GITHUB_USER/blog-workspace --private
pnpm workspace:init -- --remote git@github.com:YOUR_GITHUB_USER/blog-workspace.git
git -C content/workspace add content-contract.json
git -C content/workspace commit -m "chore: initialize editorial workspace"
git -C content/workspace push -u origin main
```

The public repository ignores `content/workspace/`; that directory is its own
Git repository. Read the complete [Workspace guide](workspace.md) before adding
unpublished material. A GitHub private repository provides access control and
versioned sync, not provider-blind encryption. Secrets, confidential sources,
and sensitive personal data belong in an appropriate encrypted vault.

## 4. Write through the lifecycle

Use `$blog-workflow` with an article slug whenever the next step is unclear.
The [editorial skill suite](editorial-skills.md) documents each stage and its
human gate.

```sh
pnpm workspace:create -- --slug my-first-article
pnpm editorial:status -- --slug my-first-article
pnpm workspace:validate
```

The commands own deterministic file creation, lifecycle movement, validation,
and approval records. Skills and the human Author own the open-ended editorial
work. Do not bypass the named human approvals for promotion or publication.

## 5. Run locally

```sh
pnpm dev
```

Before opening a publication pull request, run:

```sh
pnpm quality
```

That command checks formatting, types, tests, repository-local skills, content,
the production build, and the generated site.

## 6. Connect Cloudflare

The maintained deployment path is a static Cloudflare Worker. The checked-in
`wrangler.jsonc` serves Astro's pre-rendered `dist/` directory and preserves the
static `404.html` behavior.

1. Create a Worker with the unique name chosen in `wrangler.jsonc`.
2. Connect the fork using
   [Cloudflare's GitHub integration](https://developers.cloudflare.com/workers/ci-cd/builds/git-integration/github-integration/).
3. Use `pnpm build` as the build command.
4. Use `npx wrangler deploy` as the production deploy command.
5. Choose `main` as the production branch.
6. Set `PUBLIC_SITE_URL` to the final HTTPS origin in the production
   environment.
7. Leave `PUBLIC_CLOUDFLARE_WEB_ANALYTICS_TOKEN` unset unless you deliberately
   configure Cloudflare Web Analytics; keep it unset for local and Preview
   builds.

Read [deployment and recovery](deployment.md) for the pull-request preview,
review gate, production boundary, and rollback procedure. Cloudflare documents
its general build settings in
[Workers Builds configuration](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/).

## Other deployment providers

Astro emits static output, so other static hosts are plausible. They are not
maintained or tested by this repository yet. A future deployment recipe should
include its own build, preview, canonical-origin, 404, rollback, and validation
instructions before it is described as supported.
