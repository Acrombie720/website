---
title: "How to write a post on this blog"
description: "The example post. It shows every field the build enforces and every bit of formatting the styles cover. It is a draft, so it never reaches the live site."
published: 2026-09-21
author: Fluencyfox
tags: ["Housekeeping"]
draft: true
---

Delete this file once the first real post is up, or keep it as a reference. It
is marked `draft: true`, which means it renders in `npm run dev` and is dropped
from the published build.

## What the front matter has to say

Every field above is checked at build time. A title over 70 characters or a
description outside 70 to 160 fails the build rather than shipping a result
Google will truncate.

The optional fields are `updated`, `ogImage`, `canonical` and `noindex`. Set
`updated` when you revise a post, because it goes into the sitemap and into the
structured data, and a fresh `dateModified` is worth having.

## Formatting that already looks right

Ordinary paragraphs, **bold**, *italic*, `inline code` and [links](/research/ai-fluency-data-index)
are styled. So are lists:

- A first point
- A second point
- A third point

Quotes:

> Candidates do not fail because they cannot use the tools. They fail because
> they cannot say why they used them that way.

Tables:

| Column | What it holds |
| --- | --- |
| Left | Something |
| Right | Something else |

And code blocks, with syntax highlighting in both light and dark:

```js
const score = sections.reduce((total, s) => total + s.weight * s.score, 0);
```

## Where the file goes

One Markdown file per post in `blog/src/content/posts/`. The filename is the
URL, so `ai-fluency-is-not-prompt-writing.md` publishes at
`/blog/ai-fluency-is-not-prompt-writing`. Keep it short, keep the words in it
the ones someone would search for, and do not change it after publishing.
