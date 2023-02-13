# remark-flexible-paragraphs

[![NPM version][npm-image]][npm-url]
[![Build][github-build]][github-build-url]
![npm-typescript]
[![License][github-license]][github-license-url]

This package is a [unified][unified] ([remark][remark]) plugin to add custom paragraphs in a flexible way (compatible with new parser "[micromark][micromark]").

"**unified**" is a project that transforms content with abstract syntax trees (ASTs). "**remark**" adds support for markdown to unified. "**mdast**" is the markdown abstract syntax tree (AST) that remark uses.

**This plugin is a remark plugin that transforms the mdast.**

## When should I use this?

This plugin is useful if you want to **add a custom paragraph** in markdown, _with custom class name and also additional properties_.


## Installation

This package is suitable for ESM and CommonJs module system. In Node.js (version 12.20+, 14.14+, or 16.0+), install with npm:

```bash
npm install remark-flexible-paragraphs
```

or

```bash
yarn add remark-flexible-paragraphs
```

## Usage

### ???

Say we have the following file, `example.md`, which consists a flexible paragraph. 

```markdown
???
```

And our module, `example.js`, looks as follows:

```javascript
import { read } from "to-vfile";
import remark from "remark";
import gfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import remarkFlexibleParagraphs from "remark-flexible-paragraphs";

main();

async function main() {
  const file = await remark()
    .use(gfm)
    .use(remarkFlexibleParagraphs)
    .use(remarkRehype)
    .use(rehypeStringify)
    .process(await read("example.md"));

  console.log(String(file));
}
```

Now, running `node example.js` yields:\

```html
???
```

Without `remark-flexible-paragraphs`, you’d get:

```html
???
```

## Options

All options are optional and have default values.

```javascript
use(remarkFlexibleParagraphs, {

})
```

#### `xxxx`

It is a **string** option for providing custom HTML tag name for the `xxxx` node other than `xxx`.


## Examples:

```markdown
???
```

#### Without any options

```javascript
use(remarkFlexibleParagraphs);
```

is going to produce as default:

```html
???
```

## Syntax tree

This plugin only modifies the mdast (markdown abstract syntax tree) as explained.

## Types

This package is fully typed with [TypeScript][typeScript]. The plugin options' type is exported as `???`.

## Compatibility

This plugin works with unified version 6+ and remark version 7+. It is compatible with mdx version.2.

## Security

Use of `remark-flexible-paragraphs` does not involve rehype (hast) or user content so there are no openings for cross-site scripting (XSS) attacks.

## License

[MIT][license] © ipikuka

### Keywords

[unified][unifiednpm] [remark][remarknpm] [remark-plugin][remarkpluginnpm] [mdast][mdastnpm] [markdown][markdownnpm] [remark custom paragraphs][remarkCustomParagraphsnpm]

[unified]: https://github.com/unifiedjs/unified
[unifiednpm]: https://www.npmjs.com/search?q=keywords:unified
[remark]: https://github.com/remarkjs/remark
[remarknpm]: https://www.npmjs.com/search?q=keywords:remark
[remarkpluginnpm]: https://www.npmjs.com/search?q=keywords:remark%20plugin
[mdast]: https://github.com/syntax-tree/mdast
[mdastnpm]: https://www.npmjs.com/search?q=keywords:mdast
[micromark]: https://github.com/micromark/micromark
[rehypeprismplus]: https://github.com/timlrx/rehype-prism-plus
[typescript]: https://www.typescriptlang.org/
[license]: https://github.com/ipikuka/remark-flexible-paragraphs/blob/main/LICENSE
[markdownnpm]: https://www.npmjs.com/search?q=keywords:markdown
[remarkCustomParagraphsnpm]: https://www.npmjs.com/search?q=keywords:remark%20custom%20paragraph
[npm-url]: https://www.npmjs.com/package/remark-flexible-paragraphs
[npm-image]: https://img.shields.io/npm/v/remark-flexible-paragraphs
[github-license]: https://img.shields.io/github/license/ipikuka/remark-flexible-paragraphs
[github-license-url]: https://github.com/ipikuka/remark-flexible-paragraphs/blob/master/LICENSE
[github-build]: https://github.com/ipikuka/remark-flexible-paragraphs/actions/workflows/publish.yml/badge.svg
[github-build-url]: https://github.com/ipikuka/remark-flexible-paragraphs/actions/workflows/publish.yml
[npm-typescript]: https://img.shields.io/npm/types/remark-flexible-paragraphs
