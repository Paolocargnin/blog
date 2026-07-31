// @ts-check
import { defineConfig } from 'astro/config';

import { validatePublicContent } from './scripts/content-contract.mjs';

export default defineConfig({
  integrations: [
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
