import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { describe, expect, it } from 'vitest';

const execFileAsync = promisify(execFile);

describe('content check', () => {
  it('accepts the public baseline', async () => {
    const { stdout } = await execFileAsync('node', [
      './scripts/content-check.mjs',
    ]);

    expect(stdout).toContain('Public content baseline is valid.');
  });
});
