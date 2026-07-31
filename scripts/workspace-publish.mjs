import {
  optionsFromArguments,
  postsFromOptions,
  workspaceFromOptions,
} from './workspace-cli.mjs';
import { publishCandidate } from './workspace-lib.mjs';

const options = optionsFromArguments();
const postFile = await publishCandidate({
  workspace: workspaceFromOptions(options),
  postsDirectory: postsFromOptions(options),
  slug: options.get('--slug'),
  approvedBy: options.get('--approved-by'),
});
console.log(
  `Prepared Post at ${postFile}; commit it through a publication PR.`,
);
