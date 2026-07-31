import {
  optionsFromArguments,
  workspaceFromOptions,
} from './workspace-cli.mjs';
import { candidateDigest } from './editorial-lib.mjs';

const options = optionsFromArguments();
console.log(
  await candidateDigest({
    workspace: workspaceFromOptions(options),
    slug: options.get('--slug'),
  }),
);
