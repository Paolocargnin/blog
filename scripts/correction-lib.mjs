import { randomUUID } from 'node:crypto';
import { readFile, rename, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { parse, stringify } from 'yaml';

import { validatePostFile } from './content-contract.mjs';
import { requireHumanApproval, requireSlug } from './workspace-lib.mjs';

const utf8 = 'utf8';
const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;

function parsePost(source, filePath) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) {
    throw new Error(`${filePath}: YAML frontmatter is required.`);
  }
  const data = parse(match[1]);
  if (data === null || typeof data !== 'object' || Array.isArray(data)) {
    throw new Error(`${filePath}: frontmatter must be a mapping.`);
  }
  return { data, body: source.slice(match[0].length) };
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

export async function correctPost({
  postsDirectory,
  slug,
  replacementFile,
  kind,
  date,
  summary,
  approvedBy,
}) {
  requireHumanApproval(approvedBy);
  requireSlug(slug);
  if (!['typo', 'correction', 'revision'].includes(kind)) {
    throw new Error('--kind must be typo, correction, or revision.');
  }
  if (typeof replacementFile !== 'string' || replacementFile.trim() === '') {
    throw new Error('A complete proposed Post is required with --replacement.');
  }

  const postFile = path.join(postsDirectory, `${slug}.md`);
  const current = parsePost(await readFile(postFile, utf8), postFile);
  const replacementPath = path.resolve(replacementFile);
  const replacement = parsePost(
    await readFile(replacementPath, utf8),
    replacementPath,
  );
  if (replacement.data.id !== current.data.id) {
    throw new Error('A Correction must preserve the stable Post id.');
  }
  if (replacement.data.publishedAt !== current.data.publishedAt) {
    throw new Error(
      'A Correction must preserve the original publishedAt date.',
    );
  }

  const nextData = { ...replacement.data };
  if (kind === 'typo') {
    if (current.data.updatedAt === undefined) {
      delete nextData.updatedAt;
      delete nextData.corrections;
    } else {
      nextData.updatedAt = current.data.updatedAt;
      nextData.corrections = current.data.corrections;
    }
  } else {
    if (!isIsoDate(date)) {
      throw new Error('--date must be an ISO date (YYYY-MM-DD).');
    }
    if (
      date < current.data.publishedAt ||
      (typeof current.data.updatedAt === 'string' &&
        date < current.data.updatedAt)
    ) {
      throw new Error(
        '--date cannot precede the Post publication or latest update date.',
      );
    }
    if (typeof summary !== 'string' || summary.trim() === '') {
      throw new Error('--summary must explain the visible change.');
    }
    nextData.updatedAt = date;
    nextData.corrections = [
      ...(current.data.corrections ?? []),
      { date, summary: summary.trim(), kind },
    ];
  }

  const nextSource = `---\n${stringify(nextData).trimEnd()}\n---\n\n${replacement.body.replace(/^\s+/, '')}`;
  const temporaryFile = path.join(
    postsDirectory,
    `.${slug}.${randomUUID()}.md`,
  );
  try {
    await writeFile(temporaryFile, nextSource, utf8);
    await validatePostFile(temporaryFile, slug);
    await rename(temporaryFile, postFile);
  } finally {
    await rm(temporaryFile, { force: true });
  }
  return postFile;
}
