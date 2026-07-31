import { randomUUID } from 'node:crypto';
import { mkdir, readFile, rename, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';

import {
  validateContent,
  validatePostFile,
  validatePublicContent,
} from './content-contract.mjs';
import { validatePublicationEvidence } from './editorial-lib.mjs';
import { contentContract, slugPattern } from '../src/content/contract.mjs';

const utf8 = 'utf8';

export function workspacePath(value) {
  return path.resolve(value ?? 'content/workspace');
}

export function requireSlug(slug) {
  if (typeof slug !== 'string' || !slugPattern.test(slug)) {
    throw new Error('A lowercase hyphenated --slug is required.');
  }
  return slug;
}

export function requireHumanApproval(approvedBy) {
  if (typeof approvedBy !== 'string' || approvedBy.trim() === '') {
    throw new Error(
      'This command stops for explicit human approval. Re-run it yourself with --approved-by "Your Name".',
    );
  }
  return approvedBy.trim();
}

async function exists(target) {
  try {
    await stat(target);
    return true;
  } catch {
    return false;
  }
}

function articleDirectory(workspace, lifecycle, slug) {
  return path.join(workspace, lifecycle, requireSlug(slug));
}

function noteTemplate(slug) {
  return `# ${slug.replaceAll('-', ' ')}\n\nCapture the observation, question, quote, or source context here.\n`;
}

export async function scaffoldWorkspace(workspace) {
  await mkdir(workspace, { recursive: true });
  await writeFile(
    path.join(workspace, contentContract.workspace.manifest),
    `${JSON.stringify({ version: contentContract.version }, null, 2)}\n`,
    utf8,
  );
  await Promise.all(
    contentContract.workspace.lifecycleDirectories.map((lifecycle) =>
      mkdir(path.join(workspace, lifecycle), { recursive: true }),
    ),
  );
}

export async function createNote({ workspace, slug }) {
  const directory = articleDirectory(workspace, 'notes', slug);
  if (await exists(directory)) {
    throw new Error(`${directory} already exists; choose a new Note slug.`);
  }
  await mkdir(directory, { recursive: true });
  await writeFile(
    path.join(directory, contentContract.workspace.articleFile),
    noteTemplate(slug),
    utf8,
  );
  return directory;
}

export async function developNote({ workspace, slug }) {
  const noteDirectory = articleDirectory(workspace, 'notes', slug);
  const draftDirectory = articleDirectory(workspace, 'drafts', slug);
  const noteFile = path.join(
    noteDirectory,
    contentContract.workspace.articleFile,
  );
  if (!(await exists(noteFile))) {
    throw new Error(`${noteFile} does not exist; capture the Note first.`);
  }
  if (await exists(draftDirectory)) {
    throw new Error(
      `${draftDirectory} already exists; choose another Draft slug.`,
    );
  }

  const source = await readFile(noteFile, utf8);
  const existingNotesFile = path.join(noteDirectory, 'notes.md');
  const existingNotes = (await exists(existingNotesFile))
    ? await readFile(existingNotesFile, utf8)
    : '';
  const preservedNotes = existingNotes.trim()
    ? `${existingNotes.trimEnd()}\n\n---\n\n${source}`
    : source;
  const article = `---\nid: ${randomUUID()}\n---\n`;
  await rename(noteDirectory, draftDirectory);
  await writeFile(path.join(draftDirectory, 'notes.md'), preservedNotes, utf8);
  await writeFile(
    path.join(draftDirectory, contentContract.workspace.articleFile),
    article,
    utf8,
  );
  return draftDirectory;
}

export async function promoteDraft({
  workspace,
  postsDirectory,
  slug,
  approvedBy,
}) {
  requireHumanApproval(approvedBy);
  const draftDirectory = articleDirectory(workspace, 'drafts', slug);
  const candidateDirectory = articleDirectory(
    workspace,
    'publication-candidates',
    slug,
  );
  if (!(await exists(draftDirectory))) {
    throw new Error(
      `${draftDirectory} does not exist; develop the Note first.`,
    );
  }
  if (await exists(candidateDirectory)) {
    throw new Error(`${candidateDirectory} already exists.`);
  }
  await validateContent({ workspaceDirectory: workspace });
  await validatePostFile(
    path.join(draftDirectory, contentContract.workspace.articleFile),
    slug,
    postsDirectory,
  );
  await rename(draftDirectory, candidateDirectory);
  return candidateDirectory;
}

export async function publishCandidate({
  workspace,
  postsDirectory,
  slug,
  approvedBy,
}) {
  requireHumanApproval(approvedBy);
  const candidateDirectory = articleDirectory(
    workspace,
    'publication-candidates',
    slug,
  );
  const candidateFile = path.join(
    candidateDirectory,
    contentContract.workspace.articleFile,
  );
  const postFile = path.join(postsDirectory, `${requireSlug(slug)}.md`);
  if (!(await exists(candidateFile))) {
    throw new Error(
      `${candidateFile} does not exist; promote the Draft first.`,
    );
  }
  if (await exists(postFile)) {
    throw new Error(`${postFile} already exists; Posts are never overwritten.`);
  }

  await validateContent({ workspaceDirectory: workspace });
  await validatePublicationEvidence({ workspace, slug });
  await validatePublicContent({ postsDirectory });
  await validatePostFile(candidateFile, slug, postsDirectory);
  await mkdir(postsDirectory, { recursive: true });
  await writeFile(postFile, await readFile(candidateFile, utf8), utf8);
  return postFile;
}

export async function validateWorkspace(workspace) {
  await validateContent({ workspaceDirectory: workspace });
}
