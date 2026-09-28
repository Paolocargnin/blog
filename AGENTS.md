## Agent skills

### Editorial work

For capturing notes, developing posts, or choosing a writing skill, read
`docs/editorial-skills.md` and `docs/workspace.md`. Local editorial and writing
skills live in `.agents/skills/`.

### Cross-device sync

After each meaningful editing step, commit and push the task's changes in every
affected repository before finishing the turn. This is standing authorization;
do not ask again for routine commits and pushes. Sync unpublished Notes, Drafts,
and review material only through the private repository at `content/workspace/`.
Sync project code, documentation, and skills through the blog repository, using
a branch and pull request where main is protected. Preserve unrelated local
changes. Verify each push; if it fails, report what remains local. Sync does not
authorize promotion, publication, or merging a publication pull request.

### Issue tracker

Issues and PRDs for this repository live in GitHub Issues. See `docs/agents/issue-tracker.md`.

### Triage labels

This repository uses the default five canonical triage labels. See `docs/agents/triage-labels.md`.

### Domain docs

This repository uses a single-context layout: `CONTEXT.md` at the root and ADRs in `docs/adr/`. See `docs/agents/domain.md`.
