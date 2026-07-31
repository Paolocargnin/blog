import {
  optionsFromArguments,
  workspaceFromOptions,
} from './workspace-cli.mjs';
import { developNote } from './workspace-lib.mjs';

const options = optionsFromArguments();
const directory = await developNote({
  workspace: workspaceFromOptions(options),
  slug: options.get('--slug'),
});
console.log(`Developed Draft at ${directory}.`);
