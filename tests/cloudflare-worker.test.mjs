import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

describe('static Cloudflare Worker deployment', () => {
  it('deploys the pre-rendered dist directory without triggering Astro SSR auto-setup', async () => {
    const [
      configuration,
      packageJson,
      astroConfiguration,
      workflow,
      deploymentGuide,
    ] = await Promise.all([
      readFile('wrangler.jsonc', 'utf8'),
      readFile('package.json', 'utf8'),
      readFile('astro.config.mjs', 'utf8'),
      readFile('.github/workflows/quality.yml', 'utf8'),
      readFile('docs/deployment.md', 'utf8'),
    ]);
    const pkg = JSON.parse(packageJson);

    const workerConfiguration = JSON.parse(
      configuration.replace(/,\s*([}\]])/g, '$1'),
    );

    expect(workerConfiguration).toMatchObject({
      name: 'blog',
      assets: {
        directory: './dist',
        not_found_handling: '404-page',
      },
    });
    expect(pkg.devDependencies.wrangler).toBeDefined();
    expect(pkg.scripts.deploy).toBe('pnpm build && wrangler deploy');
    expect(astroConfiguration).toContain("'https://pctb.it'");
    expect(workflow).toContain('name: Quality');
    expect(workflow).toContain('pnpm quality');
    expect(deploymentGuide).toContain('pnpm exec wrangler rollback');
    expect(deploymentGuide).toContain('Workers Builds');
    expect(deploymentGuide).toContain('PUBLIC_SITE_URL=https://pctb.it');
  });
});
