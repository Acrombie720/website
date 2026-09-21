import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// One post is one Markdown file in src/content/posts/. The schema is the
// point of this file: a post that would ship bad SEO metadata fails the
// build rather than going live quietly.
//
// The length limits are the widths Google actually renders before it
// truncates, so a title or description outside them is a bug worth catching.
const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: z.object({
    title: z.string().min(10).max(70),
    description: z.string().min(70).max(160),
    published: z.coerce.date(),
    updated: z.coerce.date().optional(),
    author: z.string().default('Fluencyfox'),
    // Shown on the post and used to pick related posts. There are no tag
    // archive pages on purpose: a handful of posts per tag makes thin pages
    // that compete with the posts themselves.
    tags: z.array(z.string()).default([]),
    // Drafts render in `npm run dev` and never appear in a build.
    draft: z.boolean().default(false),
    // Defaults to the card build/make-blog-og.mjs renders for this post.
    ogImage: z.string().optional(),
    // Set when the canonical version of a piece lives somewhere else.
    canonical: z.string().url().optional(),
    noindex: z.boolean().default(false),
  }),
});

export const collections = { posts };
