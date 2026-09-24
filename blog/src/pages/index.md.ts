// /blog/index.md — every post, newest first, as one Markdown page.
//
// An agent that lands here gets the whole catalogue with descriptions and
// dates in a few hundred tokens, and a link to the full text of each.
import type { APIRoute } from 'astro';
import { site } from '../../../build/site.config.mjs';
import { publishedPosts, isoDate } from '../lib/posts';

export const GET: APIRoute = async () => {
  const posts = await publishedPosts();
  const lines = [
    `# The ${site.name} blog`,
    '',
    '> Notes on hiring for AI fluency, from the team running the assessments.',
    '',
    `- Site: ${site.origin}/`,
    `- Index: ${site.origin}/blog`,
    `- Feed: ${site.origin}/blog/rss.xml`,
    `- Posts: ${posts.length}`,
    '',
    '---',
    '',
  ];

  for (const post of posts) {
    lines.push(
      `## ${post.data.title}`,
      '',
      post.data.description,
      '',
      `- Published: ${isoDate(post.data.published)}`,
      ...(post.data.updated ? [`- Updated: ${isoDate(post.data.updated)}`] : []),
      `- Read: ${site.origin}/blog/${post.id}`,
      `- Markdown: ${site.origin}/blog/${post.id}.md`,
      ''
    );
  }

  if (!posts.length) lines.push('No posts yet.', '');

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
};
