import {
  optionsFromArguments,
  workspaceFromOptions,
} from './workspace-cli.mjs';
import { contentContract } from '../src/content/contract.mjs';
import { validateWorkspace } from './workspace-lib.mjs';

const options = optionsFromArguments();
await validateWorkspace(workspaceFromOptions(options));
console.log(
  `Workspace satisfies content contract v${contentContract.version}.`,
);
