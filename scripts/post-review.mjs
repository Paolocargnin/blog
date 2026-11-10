import { reviewAiPost } from './ai-post-lib.mjs';
import { optionsFromArguments, postsFromOptions } from './workspace-cli.mjs';

const options = optionsFromArguments();
const postFile = await reviewAiPost({
  postsDirectory: postsFromOptions(options),
  slug: options.get('--slug'),
  approvedBy: options.get('--approved-by'),
  date: options.get('--date'),
  summary: options.get('--summary'),
});
console.log(
  `Recorded the review of ${postFile} and removed its AI-generated notice; commit it through a pull request.`,
);
