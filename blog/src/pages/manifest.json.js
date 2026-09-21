// The list of posts, for the parts of the build that are not Astro:
// build/build.mjs puts these URLs in sitemap.xml and the site-wide footer,
// build/make-blog-og.mjs renders a social card for each one.
//
// emit.mjs moves this file out of the published output into
// build/generated/blog-posts.json, so it is never served.
import { publishedPosts, isoDate } from '../lib/posts';

export async function GET() {
  const posts = await publishedPosts();
  return new Response(JSON.stringify({
    generated: new Date().toISOString().slice(0, 10),
    posts: posts.filter(p => !p.data.draft).map(post => ({
      slug: post.id,
      url: `/blog/${post.id}`,
      title: post.data.title,
      description: post.data.description,
      published: isoDate(post.data.published),
      updated: isoDate(post.data.updated ?? post.data.published),
      tags: post.data.tags,
      noindex: post.data.noindex || Boolean(post.data.canonical),
      ogImage: post.data.ogImage ?? null,
    })),
  }, null, 2));
}
