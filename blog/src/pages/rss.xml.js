// Full-text RSS. Feed readers and the AI crawlers that consume feeds get the
// whole post, not a teaser, which is the point of publishing one at all.
import rss from '@astrojs/rss';
import MarkdownIt from 'markdown-it';
import sanitizeHtml from 'sanitize-html';
import { site } from '../../../build/site.config.mjs';
import { publishedPosts } from '../lib/posts';

const md = new MarkdownIt({ html: true, linkify: true });

export async function GET(context) {
  const posts = await publishedPosts();
  return rss({
    title: 'The Fluencyfox blog',
    description: 'Notes on hiring for AI fluency, from the team running the assessments.',
    site: context.site,
    trailingSlash: false,
    items: posts.map(post => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.published,
      link: `/blog/${post.id}`,
      categories: post.data.tags,
      author: post.data.author,
      content: sanitizeHtml(md.render(post.body ?? ''), {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'h1', 'h2']),
        // Relative links in a feed item resolve against the reader, not the
        // site, so they have to be absolute.
        transformTags: {
          a: (name, attribs) => ({
            tagName: name,
            attribs: { ...attribs, href: absolute(attribs.href) },
          }),
          img: (name, attribs) => ({
            tagName: name,
            attribs: { ...attribs, src: absolute(attribs.src) },
          }),
        },
      }),
    })),
    customData: `<language>en-gb</language>`,
  });
}

const absolute = url => (url && url.startsWith('/') ? site.origin + url : url);
