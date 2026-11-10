import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

import { validatePublicContent } from '../scripts/content-contract.mjs';

const temporaryDirectories = [];

afterEach(async () => {
  await Promise.all(
    temporaryDirectories
      .splice(0)
      .map((directory) => rm(directory, { recursive: true, force: true })),
  );
});

const post = `---
id: 6a4de3e2-126e-4bd7-a6ba-cd458e2a84ad
title: A Post
description: A Post with one visible correction.
publishedAt: 2026-11-08
tags:
  - devlog
updatedAt: 2026-11-09
corrections:
  - date: 2026-11-09
    summary: Changed the plan.
    kind: correction
---

Body.
`;

async function project(translation, slug = 'a-post') {
  const root = await mkdtemp(path.join(os.tmpdir(), 'pc-blog-translations-'));
  temporaryDirectories.push(root);
  const postsDirectory = path.join(root, 'posts');
  await mkdir(postsDirectory);
  await writeFile(path.join(postsDirectory, 'a-post.md'), post, 'utf8');
  if (translation !== undefined) {
    await mkdir(path.join(root, 'translations', 'it'), { recursive: true });
    await writeFile(
      path.join(root, 'translations', 'it', `${slug}.md`),
      translation,
      'utf8',
    );
  }
  return postsDirectory;
}

const italian = (corrections = '') => `---
title: Un Post
description: Un Post con una correzione visibile.
${corrections}---

Testo.
`;

const matchingCorrections = `corrections:
  - date: 2026-11-09
    summary: Ho cambiato piano.
    kind: correction
`;

describe('Italian translations (ADR 0020)', () => {
  it('accepts a translation that matches its Post', async () => {
    const postsDirectory = await project(italian(matchingCorrections));
    await expect(validatePublicContent({ postsDirectory })).resolves.toBe(
      undefined,
    );
  });

  it('is optional', async () => {
    const postsDirectory = await project(undefined);
    await expect(validatePublicContent({ postsDirectory })).resolves.toBe(
      undefined,
    );
  });

  it('rejects a translation without a matching Post', async () => {
    const postsDirectory = await project(
      italian(matchingCorrections),
      'missing-post',
    );
    await expect(validatePublicContent({ postsDirectory })).rejects.toThrow(
      'no public Post with that slug',
    );
  });

  it('rejects metadata that belongs to the Post', async () => {
    const postsDirectory = await project(
      italian(`${matchingCorrections}publishedAt: 2026-11-10\n`),
    );
    await expect(validatePublicContent({ postsDirectory })).rejects.toThrow(
      'publishedAt is not translation metadata',
    );
  });

  it('requires the Post corrections, with the same dates and kinds', async () => {
    await expect(
      validatePublicContent({ postsDirectory: await project(italian()) }),
    ).rejects.toThrow('must translate them');
    await expect(
      validatePublicContent({
        postsDirectory: await project(
          italian(matchingCorrections.replace('2026-11-09', '2026-11-10')),
        ),
      }),
    ).rejects.toThrow('same dates and kinds');
  });
});
