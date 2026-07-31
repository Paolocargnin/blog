import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

import {
  createNote,
  developNote,
  promoteDraft,
  publishCandidate,
  scaffoldWorkspace,
  validateWorkspace,
} from '../scripts/workspace-lib.mjs';
import { optionsFromArguments } from '../scripts/workspace-cli.mjs';

const temporaryDirectories = [];

async function createWorkspace() {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'pc-blog-workspace-'));
  temporaryDirectories.push(directory);
  const workspace = path.join(directory, 'workspace');
  await scaffoldWorkspace(workspace);
  return { directory, workspace };
}

afterEach(async () => {
  await Promise.all(
    temporaryDirectories
      .splice(0)
      .map((directory) => rm(directory, { force: true, recursive: true })),
  );
});

describe('private Workspace lifecycle', () => {
  it("accepts pnpm's argument separator before command options", () => {
    expect(
      optionsFromArguments(['--', '--workspace', 'private', '--slug', 'idea']),
    ).toEqual(
      new Map([
        ['--workspace', 'private'],
        ['--slug', 'idea'],
      ]),
    );
  });

  it('creates a Note, assigns a stable id when developing it, and validates the result', async () => {
    const { workspace } = await createWorkspace();

    await createNote({ workspace, slug: 'a-promising-idea' });
    await developNote({ workspace, slug: 'a-promising-idea' });
    await validateWorkspace(workspace);

    const article = await readFile(
      path.join(workspace, 'drafts', 'a-promising-idea', 'article.md'),
      'utf8',
    );
    expect(article).toMatch(/^---\nid: [0-9a-f-]{36}\n---/);
  });

  it('will not promote a Draft without a named human approval', async () => {
    const { workspace } = await createWorkspace();
    await createNote({ workspace, slug: 'needs-review' });
    await developNote({ workspace, slug: 'needs-review' });

    await expect(
      promoteDraft({ workspace, slug: 'needs-review' }),
    ).rejects.toThrow('stops for explicit human approval');

    await promoteDraft({
      workspace,
      slug: 'needs-review',
      approvedBy: 'Paolo Cargnin',
    });
    await validateWorkspace(workspace);
  });

  it('will not publish a candidate without approval and copies only a valid Post after approval', async () => {
    const { directory, workspace } = await createWorkspace();
    const slug = 'ready-to-publish';
    const candidateDirectory = path.join(
      workspace,
      'publication-candidates',
      slug,
    );
    await mkdir(candidateDirectory, { recursive: true });
    await writeFile(
      path.join(candidateDirectory, 'article.md'),
      `---\nid: 6a4de3e2-126e-4bd7-a6ba-cd458e2a84ad\ntitle: Ready to publish\ndescription: A complete candidate ready for a human-approved publication PR.\npublishedAt: 2026-07-31\ntags:\n  - writing\n---\n\nA complete candidate.\n`,
      'utf8',
    );
    const postsDirectory = path.join(directory, 'posts');
    await mkdir(postsDirectory, { recursive: true });
    await writeFile(path.join(postsDirectory, '.gitkeep'), '', 'utf8');

    await expect(
      publishCandidate({ workspace, postsDirectory, slug }),
    ).rejects.toThrow('stops for explicit human approval');

    const postFile = await publishCandidate({
      workspace,
      postsDirectory,
      slug,
      approvedBy: 'Paolo Cargnin',
    });
    expect(await readFile(postFile, 'utf8')).toContain('Ready to publish');
  });
});
