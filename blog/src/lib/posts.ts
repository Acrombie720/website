import { getCollection, type CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'posts'>;

/**
 * Every post that should exist on this build, newest first.
 *
 * Drafts are visible while writing (`npm run dev`) and dropped from the
 * published build, so a half-finished post can be previewed in place
 * without a branch.
 */
export async function publishedPosts(): Promise<Post[]> {
  const posts = await getCollection('posts', ({ data }) => import.meta.env.DEV || !data.draft);
  return posts.sort((a, b) => b.data.published.getTime() - a.data.published.getTime());
}

/** Posts sharing the most tags with this one, newest first. */
export function relatedTo(post: Post, all: Post[], limit = 3): Post[] {
  const tags = new Set(post.data.tags);
  if (!tags.size) return [];
  return all
    .filter(p => p.id !== post.id)
    .map(p => ({ p, shared: p.data.tags.filter(t => tags.has(t)).length }))
    .filter(x => x.shared > 0)
    .sort((a, b) => b.shared - a.shared || b.p.data.published.getTime() - a.p.data.published.getTime())
    .slice(0, limit)
    .map(x => x.p);
}

/** 2026-09-21 -> 21 September 2026. British, to match the rest of the site. */
export function longDate(date: Date): string {
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

/** 2026-09-21, for <time datetime> and for schema.org. */
export function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Rounded up, floored at one minute, at the 230wpm people actually read. */
export function readingMinutes(body: string): number {
  return Math.max(1, Math.round(body.trim().split(/\s+/).length / 230));
}

export const postUrl = (post: Post) => `/blog/${post.id}`;
