import { readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { contentContract } from '../src/content/contract.mjs';
import { validatePostFile } from './content-contract.mjs';
import {
  hasUnresolvedVerificationMarkers,
  publicationGateErrors,
} from './editorial-evidence.mjs';
import {
  locateWorkingArticle,
  pathExists,
  requireEditorialSlug,
} from './editorial-paths.mjs';
import {
  parseMarkdownDocument,
  markdownSections,
  serializeMarkdownDocument,
} from './markdown-lib.mjs';

export {
  candidateDigest,
  candidateSnapshot,
  EditorialGateError,
  publicationGateErrors,
  recordPublicationApproval,
  validatePublicationEvidence,
} from './editorial-evidence.mjs';
export { locateWorkingArticle } from './editorial-paths.mjs';

const utf8 = 'utf8';
const briefSections = Object.freeze([
  'reader promise',
  'tentative claim or question',
  'why now',
  "what would change the author's mind",
  'reporting plan and verification level',
  'exit gate',
]);

const templates = Object.freeze({
  brief: `# Article brief\n\n## Reader promise\n\n## Tentative claim or question\n\n## Why now\n\n## What would change the Author's mind\n\n## Reporting plan and verification level\n\n## Exit gate\n`,
  sources: `# Private source ledger\n\nRecord the owner, canonical URL or locator, access date, supported claims, verification notes, limitations, and contrary evidence for each source. Record why no external sources are needed when the article is purely personal.\n`,
  'fact-check': `---\nworkflowVersion: 1\nreviewedBy: ""\nreviewedAt: ""\ncandidateDigest: ""\nindependent: false\nstatus: open\n---\n\n# Fact-check\n\n- [ ] Verify every factual claim, quotation, number, link, code sample, and piece of metadata against attributable evidence.\n- [ ] Verify every factual statement introduced or rewritten by AI.\n- [ ] Record corrections and remaining uncertainty below.\n`,
  'counter-discussion': `---\nworkflowVersion: 1\nreviewedBy: ""\nreviewedAt: ""\ncandidateDigest: ""\nstatus: open\nfindings: []\n---\n\n# Counter-discussion\n\nChallenge the thesis, evidence, assumptions, missing perspectives, and strongest plausible objections. Record every finding in frontmatter with a disposition and rationale; keep the review separate from the article.\n`,
  'publication-check': `---\nworkflowVersion: 1\npreparedBy: ""\npreparedAt: ""\ncandidateDigest: ""\nstatus: open\nsourcesProposal: pending\nsourcesRationale: ""\naiDisclosure: pending\naiDisclosureRationale: ""\n---\n\n# Publication check\n\n- [ ] Re-read the final text after fact-check and counter-discussion changes.\n- [ ] Check title, description, date, controlled tags, links, accessibility, and rendered layout.\n- [ ] Confirm the public Sources proposal and AI-disclosure decision above.\n`,
});

const allowedLifecycleByKind = Object.freeze({
  brief: ['drafts'],
  sources: ['drafts'],
  'fact-check': ['publication-candidates'],
  'counter-discussion': ['publication-candidates'],
  'publication-check': ['publication-candidates'],
});

export async function createEditorialFile({ workspace, slug, kind }) {
  const article = await locateWorkingArticle({ workspace, slug });
  if (!article) {
    throw new Error(`${slug} does not exist in the Workspace.`);
  }
  if (!(kind in templates)) {
    throw new Error(
      `Unknown --kind. Use ${Object.keys(templates).join(', ')}.`,
    );
  }
  if (!allowedLifecycleByKind[kind].includes(article.lifecycle)) {
    throw new Error(
      `${kind} belongs in ${allowedLifecycleByKind[kind].join(' or ')}, not ${article.lifecycle}.`,
    );
  }

  const filePath = path.join(article.directory, `${kind}.md`);
  try {
    await writeFile(filePath, templates[kind], { encoding: utf8, flag: 'wx' });
  } catch (error) {
    if (error?.code === 'EEXIST') {
      throw new Error(`${filePath} already exists; preserve and edit it.`);
    }
    throw error;
  }
  return filePath;
}

async function invalidateEvidence(filePath, kind) {
  if (!(await pathExists(filePath))) {
    return;
  }
  let document;
  try {
    document = parseMarkdownDocument(await readFile(filePath, utf8), filePath);
  } catch {
    return;
  }
  document.data.candidateDigest = '';
  if (kind === 'fact-check') {
    document.data.independent = false;
    document.data.status = 'open';
  } else if (kind === 'counter-discussion') {
    document.data.status = 'open';
  } else {
    document.data.status = 'open';
    document.data.sourcesProposal = 'pending';
    document.data.aiDisclosure = 'pending';
    delete document.data.approvedBy;
    delete document.data.approvedDigest;
    delete document.data.approvedAt;
  }
  await writeFile(
    filePath,
    serializeMarkdownDocument(document.data, document.body),
    utf8,
  );
}

export async function returnCandidateToDraft({ workspace, slug }) {
  const article = await locateWorkingArticle({ workspace, slug });
  if (!article || article.lifecycle !== 'publication-candidates') {
    throw new Error(`${slug}: a Publication candidate is required.`);
  }
  const draftDirectory = path.join(workspace, 'drafts', slug);
  if (await pathExists(draftDirectory)) {
    throw new Error(`${draftDirectory} already exists.`);
  }
  for (const kind of [
    'fact-check',
    'counter-discussion',
    'publication-check',
  ]) {
    await invalidateEvidence(path.join(article.directory, `${kind}.md`), kind);
  }
  await rename(article.directory, draftDirectory);
  return draftDirectory;
}

async function draftIsContentComplete(articleDirectory, slug) {
  const articleFile = path.join(
    articleDirectory,
    contentContract.workspace.articleFile,
  );
  const briefFile = path.join(articleDirectory, 'brief.md');
  if (!(await pathExists(articleFile)) || !(await pathExists(briefFile))) {
    return false;
  }
  const articleSource = await readFile(articleFile, utf8);
  let article;
  try {
    article = parseMarkdownDocument(articleSource, articleFile);
    await validatePostFile(articleFile, slug);
  } catch {
    return false;
  }
  if (article.body.trim() === '') {
    return false;
  }

  const briefSource = await readFile(briefFile, utf8);
  const sections = new Map(
    markdownSections(briefSource).map((section) => [
      section.title.toLowerCase(),
      briefSource.slice(section.contentStart, section.end).trim(),
    ]),
  );
  return briefSections.every((title) => sections.get(title));
}

export async function editorialStatus({ workspace, postsDirectory, slug }) {
  requireEditorialSlug(slug);
  const postFile = path.join(postsDirectory, `${slug}.md`);
  if (await pathExists(postFile)) {
    return { stage: 'post', nextSkill: 'blog-correct' };
  }

  const article = await locateWorkingArticle({ workspace, slug });
  if (!article) {
    return { stage: 'missing', nextSkill: 'blog-capture' };
  }
  if (article.lifecycle === 'notes') {
    return { stage: 'note', nextSkill: 'blog-develop' };
  }
  if (article.lifecycle === 'drafts') {
    if (!(await draftIsContentComplete(article.directory, slug))) {
      return { stage: 'draft', nextSkill: 'blog-develop' };
    }
    const draftFile = path.join(
      article.directory,
      contentContract.workspace.articleFile,
    );
    if (hasUnresolvedVerificationMarkers(await readFile(draftFile, utf8))) {
      return { stage: 'draft', nextSkill: 'blog-report' };
    }
    return { stage: 'draft', nextSkill: 'blog-promote' };
  }

  const errors = await publicationGateErrors({ workspace, slug });
  if (errors.some((error) => error.includes('fact-check.md'))) {
    return { stage: 'publication-candidate', nextSkill: 'blog-fact-check' };
  }
  if (errors.some((error) => error.includes('counter-discussion.md'))) {
    return {
      stage: 'publication-candidate',
      nextSkill: 'blog-counter-discuss',
    };
  }
  if (errors.length > 0) {
    return { stage: 'publication-candidate', nextSkill: 'blog-package' };
  }
  return { stage: 'publication-candidate', nextSkill: 'blog-publish' };
}
