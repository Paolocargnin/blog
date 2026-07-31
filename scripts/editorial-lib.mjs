import { readFile, rename, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { parse, stringify } from 'yaml';

import { contentContract, slugPattern } from '../src/content/contract.mjs';
import { editorialWorkflowContract } from '../src/editorial/contract.mjs';

const utf8 = 'utf8';
const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;
const unresolvedMarkerPattern =
  /<!--\s*TODO:\s*(?:SOURCE|VERIFY(?:\s+NUMBER)?|SEEK\s+COUNTEREXAMPLE)\s*-->/i;

export class EditorialGateError extends Error {
  constructor(errors) {
    super(
      `Editorial publication gates failed:\n${errors.map((error) => `- ${error}`).join('\n')}`,
    );
    this.name = 'EditorialGateError';
    this.errors = errors;
  }
}

async function exists(target) {
  try {
    await stat(target);
    return true;
  } catch {
    return false;
  }
}

function requireSlug(slug) {
  if (typeof slug !== 'string' || !slugPattern.test(slug)) {
    throw new Error('A lowercase hyphenated --slug is required.');
  }
  return slug;
}

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isIsoDate(value) {
  if (typeof value !== 'string' || !isoDatePattern.test(value)) {
    return false;
  }
  const parsed = new Date(`${value}T00:00:00Z`);
  return (
    !Number.isNaN(parsed.valueOf()) &&
    parsed.toISOString().slice(0, 10) === value
  );
}

function parseMarkdown(source, filePath, errors) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) {
    errors.push(`${filePath}: YAML frontmatter is required.`);
    return { data: {}, body: source };
  }

  try {
    const data = parse(match[1]);
    if (!isPlainObject(data)) {
      errors.push(`${filePath}: frontmatter must be a mapping.`);
      return { data: {}, body: source.slice(match[0].length) };
    }
    return { data, body: source.slice(match[0].length) };
  } catch (error) {
    errors.push(`${filePath}: invalid YAML frontmatter (${error.message}).`);
    return { data: {}, body: source };
  }
}

function requireText(data, field, filePath, errors) {
  if (typeof data[field] !== 'string' || data[field].trim() === '') {
    errors.push(`${filePath}: ${field} must be a non-empty string.`);
  }
}

function requireReviewHeader(data, filePath, errors) {
  if (data.workflowVersion !== editorialWorkflowContract.version) {
    errors.push(
      `${filePath}: workflowVersion must be ${editorialWorkflowContract.version}.`,
    );
  }
  requireText(data, 'reviewedBy', filePath, errors);
  if (!isIsoDate(data.reviewedAt)) {
    errors.push(`${filePath}: reviewedAt must be an ISO date (YYYY-MM-DD).`);
  }
}

async function readEvidence(filePath, errors) {
  if (!(await exists(filePath))) {
    errors.push(`${filePath}: required editorial evidence is missing.`);
    return { data: {}, body: '' };
  }
  return parseMarkdown(await readFile(filePath, utf8), filePath, errors);
}

function factCheckErrors(data, body, filePath, errors) {
  requireReviewHeader(data, filePath, errors);
  if (data.independent !== true) {
    errors.push(
      `${filePath}: independent must be true after a fresh fact-checking pass.`,
    );
  }
  if (data.status !== 'passed') {
    errors.push(`${filePath}: status must be passed.`);
  }
  if (/^\s*-\s+\[ \]/m.test(body)) {
    errors.push(`${filePath}: every fact-check item must be resolved.`);
  }
}

function counterDiscussionErrors(data, body, filePath, errors) {
  requireReviewHeader(data, filePath, errors);
  if (data.status !== 'resolved') {
    errors.push(`${filePath}: status must be resolved.`);
  }
  if (!Array.isArray(data.findings)) {
    errors.push(`${filePath}: findings must be an array.`);
  } else {
    data.findings.forEach((finding, index) => {
      const description = `${filePath}: findings[${index}]`;
      if (!isPlainObject(finding)) {
        errors.push(`${description} must be a mapping.`);
        return;
      }
      requireText(finding, 'summary', description, errors);
      if (
        !editorialWorkflowContract.counterDiscussionDispositions.includes(
          finding.disposition,
        )
      ) {
        errors.push(
          `${description}.disposition must be fixed, rejected, or accepted.`,
        );
      }
      requireText(finding, 'rationale', description, errors);
    });
  }
  if (/^\s*-\s+\[ \]/m.test(body)) {
    errors.push(`${filePath}: every counter-discussion item must be resolved.`);
  }
}

function publicationCheckErrors(data, body, articleBody, filePath, errors) {
  if (data.workflowVersion !== editorialWorkflowContract.version) {
    errors.push(
      `${filePath}: workflowVersion must be ${editorialWorkflowContract.version}.`,
    );
  }
  requireText(data, 'preparedBy', filePath, errors);
  if (!isIsoDate(data.preparedAt)) {
    errors.push(`${filePath}: preparedAt must be an ISO date (YYYY-MM-DD).`);
  }
  if (data.status !== 'ready') {
    errors.push(`${filePath}: status must be ready.`);
  }
  if (
    !editorialWorkflowContract.sourcesProposals.includes(data.sourcesProposal)
  ) {
    errors.push(`${filePath}: sourcesProposal must be included or omitted.`);
  }
  requireText(data, 'sourcesRationale', filePath, errors);
  if (
    data.sourcesProposal === 'included' &&
    !/^## Sources\s*$/im.test(articleBody)
  ) {
    errors.push(
      `${filePath}: an included Sources proposal requires a public ## Sources section.`,
    );
  }
  if (
    data.sourcesProposal === 'omitted' &&
    /^## Sources\s*$/im.test(articleBody)
  ) {
    errors.push(
      `${filePath}: an omitted Sources proposal conflicts with the public ## Sources section.`,
    );
  }
  if (
    !editorialWorkflowContract.aiDisclosureDecisions.includes(data.aiDisclosure)
  ) {
    errors.push(`${filePath}: aiDisclosure must be included or not-material.`);
  }
  requireText(data, 'aiDisclosureRationale', filePath, errors);
  if (
    data.aiDisclosure === 'included' &&
    !/^## AI disclosure\s*$/im.test(articleBody)
  ) {
    errors.push(
      `${filePath}: an included AI disclosure requires a public ## AI disclosure section.`,
    );
  }
  if (
    data.aiDisclosure === 'not-material' &&
    /^## AI disclosure\s*$/im.test(articleBody)
  ) {
    errors.push(
      `${filePath}: a not-material AI decision conflicts with the public ## AI disclosure section.`,
    );
  }
  if (/^\s*-\s+\[ \]/m.test(body)) {
    errors.push(`${filePath}: every publication-check item must be resolved.`);
  }
}

const templates = Object.freeze({
  brief: `# Article brief\n\n## Reader promise\n\n## Tentative claim or question\n\n## Why now\n\n## What would change the Author's mind\n\n## Reporting plan and verification level\n`,
  sources: `# Private source ledger\n\nRecord the owner, canonical URL or locator, access date, supported claims, verification notes, limitations, and contrary evidence for each source. Record why no external sources are needed when the article is purely personal.\n`,
  'fact-check': `---\nworkflowVersion: 1\nreviewedBy: ""\nreviewedAt: ""\nindependent: false\nstatus: open\n---\n\n# Fact-check\n\n- [ ] Verify every factual claim, quotation, number, link, code sample, and piece of metadata against attributable evidence.\n- [ ] Verify every factual statement introduced or rewritten by AI.\n- [ ] Record corrections and remaining uncertainty below.\n`,
  'counter-discussion': `---\nworkflowVersion: 1\nreviewedBy: ""\nreviewedAt: ""\nstatus: open\nfindings: []\n---\n\n# Counter-discussion\n\nChallenge the thesis, evidence, assumptions, missing perspectives, and strongest plausible objections. Record every finding in frontmatter with a disposition and rationale; keep the review separate from the article.\n`,
  'publication-check': `---\nworkflowVersion: 1\npreparedBy: ""\npreparedAt: ""\nstatus: open\nsourcesProposal: pending\nsourcesRationale: ""\naiDisclosure: pending\naiDisclosureRationale: ""\n---\n\n# Publication check\n\n- [ ] Re-read the final text after fact-check and counter-discussion changes.\n- [ ] Check title, description, date, controlled tags, links, accessibility, and rendered layout.\n- [ ] Confirm the public Sources proposal and AI-disclosure decision above.\n`,
});

const allowedLifecycleByKind = Object.freeze({
  brief: ['drafts'],
  sources: ['drafts'],
  'fact-check': ['publication-candidates'],
  'counter-discussion': ['publication-candidates'],
  'publication-check': ['publication-candidates'],
});

export async function locateWorkingArticle({ workspace, slug }) {
  requireSlug(slug);
  const matches = [];
  for (const lifecycle of contentContract.workspace.lifecycleDirectories) {
    const directory = path.join(workspace, lifecycle, slug);
    if (await exists(directory)) {
      matches.push({ lifecycle, directory });
    }
  }
  if (matches.length === 0) {
    return null;
  }
  if (matches.length > 1) {
    throw new Error(
      `${slug} exists in multiple lifecycle directories; resolve the Workspace before continuing.`,
    );
  }
  return matches[0];
}

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
  if (!(await exists(filePath))) {
    return;
  }
  const errors = [];
  const source = await readFile(filePath, utf8);
  const document = parseMarkdown(source, filePath, errors);
  if (errors.length > 0) {
    return;
  }
  if (kind === 'fact-check') {
    document.data.independent = false;
    document.data.status = 'open';
  } else if (kind === 'counter-discussion') {
    document.data.status = 'open';
  } else {
    document.data.status = 'open';
    document.data.sourcesProposal = 'pending';
    document.data.aiDisclosure = 'pending';
  }
  await writeFile(
    filePath,
    `---\n${stringify(document.data).trimEnd()}\n---\n\n${document.body.replace(/^\s+/, '')}`,
    utf8,
  );
}

export async function returnCandidateToDraft({ workspace, slug }) {
  const article = await locateWorkingArticle({ workspace, slug });
  if (!article || article.lifecycle !== 'publication-candidates') {
    throw new Error(`${slug}: a Publication candidate is required.`);
  }
  const draftDirectory = path.join(workspace, 'drafts', slug);
  if (await exists(draftDirectory)) {
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

export async function publicationGateErrors({ workspace, slug }) {
  const errors = [];
  const article = await locateWorkingArticle({ workspace, slug });
  if (!article || article.lifecycle !== 'publication-candidates') {
    errors.push(
      `${slug}: a Publication candidate is required before publication checks.`,
    );
    return errors;
  }

  const articleFile = path.join(
    article.directory,
    contentContract.workspace.articleFile,
  );
  const articleDocument = parseMarkdown(
    await readFile(articleFile, utf8),
    articleFile,
    errors,
  );
  if (unresolvedMarkerPattern.test(articleDocument.body)) {
    errors.push(`${articleFile}: unresolved verification markers remain.`);
  }

  const sidecars = editorialWorkflowContract.sidecars;
  const sourcesFile = path.join(article.directory, sidecars.sources);
  if (!(await exists(sourcesFile))) {
    errors.push(`${sourcesFile}: a private source ledger is required.`);
  }

  const factCheckFile = path.join(article.directory, sidecars.factCheck);
  const factCheck = await readEvidence(factCheckFile, errors);
  factCheckErrors(factCheck.data, factCheck.body, factCheckFile, errors);

  const counterFile = path.join(article.directory, sidecars.counterDiscussion);
  const counterDiscussion = await readEvidence(counterFile, errors);
  counterDiscussionErrors(
    counterDiscussion.data,
    counterDiscussion.body,
    counterFile,
    errors,
  );

  const publicationFile = path.join(
    article.directory,
    sidecars.publicationCheck,
  );
  const publicationCheck = await readEvidence(publicationFile, errors);
  publicationCheckErrors(
    publicationCheck.data,
    publicationCheck.body,
    articleDocument.body,
    publicationFile,
    errors,
  );

  return errors;
}

export async function validatePublicationEvidence(options) {
  const errors = await publicationGateErrors(options);
  if (errors.length > 0) {
    throw new EditorialGateError(errors);
  }
}

export async function editorialStatus({ workspace, postsDirectory, slug }) {
  requireSlug(slug);
  const postFile = path.join(postsDirectory, `${slug}.md`);
  if (await exists(postFile)) {
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
    if (!(await exists(path.join(article.directory, 'brief.md')))) {
      return { stage: 'draft', nextSkill: 'blog-develop' };
    }
    if (!(await exists(path.join(article.directory, 'sources.md')))) {
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
