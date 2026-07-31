import path from 'node:path';

import { validateContent } from './content-contract.mjs';

const argumentsByName = new Map();
for (let index = 0; index < process.argv.length; index += 1) {
  const argument = process.argv[index];
  if (
    argument.startsWith('--') &&
    process.argv[index + 1]?.startsWith('--') === false
  ) {
    argumentsByName.set(argument, process.argv[index + 1]);
    index += 1;
  }
}

const publicOnly = process.argv.includes('--public-only');
const options = {
  publicOnly,
  postsDirectory: argumentsByName.has('--posts')
    ? path.resolve(argumentsByName.get('--posts'))
    : undefined,
  workspaceDirectory: argumentsByName.has('--workspace')
    ? path.resolve(argumentsByName.get('--workspace'))
    : undefined,
};

const { workspacePresent } = await validateContent(options);
console.log(
  publicOnly || !workspacePresent
    ? 'Public Posts satisfy content contract v1.'
    : 'Public Posts and Workspace satisfy content contract v1.',
);
