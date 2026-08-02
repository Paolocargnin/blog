import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

describe('static Cloudflare Worker deployment', () => {
  it('deploys the pre-rendered dist directory without triggering Astro SSR auto-setup', async () => {
    const [configuration, packageJson] = await Promise.all([
      readFile('wrangler.jsonc', 'utf8'),
      readFile('package.json', 'utf8'),
    ]);
    const pkg = JSON.parse(packageJson);

    expect(JSON.parse(configuration)).toMatchObject({
      name: 'blog',
      assets: {
        directory: './dist',
        not_found_handling: '404-page',
      },
    });
    expect(pkg.devDependencies.wrangler).toBeDefined();
    expect(pkg.scripts.deploy).toBe('pnpm build && wrangler deploy');
  });
});
