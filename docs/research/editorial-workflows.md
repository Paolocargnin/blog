# Editorial workflows for an AI-assisted Markdown blog

_Research date: 2026-07-31_

## Executive recommendation

Use a visible, stage-based pipeline:

> **Capture → Develop → Report → Draft → Structural edit → Verify → Copy/package → Publish → Correct/update → Reuse/archive**

The important lesson from professional practice is not that every article needs a newsroom-sized process. It is that writing, editing, and verification are different modes of work, and that a piece should pass explicit gates between them.

For this blog, one Markdown file should remain the canonical published article. Private notes, source material, and drafts can live beside it in a gitignored workspace. A lightweight source ledger should connect every non-obvious factual claim to its origin. Git should preserve published revisions, while visible correction notes should explain substantive post-publication changes.

## What professional practice consistently emphasizes

### Accuracy is a lifecycle, not a final spell-check

Reuters puts accuracy ahead of speed, prefers named sources, asks reporters to cross-check information, record or take notes where allowed, and try to disprove as well as prove their story. It also expects transparent corrections. The [Reuters Journalistic Standards](https://reutersagency.com/about/standards-values/) are a useful compact statement of the discipline.

The [Society of Professional Journalists Code of Ethics](https://www.spj.org/spj-code-of-ethics/) similarly says to verify before publishing, use original sources where possible, identify sources clearly, provide access to source material when appropriate, and gather, update, and correct information throughout a story’s life.

**Translation:** verification starts during research, becomes systematic near the end of editing, and continues after publication.

### Structural editing should precede line-by-line fact-checking

The Knight Science Journalism handbook describes fact-checking as a line-by-line interrogation: “Where did we get this information?” and “How do we know it is true?” Its recommended process puts the dedicated fact-check near the end, after the writer and editor believe the structure and sourcing are substantially settled. It also recommends a final author review after fact-checking so late edits do not introduce new errors. See [The Fact-Checking Process](https://ksjhandbook.org/fact-checking-science-journalism-how-to-make-sure-your-stories-are-true/the-fact-checking-process/) and [Setting Up a Fact-Checking System](https://ksjhandbook.org/fact-checking-science-journalism-how-to-make-sure-your-stories-are-true/setting-up-a-fact-checking-system/).

**Translation:** do not meticulously verify sentences that may still be deleted or rewritten. First settle the argument and structure; then verify every surviving claim, quote, number, link, caption, and piece of metadata.

### Verification effort should match the article’s risk

The KSJ handbook distinguishes a magazine model, where an independent checker verifies every fact and the larger argument, from a newspaper model, where the writer owns verification and editors spot-check. It recommends a hybrid model that reserves intensive checking for complex or high-risk work. See [The Three Models of Fact-Checking](https://ksjhandbook.org/fact-checking-science-journalism-how-to-make-sure-your-stories-are-true/the-three-models-of-fact-checking/).

**Translation:** use three verification levels:

1. **Light** — personal notes and low-stakes opinion: confirm names, links, dates, quotations, and any factual assertions.
2. **Standard** — explainers and technical essays: claim-by-claim source pass plus a fresh editorial read.
3. **High-risk** — health, finance, security, allegations, or consequential advice: independent skeptical review, primary-source checks, and explicit uncertainty/limitations.

### Serious independent writers separate capture, drafting, and revision

Austin Kleon documents a practice of collecting notes and research, sharing selected work in public, and allowing daily pieces to accumulate into newsletters and books. He also recommends setting a draft aside before self-editing and postponing major structural changes until a new draft. See [Show Your Work!](https://austinkleon.com/2013/05/12/creative-mornings-talk/), [Workin’ on it](https://austinkleon.com/2018/03/26/workin-on-it/), and [Work and learn in evil days](https://austinkleon.com/2020/05/27/work-and-learn-in-evil-days/).

Independent writer JA Westenberg describes an idea inbox, a research shelf, and a board moving work through Idea → To Do → Drafting → Editing → Reviewing → Scheduled → Published. See [I built Kerouac](https://www.joanwestenberg.com/p/i-built-kerouac-github-contributions).

**Translation:** an idea should not have to become an article immediately. Keep a low-friction inbox, promote only promising notes into article briefs, and give revision its own stage and a little distance from drafting.

### Corrections must update both the page and the record

Reuters says errors should be rectified promptly, clearly, and comprehensively. The Guardian’s documented process adds notes to corrected archived articles, keeps serious corrections visible, and distributes correction information so an error is not repeated from an old copy. See [How the Guardian corrects the record in its archives](https://www.theguardian.com/commentisfree/2015/dec/14/how-we-correct-the-record-in-the-guardian-archives-as-well-as-on-our-pages).

**Translation:** fix the article, append a human-readable correction note for substantive changes, preserve the Git history, and make sure feeds/search indexes rebuild from the corrected source. Silent fixes are appropriate only for inconsequential typography.

## Recommended workflow for this repository

### 1. Capture

Record a single observation, question, quote, link, or possible thesis without forcing article metadata.

**Exit gate:** the note contains enough context that it will still make sense later.

### 2. Develop a brief

Promote a useful note into a short article brief:

- the reader and the problem or curiosity;
- the tentative claim or question;
- why the piece is worth writing now;
- what would change the writer’s mind;
- likely sources and missing evidence;
- article type and verification level;
- possible format, interactive element, or visual signature.

**Exit gate:** there is a specific promise to the reader and a feasible reporting plan.

### 3. Report and maintain provenance

Collect primary sources first. For each source, record:

- title, author/owner, canonical URL, and access date;
- source type and why it is credible;
- the claims, quotations, or data it supports;
- limitations, conflicts, uncertainty, and contrary evidence;
- local filename for any saved snapshot, transcript, or dataset.

Keep interview recordings, confidential material, copyrighted PDFs, and private contact details out of the public repository. Reuters’ advice to clarify ground rules, take notes, cross-check, and test contrary explanations is the right default.

The [Global Investigative Journalism Network’s fact-checking guide](https://gijn.org/resource/introduction-investigative-journalism-fact-checking/) recommends building this organization system at the start, annotating each factual statement with links, filenames, or recording timecodes, and archiving online sources because pages can change or disappear. A source ledger is therefore production infrastructure, not optional cleanup at the end.

**Exit gate:** the core claim is supported, important counterevidence has been considered, and gaps are either filled or explicitly acknowledged.

### 4. Outline and draft

Build an evidence-aware outline, then write for argument and voice. Mark unresolved claims rather than smoothing over them:

```md
<!-- TODO: SOURCE -->
<!-- TODO: VERIFY NUMBER -->
<!-- TODO: SEEK COUNTEREXAMPLE -->
```

AI may propose outline alternatives, questions, or counterarguments, but it should not erase the distinction between the writer’s reasoning and sourced fact.

**Exit gate:** a complete draft exists, even if inelegant, and every known research gap is visible.

### 5. Structural and editorial review

Review the reader promise, thesis, order, pacing, omissions, counterarguments, fairness, and ending before polishing sentences. For critical claims about identifiable people or organizations, seek a response before publication.

Then step away if the schedule permits. Kleon’s practice and the KSJ budget guidance both support returning with fresh eyes.

**Exit gate:** the structure is stable and the draft is ready to be challenged, not merely admired.

### 6. Verification pass

Annotate the near-final draft claim by claim and trace each factual statement back to the source ledger or direct experience. Check:

- names, titles, affiliations, dates, places, units, and statistics;
- quotations against recordings, transcripts, or original text;
- that links support the exact nearby claim;
- whether a source is primary, independent, current, and representative;
- caveats, uncertainty, counterevidence, and possible false balance;
- headlines, descriptions, captions, code samples, charts, and generated visuals;
- every factual statement introduced or rewritten by AI.

The [KSJ fact-checking checklist](https://ksjhandbook.org/fact-checking-science-journalism-how-to-make-sure-your-stories-are-true/the-fact-checking-process/) is a strong model. Run the final corrected text through one last author read.

**Exit gate:** no unresolved verification markers remain and every material claim has defensible evidence.

### 7. Copy edit and publication package

Polish clarity, grammar, style, accessibility, and consistency. Complete title, description, tags, dates, social image, alt text, canonical URL behavior, and AI disclosure. Preview the rendered page and test links, code blocks, small screens, and reduced-motion behavior.

**Exit gate:** both the prose and the rendered artifact are publishable.

### 8. Publish

Move or copy the approved Markdown file into the public content collection, commit it, let CI validate it, and deploy. The published file is the canonical article; the deployment commit identifies the exact first-publication state.

### 9. Correct, update, and archive

Classify later changes:

- **Typographic:** silently fix; Git retains the diff.
- **Clarification:** fix and add a dated note if meaning materially changed.
- **Correction:** fix promptly and add a prominent dated note describing what was wrong and what changed.
- **Update:** add new reporting without pretending it was part of the original publication; update the visible `updatedAt`.

Never rewrite history merely to look prescient. Preserve the original publication date and the Git record.

### 10. Reuse deliberately

After publication, capture reusable ideas rather than copying the article indiscriminately:

- a short note or social excerpt;
- a newsletter edition;
- a follow-up prompted by reader feedback;
- a related-post link;
- a talk, guide, or future collection.

Kleon’s private diary → public blog → newsletter → book rhythm demonstrates how small work can compound while each format has a distinct purpose.

## Suggested private/public file model

This preserves “one Markdown file per article” while allowing professional-grade provenance:

```text
private/                         # gitignored in this public repository
  inbox/                         # atomic notes
  articles/<slug>/
    brief.md
    sources.md                   # source ledger
    draft.md                     # canonical working draft
    assets/                      # recordings, PDFs, data snapshots

src/content/posts/
  <slug>.md                      # canonical published article
```

Because gitignored drafts have no Git backup, back up `private/` separately—ideally to a private repository or another encrypted/versioned store. Do not rely on the public repository for material it intentionally ignores.

Useful published frontmatter would include:

```yaml
publishedAt: 2026-07-31
updatedAt: 2026-07-31
reviewAfter: 2027-07-31
tags: [writing, systems]
verification: standard
aiAssistance: editorial
```

Keep correction notes in the article body or a structured `corrections` field so readers can see them. Keep detailed source notes private when they include copyrighted, confidential, or personally identifying material; expose ordinary citations as links in the article.

## AI assistance and disclosure policy

The Associated Press says AI output must be treated as unvetted source material, holds journalists responsible for accuracy, and warns against entering confidential or sensitive information into AI systems. Its July 2026 update permits specific assistive uses while retaining human review and requires disclosure when generative AI plays a material role. See [AP’s generative-AI standards](https://www.ap.org/the-definitive-source/behind-the-news/standards-around-generative-ai/) and [the 2026 update](https://www.ap.org/the-definitive-source/announcements/ap-updates-newsroom-standards-for-artificial-intelligence/).

The Guardian likewise requires human oversight and accountability and says significant generated elements should have a specific benefit, editorial approval, and reader-facing transparency. See [The Guardian’s approach to generative AI](https://www.theguardian.com/help/insideguardian/2023/jun/16/the-guardians-approach-to-generative-ai).

[ProPublica’s AI principles](https://www.propublica.org/ai-principles) reach the same operational standard: staff remain responsible, generated material is independently verified, meaningful use is disclosed, and confidential source material stays out of public AI tools.

Recommended local policy:

1. **AI is never a source.** Trace factual output to a primary or otherwise authoritative source.
2. **The writer remains accountable.** No generated sentence bypasses human review.
3. **Protect private material.** Do not send confidential sources, unpublished sensitive reporting, personal data, secrets, or copyrighted source archives to tools without an explicit, acceptable data policy.
4. **Log meaningful assistance privately.** Record the tool, purpose, date, and affected stage when AI materially shapes research, argument, prose, code, or visuals.
5. **Disclose material contribution publicly.** Routine spelling or formatting help need not burden readers. Disclose generated passages, substantive synthesis, translation relied upon for meaning, data analysis, or generated media that materially affects the published work.
6. **Prefer assistance that preserves authorship.** Good uses include questions, counterarguments, outline variants, consistency checks, copy suggestions, metadata, and verification checklists. Consider an AI-free first-draft mode when finding the author’s own argument or voice is the point.

## Local skills this workflow should support

The skills should be small, composable, and stage-aware:

1. **Capture note** — save an atomic observation or source without inventing an article.
2. **Develop article brief** — turn selected notes into a reader promise, thesis/question, reporting plan, risk level, and definition of done.
3. **Research article** — build or update the source ledger using primary sources; separate evidence, inference, and open questions.
4. **Draft from notes** — create a complete draft while preserving unresolved verification markers and the author’s chosen voice constraints.
5. **Structural edit** — challenge argument, order, missing perspectives, repetition, and reader value without prematurely copy-editing.
6. **Fact-check article** — perform the risk-tiered claim-to-source pass and emit a blocking checklist.
7. **Copy and package** — edit prose and prepare metadata, citations, accessibility, tags, disclosure, and preview checks.
8. **Publish article** — require completed gates, move the canonical file, validate, commit, and deploy.
9. **Correct or update article** — classify the change, preserve dates/history, and generate the appropriate visible note.
10. **Repurpose article** — extract format-specific derivatives without mutating the canonical article or fabricating new claims.

Each skill should begin by stating the current stage, inputs, allowed transformations, and exit gate. Publishing and correction skills should be the only ones authorized to change public article state.

## Bottom line

The best fit is a hybrid of newsroom rigor and an independent writer’s lightweight pipeline: frictionless private capture, selective promotion into briefs, source-aware drafting, structural editing before verification, verification proportionate to risk, a deliberate publication gate, and transparent maintenance afterward. AI can help at every stage, but provenance, judgment, voice, and accountability should remain human-owned.
