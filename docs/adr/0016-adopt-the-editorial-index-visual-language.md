---
status: accepted
---

# Adopt the editorial index visual language

[Issue 7](https://github.com/Paolocargnin/blog/issues/7) compared three responsive typography-first systems in a throwaway prototype. Paolo selected Direction C because its high-contrast editorial index gives the blog a distinctive technical voice without competing with sustained reading. This decision supersedes only the typography paragraph of [ADR 0007](0007-own-the-frontend-design-system.md); the requirement to own a semantic Astro and native-CSS frontend remains.

## Decision

- Self-host `JetBrains Mono Variable` and use it as the only font family for prose, navigation, metadata, and code. Create hierarchy with size, variable weight, spacing, and color instead of switching families.
- Base the owned design tokens on near-black ground `#121416`, dark panel `#1b1e21`, warm-white ink `#f2f3ec`, muted ink `#b7bcb4`, line `#4e5350`, and acid-lime signal `#d8ff68`. Exclusion blending may turn the signal into its violet complement where foreground and background cross.
- Center the long-form reading column at approximately `58ch`, allow code to expand to approximately `80rem`, and allow the article header to expand to `70rem` without separate title or deck width caps. Do not add an article table of contents.
- Use a fixed, non-interactive three-digit article number at the bottom-left with `mix-blend-mode: exclusion`. Follow the approved responsive scale: `clamp(5.4rem, 12.6vw, 10.8rem)` on desktop and `clamp(3.575rem, 18.2vw, 5.2rem)` on mobile.
- Give Corrections and Sources the same `40% / auto` desktop grid and stack them on narrow screens so their headings never collide with their content.
- Carry the visual language through navigation, archive, Sources, Corrections, code, and long-form states while preserving contrast, visible focus, keyboard access, reduced motion, text resizing, and narrow-screen reflow.

## Considered options

- Direction A's serif-led literary system was calm and readable, but its multi-family treatment felt too conventional and lacked the selected direction's graphic index energy.
- Direction B's marginalia made article structure explicit, but its table-of-contents rail competed with the reading experience and prevented the centered composition.
- Direction C trades some traditional long-form typographic differentiation for a single coherent technical and editorial voice. Paolo accepted that trade-off after reviewing and refining the prototype.

## Consequences

The complete comparison is preserved as primary design evidence on [`codex/prototype-typography-visual-language`](https://github.com/Paolocargnin/blog/tree/codex/prototype-typography-visual-language) and draft [PR 23](https://github.com/Paolocargnin/blog/pull/23); neither is production code. Issue 8 must rewrite the selected direction as semantic, tested Astro components rather than merge or copy the throwaway prototype wholesale.
