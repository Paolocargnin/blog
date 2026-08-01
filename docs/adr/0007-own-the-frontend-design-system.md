# Own the frontend design system

The typography paragraph in this decision is superseded by [ADR 0016](0016-adopt-the-editorial-index-visual-language.md). The frontend ownership, semantic Astro, native CSS, and framework constraints remain in force.

The site uses semantic Astro components, native CSS, and project-owned design tokens with no Tailwind or UI framework. External systems such as shadcn/type utilities may serve as references, but useful patterns are rewritten locally so typography, markup, accessibility, and long-term evolution remain under project control. Interactive features begin with vanilla TypeScript and adopt a client framework only when demonstrated state complexity requires one.

Typography uses a readable self-hosted open-source serif for article prose, a restrained sans-serif for navigation and metadata, and monospace only for code and the future terminal. Specific families are selected through visual comparison rather than fixed by this architectural decision.
