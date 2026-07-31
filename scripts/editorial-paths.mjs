import { stat } from 'node:fs/promises';
import path from 'node:path';

import { contentContract, slugPattern } from '../src/content/contract.mjs';

export async function pathExists(target) {
  try {
    await stat(target);
    return true;
  } catch {
    return false;
  }
}

export function requireEditorialSlug(slug) {
  if (typeof slug !== 'string' || !slugPattern.test(slug)) {
    throw new Error('A lowercase hyphenated --slug is required.');
  }
  return slug;
}

export async function locateWorkingArticle({ workspace, slug }) {
  requireEditorialSlug(slug);
  const matches = [];
  for (const lifecycle of contentContract.workspace.lifecycleDirectories) {
    const directory = path.join(workspace, lifecycle, slug);
    if (await pathExists(directory)) {
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
