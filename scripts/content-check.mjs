import { access } from 'node:fs/promises';

const requiredPaths = ['src/pages/index.astro'];

await Promise.all(
  requiredPaths.map(async (path) => {
    try {
      await access(path);
    } catch {
      throw new Error(`Required public content is missing: ${path}`);
    }
  }),
);

console.log('Public content baseline is valid.');
