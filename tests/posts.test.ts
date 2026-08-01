import { describe, expect, it } from 'vitest';

import { postsWithTag, sortPostsNewestFirst } from '../src/lib/posts';

const post = (id: string, publishedAt: string, tags: string[]) =>
  ({ id, data: { publishedAt: new Date(publishedAt), tags } }) as never;

describe('Post collection helpers', () => {
  it('orders representative Posts by newest publication date', () => {
    const posts = [
      post('older', '2025-01-01', ['writing']),
      post('newer', '2026-01-01', ['ai']),
    ];

    expect(sortPostsNewestFirst(posts).map((entry) => entry.id)).toEqual([
      'newer',
      'older',
    ]);
  });

  it('selects only Posts using the requested controlled Tag', () => {
    const posts = [
      post('one', '2026-01-01', ['writing']),
      post('two', '2026-01-02', ['ai', 'writing']),
    ];

    expect(postsWithTag(posts, 'ai').map((entry) => entry.id)).toEqual(['two']);
  });
});
