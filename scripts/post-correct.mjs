import { optionsFromArguments, postsFromOptions } from './workspace-cli.mjs';
import { correctPost } from './correction-lib.mjs';

const options = optionsFromArguments();
const postFile = await correctPost({
  postsDirectory: postsFromOptions(options),
  slug: options.get('--slug'),
  replacementFile: options.get('--replacement'),
  kind: options.get('--kind'),
  date: options.get('--date'),
  summary: options.get('--summary'),
  approvedBy: options.get('--approved-by'),
});
console.log(
  `Prepared Correction at ${postFile}; commit it through a pull request.`,
);
