import { randomUUID } from 'node:crypto';
import { readFile, rename, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { validatePostFile } from './content-contract.mjs';
import {
  isIsoDate,
  markdownSections,
  parseMarkdownDocument,
  serializeMarkdownDocument,
} from './markdown-lib.mjs';
import { requireHumanApproval, requireSlug } from './workspace-lib.mjs';

const utf8 = 'utf8';

function visibleCorrection(correction) {
  const label = correction.kind === 'revision' ? 'Revision' : 'Correction';
  return `- **${correction.date} — ${label}:** ${correction.summary}`;
}

function withoutCorrectionSections(body) {
  const sections = markdownSections(body).filter(
    (section) => section.title.toLowerCase() === 'corrections',
  );
  let result = body;
  for (const section of sections.reverse()) {
    result = `${result.slice(0, section.start).trimEnd()}\n\n${result
      .slice(section.end)
      .replace(/^\s+/, '')}`;
  }
  return result.trimEnd();
}

function setVisibleCorrections(body, corrections) {
  if (corrections.length === 0) {
    return body;
  }
  const cleanBody = withoutCorrectionSections(body);
  const section = `## Corrections\n\n${corrections.map(visibleCorrection).join('\n')}`;
  const sources = markdownSections(cleanBody).find(
    (candidate) => candidate.title.toLowerCase() === 'sources',
  );
  if (sources) {
    return `${cleanBody.slice(0, sources.start).trimEnd()}\n\n${section}\n\n${cleanBody.slice(sources.start).replace(/^\s+/, '')}`;
  }
  return `${cleanBody}\n\n${section}\n`;
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
  const current = parseMarkdownDocument(
    await readFile(postFile, utf8),
    postFile,
  );
  const replacementPath = path.resolve(replacementFile);
  const replacement = parseMarkdownDocument(
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

  const nextBody = setVisibleCorrections(
    replacement.body,
    nextData.corrections ?? [],
  );
  const nextSource = serializeMarkdownDocument(nextData, nextBody);
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
