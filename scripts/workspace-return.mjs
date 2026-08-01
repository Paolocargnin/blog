import {
  optionsFromArguments,
  workspaceFromOptions,
} from './workspace-cli.mjs';
import { returnCandidateToDraft } from './editorial-lib.mjs';

const options = optionsFromArguments();
const directory = await returnCandidateToDraft({
  workspace: workspaceFromOptions(options),
  slug: options.get('--slug'),
});
console.log(`Returned Draft to ${directory} and invalidated review evidence.`);
