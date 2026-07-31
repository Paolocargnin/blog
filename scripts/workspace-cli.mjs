import path from 'node:path';

import { workspacePath } from './workspace-lib.mjs';

export function optionsFromArguments(argumentsToParse = process.argv.slice(2)) {
  const options = new Map();
  for (let index = 0; index < argumentsToParse.length; index += 1) {
    const argument = argumentsToParse[index];
    if (argument === '--') {
      continue;
    }
    if (argument.startsWith('--') && argumentsToParse[index + 1]) {
      options.set(argument, argumentsToParse[index + 1]);
      index += 1;
    }
  }
  return options;
}

export function workspaceFromOptions(options) {
  return workspacePath(options.get('--workspace'));
}

export function postsFromOptions(options) {
  return path.resolve(options.get('--posts') ?? 'src/content/posts');
}
