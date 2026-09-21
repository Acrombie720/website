import { site } from '../../../build/site.config.mjs';
import { isoDate, type Post } from './posts';

/**
 * The plain-text citation line for a post. One string, used in three places:
 * the cite-this block on the page, the footer of the Markdown copy, and
 * nothing else yet.
 *
 * Author first, then year, then title and URL, which is the shape a person
 * pasting it into a document or a model quoting it both expect.
 */
export function citation(post: Post): string {
  const d = post.data;
  const year = (d.updated ?? d.published).getUTCFullYear();
  const author = d.author === site.name ? site.name : `${d.author}, ${site.name}`;
  return `${author} (${year}). ${d.title}. ${site.origin}/blog/${post.id}`;
}

/**
 * The post as Markdown, for the agents that ask for it.
 *
 * Coding agents send `Accept: text/markdown` and several tools now serve it,
 * because HTML spends most of its tokens on markup. We have an advantage
 * here: the source is already Markdown, so this is the original text rather
 * than a lossy conversion of our own HTML back into it.
 *
 * The header is deliberate. An agent that reads only the top of the file
 * still comes away with the claim, the date, the canonical URL and the line
 * to cite.
 */
export function postAsMarkdown(post: Post): string {
  const d = post.data;
  const url = `${site.origin}/blog/${post.id}`;
  const out = [
    `# ${d.title}`,
    '',
    `> ${d.description}`,
    '',
    `- Source: ${site.name} (${site.origin}/)`,
    `- Canonical: ${url}`,
    `- Author: ${d.author}${d.authorUrl ? ` (${d.authorUrl})` : ''}`,
    `- Published: ${isoDate(d.published)}`,
    ...(d.updated ? [`- Updated: ${isoDate(d.updated)}`] : []),
    ...(d.tags.length ? [`- Tags: ${d.tags.join(', ')}`] : []),
  ];

  if (d.takeaways.length) {
    out.push('', '## In short', '', ...d.takeaways.map(point => `- ${point}`));
  }

  out.push('', '---', '', (post.body ?? '').trim());

  if (d.faq.length) {
    out.push('', '---', '', '## Questions this post answers', '');
    for (const item of d.faq) out.push(`### ${item.q}`, '', item.a, '');
  }

  out.push(
    '',
    '---',
    '',
    `Cite this: ${citation(post)}`,
    `Every post as Markdown: ${site.origin}/blog/index.md`,
    ''
  );

  return out.join('\n');
}
