# Domain Docs

How engineering skills should consume this repository's domain documentation.

## Before exploring

- Read `CONTEXT.md` at the repository root when it exists.
- Read any ADRs in `docs/adr/` that touch the area of work.

If these files do not exist, proceed silently. Create them only when a term or architectural decision needs to be captured.

## File structure

```text
/
├── CONTEXT.md
├── docs/
│   └── adr/
└── src/
```

## Vocabulary and decisions

Use terms defined in `CONTEXT.md` consistently. If work conflicts with an existing ADR, surface the conflict explicitly rather than silently overriding it.
