import { randomUUID } from 'node:crypto';
import { readFile, rename, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { controlledTagIds } from '../src/content/contract.mjs';
import { validatePostFile } from './content-contract.mjs';
import { correctPost } from './correction-lib.mjs';
import {
  isIsoDate,
  parseMarkdownDocument,
  serializeMarkdownDocument,
} from './markdown-lib.mjs';
import { requireHumanApproval, requireSlug } from './workspace-lib.mjs';

const utf8 = 'utf8';

/** Today's date as YYYY-MM-DD in UTC. */
export function today() {
  return new Date().toISOString().slice(0, 10);
}

function requireText(value, option) {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`${option} is required.`);
  }
  return value.trim();
}

function requireTags(value) {
  const tags = requireText(value, '--tags')
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);
  const unknown = tags.filter((tag) => !controlledTagIds.includes(tag));
  if (tags.length < 1 || tags.length > 4 || unknown.length > 0) {
    throw new Error(
      `--tags must list one to four of: ${controlledTagIds.join(', ')}.`,
    );
  }
  return tags;
}

/**
 * Create an AI-generated Post (ADR 0019) with a fresh stable id and the
 * visible notice switched on. The body is a placeholder for the agent to
 * replace; the file is validated against the public content contract.
 */
export async function createAiPost({
  postsDirectory,
  slug,
  title,
  description,
  tags,
  date = today(),
}) {
  requireSlug(slug);
  if (!isIsoDate(date)) {
    throw new Error('--date must be an ISO date (YYYY-MM-DD).');
  }
  const postFile = path.join(postsDirectory, `${slug}.md`);
  try {
    await readFile(postFile, utf8);
    throw new Error(`${postFile} already exists; AI Posts never overwrite.`);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }

  const data = {
    id: randomUUID(),
    title: requireText(title, '--title'),
    description: requireText(description, '--description'),
    publishedAt: date,
    tags: requireTags(tags),
    aiGenerated: true,
  };
  const body = 'Write the Post here.\n';
  const temporaryFile = path.join(
    postsDirectory,
    `.${slug}.new.${randomUUID()}.md`,
  );
  try {
    await writeFile(temporaryFile, serializeMarkdownDocument(data, body), utf8);
    await validatePostFile(temporaryFile, slug);
    await rename(temporaryFile, postFile);
  } finally {
    await rm(temporaryFile, { force: true });
  }
  return postFile;
}

/**
 * Record Paolo's review of an AI-generated Post: remove the notice and add a
 * dated, visible revision through the normal Correction machinery.
 */
export async function reviewAiPost({
  postsDirectory,
  slug,
  approvedBy,
  date = today(),
  summary,
}) {
  const reviewer = requireHumanApproval(approvedBy);
  requireSlug(slug);
  const postFile = path.join(postsDirectory, `${slug}.md`);
  const current = parseMarkdownDocument(
    await readFile(postFile, utf8),
    postFile,
  );
  if (current.data.aiGenerated !== true) {
    throw new Error(
      `${slug} is not an unreviewed AI-generated Post; use pnpm post:correct for other changes.`,
    );
  }

  const nextData = { ...current.data };
  delete nextData.aiGenerated;
  const replacementFile = path.join(
    postsDirectory,
    `.${slug}.review.${randomUUID()}.md`,
  );
  await writeFile(
    replacementFile,
    serializeMarkdownDocument(nextData, current.body),
    utf8,
  );
  try {
    return await correctPost({
      postsDirectory,
      slug,
      replacementFile,
      kind: 'revision',
      date,
      summary:
        summary ??
        `${reviewer} reviewed this AI-generated Post and removed the AI-generated notice.`,
      approvedBy: reviewer,
    });
  } finally {
    await rm(replacementFile, { force: true });
  }
}
