import { readdir, readFile, realpath, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  contentContract,
  controlledTagIds,
  slugPattern,
  stableIdPattern,
} from '../src/content/contract.mjs';
import {
  isIsoDate as isDate,
  isPlainObject,
  parseMarkdownDocument,
} from './markdown-lib.mjs';

const projectRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
);
const markdownExtension = '.md';

export class ContentContractError extends Error {
  constructor(errors) {
    super(
      `Content contract validation failed:\n${errors.map((error) => `- ${error}`).join('\n')}`,
    );
    this.name = 'ContentContractError';
    this.errors = errors;
  }
}

function asPath(value) {
  return path.resolve(value);
}

async function exists(target) {
  try {
    await accessPath(target);
    return true;
  } catch {
    return false;
  }
}

async function accessPath(target) {
  await stat(target);
}

async function readMarkdown(filePath, errors) {
  const source = await readFile(filePath, 'utf8');
  try {
    return parseMarkdownDocument(source, filePath);
  } catch (error) {
    errors.push(error.message);
    return { data: {}, body: source };
  }
}

function requireString(data, field, filePath, errors) {
  if (typeof data[field] !== 'string' || data[field].trim() === '') {
    errors.push(`${filePath}: ${field} must be a non-empty string.`);
    return false;
  }
  return true;
}

function validateStableId(value, description, errors) {
  if (typeof value !== 'string' || !stableIdPattern.test(value)) {
    errors.push(
      `${description}: id must be a UUID so it remains stable across lifecycle stages.`,
    );
  }
}

function validatePostMetadata(data, filePath, errors) {
  const allowedFields = new Set([
    ...contentContract.post.requiredMetadata,
    ...contentContract.post.optionalMetadata,
  ]);
  for (const field of Object.keys(data)) {
    if (!allowedFields.has(field)) {
      errors.push(
        `${filePath}: ${field} is not Post metadata. The public slug comes from the filename.`,
      );
    }
  }

  for (const field of contentContract.post.requiredMetadata) {
    if (!(field in data)) {
      errors.push(`${filePath}: missing required Post metadata: ${field}.`);
    }
  }

  validateStableId(data.id, filePath, errors);
  requireString(data, 'title', filePath, errors);
  requireString(data, 'description', filePath, errors);

  if (!isDate(data.publishedAt)) {
    errors.push(`${filePath}: publishedAt must be an ISO date (YYYY-MM-DD).`);
  }

  if (
    !Array.isArray(data.tags) ||
    data.tags.length < 1 ||
    data.tags.length > 4
  ) {
    errors.push(
      `${filePath}: tags must contain one to four controlled tag IDs.`,
    );
  } else {
    const invalidTags = data.tags.filter(
      (tag) => !controlledTagIds.includes(tag),
    );
    if (invalidTags.length > 0) {
      errors.push(
        `${filePath}: unknown tag IDs: ${invalidTags.join(', ')}. Use the controlled vocabulary.`,
      );
    }
    if (new Set(data.tags).size !== data.tags.length) {
      errors.push(`${filePath}: tags must not repeat a tag ID.`);
    }
  }

  const hasCorrections = 'corrections' in data;
  const hasUpdatedAt = 'updatedAt' in data;
  if (hasCorrections !== hasUpdatedAt) {
    errors.push(
      `${filePath}: updatedAt and dated corrections must appear together.`,
    );
  }

  if (hasUpdatedAt && !isDate(data.updatedAt)) {
    errors.push(`${filePath}: updatedAt must be an ISO date (YYYY-MM-DD).`);
  }
  if (
    isDate(data.publishedAt) &&
    isDate(data.updatedAt) &&
    data.updatedAt < data.publishedAt
  ) {
    errors.push(`${filePath}: updatedAt cannot precede publishedAt.`);
  }

  if (hasCorrections) {
    if (!Array.isArray(data.corrections) || data.corrections.length === 0) {
      errors.push(
        `${filePath}: corrections must contain at least one visible dated correction.`,
      );
      return;
    }

    data.corrections.forEach((correction, index) => {
      const description = `${filePath}: corrections[${index}]`;
      if (!isPlainObject(correction)) {
        errors.push(`${description} must be a mapping.`);
        return;
      }
      const fields = Object.keys(correction);
      if (
        fields.some((field) => !['date', 'summary', 'kind'].includes(field))
      ) {
        errors.push(`${description} has an unsupported field.`);
      }
      if (!isDate(correction.date)) {
        errors.push(`${description}.date must be an ISO date (YYYY-MM-DD).`);
      }
      if (
        typeof correction.summary !== 'string' ||
        correction.summary.trim() === ''
      ) {
        errors.push(
          `${description}.summary must explain the visible correction.`,
        );
      }
      if (!['correction', 'revision'].includes(correction.kind)) {
        errors.push(`${description}.kind must be correction or revision.`);
      }
    });
  }
}

/**
 * Validate one Markdown document before a Publication candidate is copied into
 * the public Posts collection. The candidate keeps its article.md filename in
 * the Workspace, so the intended public slug is supplied separately.
 */
export async function validatePostFile(filePath, slug, postsDirectory) {
  const errors = [];
  if (!slugPattern.test(slug)) {
    errors.push(`${slug}: filename must be a lowercase hyphenated slug.`);
  }
  const { data } = await readMarkdown(filePath, errors);
  validatePostMetadata(data, filePath, errors);

  if (
    postsDirectory &&
    typeof data.id === 'string' &&
    stableIdPattern.test(data.id)
  ) {
    const entries = await readdir(postsDirectory, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isFile() || path.extname(entry.name) !== markdownExtension) {
        continue;
      }
      const existingPost = path.join(postsDirectory, entry.name);
      const { data: existingData } = await readMarkdown(existingPost, errors);
      if (existingData.id === data.id) {
        errors.push(
          `${filePath}: id duplicates ${existingPost}; stable Post IDs must be unique.`,
        );
      }
    }
  }
  if (errors.length > 0) {
    throw new ContentContractError(errors);
  }
}

async function validatePublicDirectory(postsDirectory, errors) {
  if (!(await exists(postsDirectory))) {
    errors.push(`${postsDirectory}: public Posts directory is required.`);
    return;
  }

  const postIds = new Map();
  const entries = await readdir(postsDirectory, { withFileTypes: true });
  for (const entry of entries) {
    const entryPath = path.join(postsDirectory, entry.name);
    if (entry.isSymbolicLink()) {
      errors.push(
        `${entryPath}: symbolic links are forbidden in public Posts.`,
      );
      continue;
    }
    if (entry.isDirectory()) {
      errors.push(
        `${entryPath}: Posts must be top-level Markdown files so URLs derive from filenames.`,
      );
      continue;
    }
    if (!entry.isFile() || path.extname(entry.name) !== markdownExtension) {
      if (entry.name !== '.gitkeep') {
        errors.push(`${entryPath}: only Markdown Post files are allowed.`);
      }
      continue;
    }

    const slug = path.basename(entry.name, markdownExtension);
    if (!slugPattern.test(slug)) {
      errors.push(
        `${entryPath}: filename must be a lowercase hyphenated slug.`,
      );
    }
    const { data } = await readMarkdown(entryPath, errors);
    validatePostMetadata(data, entryPath, errors);
    if (typeof data.id === 'string' && stableIdPattern.test(data.id)) {
      const firstPost = postIds.get(data.id);
      if (firstPost) {
        errors.push(
          `${entryPath}: id duplicates ${firstPost}; stable Post IDs must be unique.`,
        );
      } else {
        postIds.set(data.id, entryPath);
      }
    }
  }
}

async function validateWorkspaceArticle(articlePath, lifecycle, errors) {
  const articleName = path.basename(articlePath);
  if (!slugPattern.test(articleName)) {
    errors.push(
      `${articlePath}: working article directories must use lowercase hyphenated slugs.`,
    );
  }

  const entries = await readdir(articlePath, { withFileTypes: true });
  const acceptedFiles = new Set([
    contentContract.workspace.articleFile,
    ...contentContract.workspace.acceptedSidecars,
  ]);
  for (const entry of entries) {
    const entryPath = path.join(articlePath, entry.name);
    if (
      entry.isDirectory() ||
      entry.isSymbolicLink() ||
      !acceptedFiles.has(entry.name)
    ) {
      errors.push(
        `${entryPath}: unknown Workspace sidecar. Contract v${contentContract.version} accepts article.md and ${contentContract.workspace.acceptedSidecars.join(', ')}; migrate this file before continuing.`,
      );
    }
  }

  const articleFile = path.join(
    articlePath,
    contentContract.workspace.articleFile,
  );
  if (!(await exists(articleFile))) {
    errors.push(
      `${articlePath}: missing required ${contentContract.workspace.articleFile}.`,
    );
    return;
  }

  if (lifecycle === 'notes') {
    return;
  }

  const { data } = await readMarkdown(articleFile, errors);
  validateStableId(data.id, articleFile, errors);
}

async function validateWorkspaceDirectory(workspaceDirectory, errors) {
  if (!(await exists(workspaceDirectory))) {
    return false;
  }

  const manifestPath = path.join(
    workspaceDirectory,
    contentContract.workspace.manifest,
  );
  if (!(await exists(manifestPath))) {
    errors.push(
      `${workspaceDirectory}: missing ${contentContract.workspace.manifest} for content contract v${contentContract.version}.`,
    );
  } else {
    try {
      const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
      if (
        !isPlainObject(manifest) ||
        manifest.version !== contentContract.version
      ) {
        errors.push(
          `${manifestPath}: expected {"version": ${contentContract.version}}. Run the documented migration before continuing.`,
        );
      }
    } catch {
      errors.push(
        `${manifestPath}: must contain valid JSON with content contract version ${contentContract.version}.`,
      );
    }
  }

  const entries = await readdir(workspaceDirectory, { withFileTypes: true });
  const allowedRootEntries = new Set([
    contentContract.workspace.manifest,
    ...contentContract.workspace.lifecycleDirectories,
    '.git',
  ]);
  for (const entry of entries) {
    const entryPath = path.join(workspaceDirectory, entry.name);
    if (!allowedRootEntries.has(entry.name)) {
      errors.push(
        `${entryPath}: unknown Workspace entry under contract v${contentContract.version}.`,
      );
    }
    if (entry.isSymbolicLink()) {
      errors.push(
        `${entryPath}: symbolic links are forbidden in the Workspace contract.`,
      );
    }
  }

  for (const lifecycle of contentContract.workspace.lifecycleDirectories) {
    const lifecycleDirectory = path.join(workspaceDirectory, lifecycle);
    if (!(await exists(lifecycleDirectory))) {
      errors.push(
        `${workspaceDirectory}: missing lifecycle directory ${lifecycle}.`,
      );
      continue;
    }

    const lifecycleEntries = await readdir(lifecycleDirectory, {
      withFileTypes: true,
    });
    for (const entry of lifecycleEntries) {
      const entryPath = path.join(lifecycleDirectory, entry.name);
      if (!entry.isDirectory() || entry.isSymbolicLink()) {
        errors.push(
          `${entryPath}: ${lifecycle} may contain only working article directories.`,
        );
        continue;
      }
      await validateWorkspaceArticle(entryPath, lifecycle, errors);
    }
  }

  return true;
}

async function assertWorkspaceIsPrivate(
  postsDirectory,
  workspaceDirectory,
  errors,
) {
  if (!(await exists(workspaceDirectory)) || !(await exists(postsDirectory))) {
    return;
  }

  const [realPostsDirectory, realWorkspaceDirectory] = await Promise.all([
    realpath(postsDirectory),
    realpath(workspaceDirectory),
  ]);
  const relativeWorkspacePath = path.relative(
    realPostsDirectory,
    realWorkspaceDirectory,
  );
  if (relativeWorkspacePath === '' || !relativeWorkspacePath.startsWith('..')) {
    errors.push(
      `${workspaceDirectory}: Workspace must stay outside the public Posts directory.`,
    );
  }
}

export async function validatePublicContent({
  postsDirectory = path.join(projectRoot, 'src/content/posts'),
} = {}) {
  const errors = [];
  await validatePublicDirectory(asPath(postsDirectory), errors);
  if (errors.length > 0) {
    throw new ContentContractError(errors);
  }
}

export async function validateContent({
  postsDirectory = path.join(projectRoot, 'src/content/posts'),
  workspaceDirectory = path.join(projectRoot, 'content/workspace'),
  publicOnly = false,
} = {}) {
  const errors = [];
  const resolvedPostsDirectory = asPath(postsDirectory);
  const resolvedWorkspaceDirectory = asPath(workspaceDirectory);

  await validatePublicDirectory(resolvedPostsDirectory, errors);
  if (!publicOnly) {
    await assertWorkspaceIsPrivate(
      resolvedPostsDirectory,
      resolvedWorkspaceDirectory,
      errors,
    );
    await validateWorkspaceDirectory(resolvedWorkspaceDirectory, errors);
  }

  if (errors.length > 0) {
    throw new ContentContractError(errors);
  }

  return {
    workspacePresent: !publicOnly && (await exists(resolvedWorkspaceDirectory)),
  };
}
