import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

import { sortPostsNewestFirst } from '../lib/posts';

export async function GET(context) {
  const posts = sortPostsNewestFirst(await getCollection('posts'));

  return rss({
    title: 'PC - the blog',
    description: "Paolo Cargnin's published writing.",
    site: context.site,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      link: `/posts/${post.id}/`,
      pubDate: post.data.publishedAt,
    })),
  });
}
