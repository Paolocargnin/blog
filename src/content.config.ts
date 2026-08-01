import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

import {
  contentContract,
  controlledTagIds,
  stableIdPattern,
} from './content/contract.mjs';

const correction = z
  .object({
    date: z.coerce.date(),
    summary: z.string().trim().min(1),
    kind: z.enum(['correction', 'revision']),
  })
  .strict();

const source = z
  .object({
    title: z.string().trim().min(1),
    url: z.url().refine((value) => /^https?:\/\//.test(value), {
      message: 'Source URLs must use HTTP(S).',
    }),
    description: z.string().trim().min(1),
  })
  .strict();

const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: z
    .object({
      id: z.string().regex(stableIdPattern),
      title: z.string().trim().min(1),
      description: z.string().trim().min(1),
      publishedAt: z.coerce.date(),
      updatedAt: z.coerce.date().optional(),
      tags: z
        .array(z.enum(controlledTagIds as unknown as [string, ...string[]]))
        .min(1)
        .max(4)
        .refine((tags) => new Set(tags).size === tags.length, {
          message: 'Post tags must not repeat a controlled tag ID.',
        }),
      corrections: z.array(correction).min(1).optional(),
      sources: z.array(source).min(1).optional(),
    })
    .strict()
    .superRefine((post, context) => {
      if ((post.updatedAt === undefined) !== (post.corrections === undefined)) {
        context.addIssue({
          code: 'custom',
          message: 'updatedAt and dated corrections must appear together.',
        });
      }
      if (post.updatedAt && post.updatedAt < post.publishedAt) {
        context.addIssue({
          code: 'custom',
          message: 'updatedAt cannot precede publishedAt.',
        });
      }
    }),
});

export const collections = { posts };

export const contentContractVersion = contentContract.version;
