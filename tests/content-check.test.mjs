import { execFile } from 'node:child_process';
import path from 'node:path';
import { promisify } from 'node:util';
import { describe, expect, it } from 'vitest';

import { validatePublicContent } from '../scripts/content-contract.mjs';

const execFileAsync = promisify(execFile);

describe('content check', () => {
  const fixturesDirectory = path.join('tests', 'fixtures', 'content');

  it('accepts a complete public Post and private Workspace', async () => {
    const { stdout } = await execFileAsync('node', [
      './scripts/content-check.mjs',
      '--posts',
      path.join(fixturesDirectory, 'valid', 'src', 'content', 'posts'),
      '--workspace',
      path.join(fixturesDirectory, 'valid', 'content', 'workspace'),
    ]);

    expect(stdout).toContain(
      'Public Posts and Workspace satisfy content contract v2.',
    );
  });

  it('rejects an incomplete Post fixture', async () => {
    await expect(
      execFileAsync('node', [
        './scripts/content-check.mjs',
        '--posts',
        path.join(fixturesDirectory, 'incomplete', 'src', 'content', 'posts'),
        '--public-only',
      ]),
    ).rejects.toMatchObject({
      stderr: expect.stringContaining(
        'missing required Post metadata: description',
      ),
    });
  });

  it('uses the same public validation seam that runs before production builds', async () => {
    await expect(
      validatePublicContent({
        postsDirectory: path.join(
          fixturesDirectory,
          'incomplete',
          'src',
          'content',
          'posts',
        ),
      }),
    ).rejects.toMatchObject({
      errors: expect.arrayContaining([
        expect.stringContaining('missing required Post metadata: description'),
      ]),
    });
  });

  it('rejects duplicate stable Post IDs', async () => {
    await expect(
      validatePublicContent({
        postsDirectory: path.join(
          fixturesDirectory,
          'duplicate-id',
          'src',
          'content',
          'posts',
        ),
      }),
    ).rejects.toMatchObject({
      errors: expect.arrayContaining([
        expect.stringContaining('stable Post IDs must be unique'),
      ]),
    });
  });

  it('rejects malformed structured public sources', async () => {
    await expect(
      validatePublicContent({
        postsDirectory: path.join(
          fixturesDirectory,
          'invalid-source',
          'src',
          'content',
          'posts',
        ),
      }),
    ).rejects.toMatchObject({
      errors: expect.arrayContaining([
        expect.stringContaining(
          'sources[0].url must be an absolute HTTP(S) URL',
        ),
      ]),
    });
  });

  it('rejects an incompatible Workspace sidecar with migration guidance', async () => {
    await expect(
      execFileAsync('node', [
        './scripts/content-check.mjs',
        '--posts',
        path.join(fixturesDirectory, 'valid', 'src', 'content', 'posts'),
        '--workspace',
        path.join(fixturesDirectory, 'incompatible', 'content', 'workspace'),
      ]),
    ).rejects.toMatchObject({
      stderr: expect.stringContaining('unknown Workspace sidecar'),
    });
  });

  it('keeps an invalid private Workspace out of the public-only check', async () => {
    const { stdout } = await execFileAsync('node', [
      './scripts/content-check.mjs',
      '--posts',
      path.join(fixturesDirectory, 'valid', 'src', 'content', 'posts'),
      '--workspace',
      path.join(fixturesDirectory, 'incompatible', 'content', 'workspace'),
      '--public-only',
    ]);

    expect(stdout).toContain('Public Posts satisfy content contract v2.');
  });
});
