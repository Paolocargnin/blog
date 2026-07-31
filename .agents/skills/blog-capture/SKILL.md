---
name: blog-capture
description: Capture a private atomic Note for the blog when the user has an observation, question, quote, source, or possible thesis that should not yet become a Draft.
---

# Blog Capture

1. Read `CONTEXT.md`, `docs/workspace.md`, and `docs/editorial-skills.md`.
   Pull the private Workspace with `git -C content/workspace pull --ff-only`
   before editing.
2. Choose a lowercase hyphenated slug with the user. Run
   `pnpm workspace:create -- --slug <slug>`; this command alone creates the
   Note directory and `article.md`.
3. Hand prose exploration to `$writing-fragments` with
   `content/workspace/notes/<slug>/article.md`. Because that skill is
   user-invoked, give the user the exact invocation and pause until they use it.
4. Run `pnpm workspace:validate`. Commit the meaningful capture in the private
   Workspace and push its branch without exposing unpublished material in the
   public repository.

Finish when the Note remains atomic, makes sense later, passes validation, and
is versioned privately. Article structure and metadata belong to
`$blog-develop`.
