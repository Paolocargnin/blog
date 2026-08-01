import {
  optionsFromArguments,
  postsFromOptions,
  workspaceFromOptions,
} from './workspace-cli.mjs';
import { editorialStatus } from './editorial-lib.mjs';

const options = optionsFromArguments();
const status = await editorialStatus({
  workspace: workspaceFromOptions(options),
  postsDirectory: postsFromOptions(options),
  slug: options.get('--slug'),
});
console.log(JSON.stringify(status, null, 2));
