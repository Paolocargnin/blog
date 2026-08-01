import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

const read = (path) => readFile(path, 'utf8');

describe('reading surfaces', () => {
  it('keeps global navigation, a skip link, and reduced-motion support in the layout', async () => {
    const layout = await read('src/layouts/BaseLayout.astro');

    expect(layout).toContain('Skip to content');
    expect(layout).toContain('prefers-reduced-motion: reduce');
    expect(layout).toContain("'JetBrains Mono Variable'");
  });

  it('provides the promised homepage, archive, controlled tags, Post, and 404 routes', async () => {
    const pages = await Promise.all([
      read('src/pages/index.astro'),
      read('src/pages/posts/index.astro'),
      read('src/pages/posts/[...slug].astro'),
      read('src/pages/tags/index.astro'),
      read('src/pages/tags/[tag].astro'),
      read('src/pages/404.astro'),
    ]);

    expect(pages[0]).toContain('RECENT POSTS');
    expect(pages[1]).toContain('ALL POSTS');
    expect(pages[2]).toContain('<Corrections');
    expect(pages[2]).toContain('h2#sources');
    expect(pages[3]).toContain('controlledTagIds');
    expect(pages[4]).toContain('getStaticPaths');
    expect(pages[5]).toContain('404 / MISSING FROM THE INDEX');
  });

  it('keeps long prose and code responsive in the Post route', async () => {
    const page = await read('src/pages/posts/[...slug].astro');

    expect(page).toContain('max-width: var(--measure)');
    expect(page).toContain('width: min(80rem, calc(100vw - 2rem))');
    expect(page).toContain('codeBlock.tabIndex = 0');
    expect(page).toContain('mix-blend-mode: exclusion');
  });
});
