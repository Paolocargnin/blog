import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

import { createAiPost, reviewAiPost } from '../scripts/ai-post-lib.mjs';
import { validatePostFile } from '../scripts/content-contract.mjs';
import { parseMarkdownDocument } from '../scripts/markdown-lib.mjs';

const temporaryDirectories = [];

async function postsDirectory() {
  const root = await mkdtemp(path.join(os.tmpdir(), 'pc-blog-ai-posts-'));
  temporaryDirectories.push(root);
  return root;
}

afterEach(async () => {
  await Promise.all(
    temporaryDirectories
      .splice(0)
      .map((directory) => rm(directory, { recursive: true, force: true })),
  );
});

const newPost = (directory, overrides = {}) =>
  createAiPost({
    postsDirectory: directory,
    slug: 'a-daily-update',
    title: 'A daily update',
    description: 'What Claude saw me build today.',
    tags: 'devlog,games',
    date: '2026-11-09',
    ...overrides,
  });

describe('AI-generated Posts (ADR 0019)', () => {
  it('creates a valid Post with a stable id and the notice switched on', async () => {
    const directory = await postsDirectory();
    const postFile = await newPost(directory);
    const { data } = parseMarkdownDocument(
      await readFile(postFile, 'utf8'),
      postFile,
    );

    expect(data.aiGenerated).toBe(true);
    expect(data.publishedAt).toBe('2026-11-09');
    expect(data.tags).toEqual(['devlog', 'games']);
    expect(data.id).toMatch(/^[0-9a-f-]{36}$/);
    await expect(newPost(directory)).rejects.toThrow('already exists');
  });

  it('rejects unknown tags and leaves no file behind', async () => {
    const directory = await postsDirectory();
    await expect(newPost(directory, { tags: 'devlog,cats' })).rejects.toThrow(
      '--tags',
    );
    await expect(
      readFile(path.join(directory, 'a-daily-update.md'), 'utf8'),
    ).rejects.toThrow();
  });

  it('removes the notice on review and records a visible revision', async () => {
    const directory = await postsDirectory();
    const postFile = await newPost(directory);

    await expect(
      reviewAiPost({ postsDirectory: directory, slug: 'a-daily-update' }),
    ).rejects.toThrow('--approved-by');

    await reviewAiPost({
      postsDirectory: directory,
      slug: 'a-daily-update',
      approvedBy: 'Paolo Cargnin',
      date: '2026-11-10',
    });
    const source = await readFile(postFile, 'utf8');
    const { data } = parseMarkdownDocument(source, postFile);

    expect(data.aiGenerated).toBeUndefined();
    expect(data.updatedAt).toBe('2026-11-10');
    expect(data.corrections).toEqual([
      {
        date: '2026-11-10',
        kind: 'revision',
        summary:
          'Paolo Cargnin reviewed this AI-generated Post and removed the AI-generated notice.',
      },
    ]);
    await expect(
      reviewAiPost({
        postsDirectory: directory,
        slug: 'a-daily-update',
        approvedBy: 'Paolo Cargnin',
      }),
    ).rejects.toThrow('not an unreviewed AI-generated Post');
  });

  it('only accepts aiGenerated: true in public Posts', async () => {
    const directory = await postsDirectory();
    const postFile = path.join(directory, 'reviewed-post.md');
    await writeFile(
      postFile,
      `---\nid: 6a4de3e2-126e-4bd7-a6ba-cd458e2a84ad\ntitle: Reviewed\ndescription: A Post that sets the flag to false.\npublishedAt: 2026-11-09\ntags:\n  - devlog\naiGenerated: false\n---\n\nBody.\n`,
      'utf8',
    );
    await expect(validatePostFile(postFile, 'reviewed-post')).rejects.toThrow(
      'aiGenerated must be true',
    );
  });
});
