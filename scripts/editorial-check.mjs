import {
  optionsFromArguments,
  workspaceFromOptions,
} from './workspace-cli.mjs';
import { validatePublicationEvidence } from './editorial-lib.mjs';

const options = optionsFromArguments();
await validatePublicationEvidence({
  workspace: workspaceFromOptions(options),
  slug: options.get('--slug'),
});
console.log('Publication candidate satisfies editorial workflow v1.');
