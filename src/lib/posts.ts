import type { CollectionEntry } from 'astro:content';

import { contentContract } from '../content/contract.mjs';

export type Post = CollectionEntry<'posts'>;

export function sortPostsNewestFirst(posts: readonly Post[]): Post[] {
  return [...posts].sort(
    (left, right) =>
      right.data.publishedAt.getTime() - left.data.publishedAt.getTime(),
  );
}

export function postsWithTag(posts: readonly Post[], tag: string): Post[] {
  return posts.filter((post) => post.data.tags.includes(tag as never));
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

export function tagLabel(tag: string): string {
  return contentContract.tags[tag as keyof typeof contentContract.tags];
}
