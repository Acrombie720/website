// /blog/<slug>.md — the post as Markdown.
//
// Linked from the HTML page with <link rel="alternate" type="text/markdown">,
// which is how an agent finds it without guessing.
import type { APIRoute, GetStaticPaths } from 'astro';
import { publishedPosts } from '../lib/posts';
import { postAsMarkdown } from '../lib/markdown';

export const getStaticPaths = (async () => {
  const posts = await publishedPosts();
  return posts.map(post => ({ params: { slug: post.id }, props: { post } }));
}) satisfies GetStaticPaths;

export const GET: APIRoute = ({ props }) =>
  new Response(postAsMarkdown(props.post as never), {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
