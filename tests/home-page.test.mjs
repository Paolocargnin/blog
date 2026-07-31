import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

describe('home page', () => {
  it('starts with one semantic main landmark and a level-one heading', async () => {
    const page = await readFile('src/pages/index.astro', 'utf8');

    expect(page).toContain('<main>');
    expect(page).toContain('<h1>{siteName}</h1>');
  });
});
