/**
 * The single, versioned content contract shared by local checks and the
 * production build. Changes here require a migration plan for existing
 * Workspace articles (ADR 0004).
 */
export const CONTENT_CONTRACT_VERSION = 1;

export const contentContract = Object.freeze({
  version: CONTENT_CONTRACT_VERSION,
  workspace: Object.freeze({
    manifest: 'content-contract.json',
    lifecycleDirectories: Object.freeze([
      'notes',
      'drafts',
      'publication-candidates',
    ]),
    articleFile: 'article.md',
    acceptedSidecars: Object.freeze([
      'brief.md',
      'sources.md',
      'notes.md',
      'fact-check.md',
      'counter-discussion.md',
      'publication-check.md',
    ]),
  }),
  tags: Object.freeze({
    ai: 'AI',
    blogging: 'Blogging',
    craft: 'Craft',
    design: 'Design',
    engineering: 'Engineering',
    systems: 'Systems',
    writing: 'Writing',
  }),
  post: Object.freeze({
    requiredMetadata: Object.freeze([
      'id',
      'title',
      'description',
      'publishedAt',
      'tags',
    ]),
    optionalMetadata: Object.freeze(['updatedAt', 'corrections']),
  }),
});

export const controlledTagIds = Object.freeze(
  Object.keys(contentContract.tags),
);

export const stableIdPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
