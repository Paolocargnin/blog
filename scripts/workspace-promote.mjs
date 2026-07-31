import {
  optionsFromArguments,
  workspaceFromOptions,
} from './workspace-cli.mjs';
import { promoteDraft } from './workspace-lib.mjs';

const options = optionsFromArguments();
const directory = await promoteDraft({
  workspace: workspaceFromOptions(options),
  slug: options.get('--slug'),
  approvedBy: options.get('--approved-by'),
});
console.log(`Promoted Publication candidate at ${directory}.`);
