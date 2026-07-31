import {
  optionsFromArguments,
  workspaceFromOptions,
} from './workspace-cli.mjs';
import { createEditorialFile } from './editorial-lib.mjs';

const options = optionsFromArguments();
const filePath = await createEditorialFile({
  workspace: workspaceFromOptions(options),
  slug: options.get('--slug'),
  kind: options.get('--kind'),
});
console.log(`Created editorial file at ${filePath}.`);
