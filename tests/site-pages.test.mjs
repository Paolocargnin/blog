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

  it('keeps the page shell free of a minimum width so enlarged text can reflow', async () => {
    const layout = await read('src/layouts/BaseLayout.astro');
    const bodyRule = layout.match(/\n  body \{([\s\S]*?)\n  \}/)?.[1];

    expect(bodyRule).toBeDefined();
    expect(bodyRule).not.toMatch(/\bmin-width\s*:/);
    expect(bodyRule).toContain('overflow-wrap: anywhere;');
  });

  it('keeps canonical, social, structured, and production-only analytics metadata in the layout', async () => {
    const layout = await read('src/layouts/BaseLayout.astro');

    expect(layout).toContain('rel="canonical"');
    expect(layout).toContain('application/rss+xml');
    expect(layout).toContain('property="og:title"');
    expect(layout).toContain('application/ld+json');
    expect(layout).toContain('import.meta.env.PROD');
    expect(layout).toContain('PUBLIC_CLOUDFLARE_WEB_ANALYTICS_TOKEN');
  });

  it('declares a public favicon so browsers do not request a missing default icon', async () => {
    const [layout, favicon] = await Promise.all([
      read('src/layouts/BaseLayout.astro'),
      read('public/favicon.svg'),
    ]);

    expect(layout).toContain('rel="icon"');
    expect(layout).toContain('href="/favicon.svg"');
    expect(favicon).toContain('<svg');
  });

  it('provides the promised homepage, archive, controlled tags, Post, and 404 routes', async () => {
    const pages = await Promise.all([
      read('src/pages/index.astro'),
      read('src/pages/posts/index.astro'),
      read('src/pages/posts/[...slug].astro'),
      read('src/pages/tags/index.astro'),
      read('src/pages/tags/[tag].astro'),
      read('src/pages/404.astro'),
      read('src/pages/editorial/index.astro'),
      read('src/pages/rss.xml.js'),
      read('src/pages/robots.txt.ts'),
    ]);

    expect(pages[0]).toContain('RECENT POSTS');
    expect(pages[1]).toContain('ALL POSTS');
    expect(pages[2]).toContain('<Corrections');
    expect(pages[2]).toContain('<Sources');
    expect(pages[3]).toContain('controlledTagIds');
    expect(pages[4]).toContain('getStaticPaths');
    expect(pages[5]).toContain('404 / MISSING FROM THE INDEX');
    expect(pages[6]).toContain('Editorial process');
    expect(pages[7]).toContain('@astrojs/rss');
    expect(pages[8]).toContain('Sitemap:');
  });

  it('keeps long prose and code responsive in the Post route', async () => {
    const page = await read('src/pages/posts/[...slug].astro');

    expect(page).toContain('max-width: var(--measure)');
    expect(page).toContain('width: min(80rem, calc(100vw - 2rem))');
    expect(page).toContain('codeBlock.tabIndex = 0');
    expect(page).toContain('mix-blend-mode: exclusion');
  });

  it('renders structured public Sources with the same semantic region as Corrections', async () => {
    const sources = await read('src/components/Sources.astro');

    expect(sources).toContain('aria-labelledby="sources-title"');
    expect(sources).toContain(
      "EVIDENCE / {String(sources.length).padStart(2, '0')}",
    );
    expect(sources).toContain('grid-template-columns: 40% auto');
  });
});
