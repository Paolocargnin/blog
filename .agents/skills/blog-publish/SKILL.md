---
name: blog-publish
description: Publish a fully reviewed Publication candidate by preparing its public branch and pull request when all evidence passes and a named human authorizes the exact copy operation.
---

# Blog Publish

1. Read the candidate, every sidecar, `docs/editorial-skills.md`, ADRs 0003 and
   0012, and current Git status. Pull both public and private repositories with
   fast-forward-only semantics; preserve unrelated work.
2. Run `pnpm editorial:status -- --slug <slug>`,
   `pnpm editorial:check -- --slug <slug>`, `pnpm workspace:validate`, and
   `pnpm quality`. Continue only when the router says `blog-publish` and every
   check passes.
3. Show the human the exact candidate, Sources proposal, disclosure decision,
   fact-check identity, counter-discussion dispositions, and intended public
   diff. Pause for explicit named publication approval; an agent never supplies
   or infers it.
4. After approval, create a fresh publication branch and run
   `pnpm workspace:publish -- --slug <slug> --approved-by "<Human Name>"`.
   The script rechecks every gate and copies without overwriting a Post.
5. Run the full quality suite, review the final diff for private material,
   commit, push, and open a pull request. Require a Reviewer other than the PR
   author, passing required checks, resolved conversations, and a working
   Cloudflare preview.

Stop before merge. Finish when the human has the exact preview URL and the
precise review or merge action that remains the publication gate.
