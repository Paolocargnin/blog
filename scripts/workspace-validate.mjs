import {
  optionsFromArguments,
  workspaceFromOptions,
} from './workspace-cli.mjs';
import { validateWorkspace } from './workspace-lib.mjs';

const options = optionsFromArguments();
await validateWorkspace(workspaceFromOptions(options));
console.log('Workspace satisfies content contract v1.');
