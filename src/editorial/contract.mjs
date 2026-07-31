export const editorialWorkflowContract = Object.freeze({
  version: 1,
  sidecars: Object.freeze({
    brief: 'brief.md',
    sources: 'sources.md',
    factCheck: 'fact-check.md',
    counterDiscussion: 'counter-discussion.md',
    publicationCheck: 'publication-check.md',
  }),
  counterDiscussionDispositions: Object.freeze([
    'fixed',
    'rejected',
    'accepted',
  ]),
  sourcesProposals: Object.freeze(['included', 'omitted']),
  aiDisclosureDecisions: Object.freeze(['included', 'not-material']),
});
