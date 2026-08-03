// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

import { validatePublicContent } from './scripts/content-contract.mjs';

const site =
  process.env.PUBLIC_SITE_URL || 'https://blog.cargnin-paolo.workers.dev';

export default defineConfig({
  site,
  integrations: [
    sitemap(),
    {
      name: 'public-content-contract',
      hooks: {
        'astro:build:start': async () => {
          await validatePublicContent();
        },
      },
    },
  ],
});
