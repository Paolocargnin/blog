import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { contentContract } from '../src/content/contract.mjs';
import { editorialWorkflowContract } from '../src/editorial/contract.mjs';
import { locateWorkingArticle, pathExists } from './editorial-paths.mjs';
import {
  isIsoDate,
  isPlainObject,
  parseMarkdownDocument,
  serializeMarkdownDocument,
} from './markdown-lib.mjs';

const utf8 = 'utf8';
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

function requireText(data, field, filePath, errors) {
  if (typeof data[field] !== 'string' || data[field].trim() === '') {
    errors.push(`${filePath}: ${field} must be a non-empty string.`);
  }
}

function requireReviewHeader(data, filePath, expectedDigest, errors) {
  if (data.workflowVersion !== editorialWorkflowContract.version) {
    errors.push(
      `${filePath}: workflowVersion must be ${editorialWorkflowContract.version}.`,
    );
  }
  requireText(data, 'reviewedBy', filePath, errors);
  if (!isIsoDate(data.reviewedAt)) {
    errors.push(`${filePath}: reviewedAt must be an ISO date (YYYY-MM-DD).`);
  }
  if (data.candidateDigest !== expectedDigest) {
    errors.push(
      `${filePath}: candidateDigest does not match the current article and source ledger.`,
    );
  }
}

function readMarkdown(source, filePath, errors) {
  try {
    return parseMarkdownDocument(source, filePath);
  } catch (error) {
    errors.push(error.message);
    return { data: {}, body: source };
  }
}

async function readEvidence(filePath, errors) {
  if (!(await pathExists(filePath))) {
    errors.push(`${filePath}: required editorial evidence is missing.`);
    return { data: {}, body: '' };
  }
  return readMarkdown(await readFile(filePath, utf8), filePath, errors);
}

function factCheckErrors(data, body, filePath, expectedDigest, errors) {
  requireReviewHeader(data, filePath, expectedDigest, errors);
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

function counterDiscussionErrors(data, body, filePath, expectedDigest, errors) {
  requireReviewHeader(data, filePath, expectedDigest, errors);
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

function publicationCheckErrors(
  data,
  body,
  articleBody,
  filePath,
  expectedDigest,
  errors,
) {
  if (data.workflowVersion !== editorialWorkflowContract.version) {
    errors.push(
      `${filePath}: workflowVersion must be ${editorialWorkflowContract.version}.`,
    );
  }
  requireText(data, 'preparedBy', filePath, errors);
  if (!isIsoDate(data.preparedAt)) {
    errors.push(`${filePath}: preparedAt must be an ISO date (YYYY-MM-DD).`);
  }
  if (data.candidateDigest !== expectedDigest) {
    errors.push(
      `${filePath}: candidateDigest does not match the current article and source ledger.`,
    );
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

export function hasUnresolvedVerificationMarkers(source) {
  return unresolvedMarkerPattern.test(source);
}

export async function candidateSnapshot({ workspace, slug }) {
  const article = await locateWorkingArticle({ workspace, slug });
  if (!article || article.lifecycle !== 'publication-candidates') {
    throw new Error(`${slug}: a Publication candidate is required.`);
  }
  const articleFile = path.join(
    article.directory,
    contentContract.workspace.articleFile,
  );
  const sourcesFile = path.join(
    article.directory,
    editorialWorkflowContract.sidecars.sources,
  );
  const articleSource = await readFile(articleFile, utf8);
  const sourcesSource = (await pathExists(sourcesFile))
    ? await readFile(sourcesFile, utf8)
    : '<absent>';
  const digest = createHash('sha256')
    .update(`editorial-workflow:${editorialWorkflowContract.version}\0`)
    .update(`slug\0${slug}\0`)
    .update(`article.md\0${articleSource}\0`)
    .update(`sources.md\0${sourcesSource}`)
    .digest('hex');
  return { articleSource, digest };
}

export async function candidateDigest(options) {
  return (await candidateSnapshot(options)).digest;
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
  if (!(await pathExists(articleFile))) {
    errors.push(`${articleFile}: article.md is required.`);
    return errors;
  }
  const articleDocument = readMarkdown(
    await readFile(articleFile, utf8),
    articleFile,
    errors,
  );
  if (hasUnresolvedVerificationMarkers(articleDocument.body)) {
    errors.push(`${articleFile}: unresolved verification markers remain.`);
  }

  const expectedDigest = await candidateDigest({ workspace, slug });
  const sidecars = editorialWorkflowContract.sidecars;
  const factCheckFile = path.join(article.directory, sidecars.factCheck);
  const factCheck = await readEvidence(factCheckFile, errors);
  factCheckErrors(
    factCheck.data,
    factCheck.body,
    factCheckFile,
    expectedDigest,
    errors,
  );

  const counterFile = path.join(article.directory, sidecars.counterDiscussion);
  const counterDiscussion = await readEvidence(counterFile, errors);
  counterDiscussionErrors(
    counterDiscussion.data,
    counterDiscussion.body,
    counterFile,
    expectedDigest,
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
    expectedDigest,
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

export async function recordPublicationApproval({
  workspace,
  slug,
  approvedBy,
  approvedDigest,
}) {
  const article = await locateWorkingArticle({ workspace, slug });
  const publicationFile = path.join(
    article.directory,
    editorialWorkflowContract.sidecars.publicationCheck,
  );
  const document = parseMarkdownDocument(
    await readFile(publicationFile, utf8),
    publicationFile,
  );
  document.data.approvedBy = approvedBy;
  document.data.approvedDigest = approvedDigest;
  document.data.approvedAt = new Date().toISOString().slice(0, 10);
  await writeFile(
    publicationFile,
    serializeMarkdownDocument(document.data, document.body),
    utf8,
  );
}
