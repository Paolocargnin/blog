import { createAiPost } from './ai-post-lib.mjs';
import { optionsFromArguments, postsFromOptions } from './workspace-cli.mjs';

const options = optionsFromArguments();
const postFile = await createAiPost({
  postsDirectory: postsFromOptions(options),
  slug: options.get('--slug'),
  title: options.get('--title'),
  description: options.get('--description'),
  tags: options.get('--tags'),
  date: options.get('--date'),
});
console.log(
  `Created AI-generated Post at ${postFile}; replace its body, then open a pull request.`,
);
