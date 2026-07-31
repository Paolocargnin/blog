# Issue tracker: GitHub

Issues and PRDs for this repo live as GitHub issues. Use the `gh` CLI for all operations.

## Conventions

- **Create an issue**: `gh issue create --title "..." --body "..."`. Use a heredoc for multi-line bodies.
- **Read an issue**: `gh issue view <number> --comments`, filtering comments by `jq` and also fetching labels.
- **List issues**: `gh issue list --state open --json number,title,body,labels,comments --jq '[.[] | {number, title, body, labels: [.labels[].name], comments: [.comments[].body]}]'` with appropriate `--label` and `--state` filters.
- **Comment on an issue**: `gh issue comment <number> --body "..."`
- **Apply / remove labels**: `gh issue edit <number> --add-label "..."` / `--remove-label "..."`
- **Close**: `gh issue close <number> --comment "..."`

Infer the repo from `git remote -v` — `gh` does this automatically when run inside a clone.

## Pull requests as a triage surface

**PRs as a request surface: no.** _(Set to `yes` if this repo treats external PRs as feature requests; `/triage` reads this flag.)_

## When a skill says "publish to the issue tracker"

Create a GitHub issue.

## When a skill says "fetch the relevant ticket"

Run `gh issue view <number> --comments`.

## Wayfinding operations

Used by `/wayfinder`. The map is one issue with child issues as tickets.

- **Map**: a single issue labelled `wayfinder:map`, holding the Destination, Notes, Decisions so far, Not yet specified, and Out of scope sections.
- **Child ticket**: link the issue to its map as a GitHub sub-issue with `gh api --method POST repos/<owner>/<repo>/issues/<map>/sub_issues -F sub_issue_id=<child-db-id>`. Give the child one `wayfinder:<type>` label (`research`, `prototype`, `grilling`, or `task`). The assignee claims an open ticket before work begins.
- **Blocking**: use GitHub's native issue dependencies: `gh api --method POST repos/<owner>/<repo>/issues/<child>/dependencies/blocked_by -F issue_id=<blocker-db-id>`. The database id comes from `gh api repos/<owner>/<repo>/issues/<number> --jq .id`, not the issue number or node id. If dependencies are unavailable, use a `Blocked by: #<number>` line near the top of the body.
- **Frontier**: list the map's open sub-issues with `gh api 'repos/<owner>/<repo>/issues/<map>/sub_issues?per_page=100'`. A ticket is on the frontier only when it is open, unassigned, and its `issue_dependencies_summary.blocked_by` is zero (or every fallback body blocker is closed). Work the first eligible child in map order unless the user names a different eligible ticket.
