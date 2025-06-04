# remark-flexible-paragraphs

[![npm version][badge-npm-version]][url-npm-package]
[![npm downloads][badge-npm-download]][url-npm-package]
[![publish to npm][badge-publish-to-npm]][url-publish-github-actions]
[![code-coverage][badge-codecov]][url-codecov]
[![type-coverage][badge-type-coverage]][url-github-package]
[![typescript][badge-typescript]][url-typescript]
[![license][badge-license]][url-license]

This package is a [**unified**][unified] ([**remark**][remark]) plugin **to add custom paragraphs with customizable properties in markdown.**

[**unified**][unified] is a project that transforms content with abstract syntax trees (ASTs) using the new parser [**micromark**][micromark]. [**remark**][remark] adds support for markdown to unified. [**mdast**][mdast] is the Markdown Abstract Syntax Tree (AST) which is a specification for representing markdown in a syntax tree.

**This plugin is a remark plugin that transforms the mdast.**

## When should I use this?

This plugin is useful if you want to **add a custom paragraph** in markdown, _with alignment support, custom class names, custom classifications, and also additional properties_. This plugin also give an option to wrap the paragraph with a container. **You can easily center or align paragraphs with the `remark-flexible-paragraphs`.**

## Installation

This package is suitable for ESM only. In Node.js (version 16+), install with npm:

```bash
npm install remark-flexible-paragraphs
```

or

```bash
yarn add remark-flexible-paragraphs
```

## Usage

#### ~> paragraph content

#### => paragraph content to be wrapped in a container

Say we have the following file, `example.md`, which consists some flexible paragraphs.

```markdown
I am a normal paragraph
~> I am a flexible paragraph
=> I am a flexible paragraph wrapped in a div
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
<p>I am a normal paragraph</p>
<p class="flexible-paragraph">I am a flexible paragraph</p>
<div class="flexible-paragraph-wrapper">
  <p class="flexible-paragraph">I am a flexible paragraph wrapped in a div</p>
</div>
```

Without `remark-flexible-paragraphs`, you’d get:

```html
<p>I am a normal paragraph ~> I am a flexible paragraph => I am a flexible paragraph wrapped in a div</p>
```

## Further Usage

**The way of the usage (it is easy):**

1. choose the marker: **`~>`** for paragraph; **`=>`** for paragraph in a wrapper
2. put the marker **`~>`** or **`=>`** where the flexible paragraph begins
3. choose the character(s) from the dictionary **`[a-z0-9]` (only lowercase and numbers)** for classification
4. each dictionary key has a predefined but customizable classification value
5. put the character(s) into middle of the marker **(in order to add classification)**
6. it has no alignment by default
7. if you want **to center it**, use a pipe **`|`**
8. if you want **to align it to left**, use a colon **`:`** at the left side
9. if you want **to align it to right**, use a colon **`:`** at the right side
10. if you want **to justify it**, use a colon **`:`** at both sides
11. if there is no classification, but want to align it, use the colon with the pipe:
   - for **left alignment** use **`:|`**
   - for **right alignment** use **`|:`**
   - for **justify alignment** use **`:|:`**
   - for **justify alignment** use **`::`**
   - for **center alignment** use **`|`**

```markdown
~> paragraph with no classification and no alignment

~|> paragraph center-aligned with no classification
~:|> paragraph left-aligned with no classification
~|:> paragraph right-aligned with no classification
~::> paragraph justify-aligned with no classification

=> paragraph in a wrapper with no classification and no alignment

=|> paragraph center-aligned in a wrapper with no classification
=:|> paragraph left-aligned in a wrapper with no classification
=|:> paragraph right-aligned in a wrapper with no classification
=::> paragraph justify-aligned in a wrapper with no classification

~s> classified as "success" with no alignment
~s|> center-aligned and classified as "success"
~|s> center-aligned and classified as "success"
~:s> left-aligned and classified as "success"
~s:> right-aligned and classified as "success"
~:s:> justify-aligned and classified as "success"

~w> classified as "warning" with no alignment
~d> classified as "danger" with no alignment
~i> classified as "info" with no alignment
~n> classified as "note" with no alignment
~t> classified as "tip" with no alignment

~aw> classified as "alert" and "warning" with no alignment
~:aw> left-aligned and classified as "alert" and "warning"
~aw:> right-aligned and classified as "alert" and "warning"
~:aw:> justify-aligned and classified as "alert" and "warning"
~|aw> center-aligned and classified as "alert" and "warning"
~a|w> center-aligned and classified as "alert" and "warning"
~aw|> center-aligned and classified as "alert" and "warning"

=f2c> classified as "framed", "type-2" and "caution" in a wrapper
=:f2c> left-aligned and classified as "framed", "type-2" and "caution" in a wrapper
=f2c:> right-aligned and classified as "framed", "type-2" and "caution" in a wrapper
=:f2c:> justify-aligned and classified as "framed", "type-2" and "caution" in a wrapper
=|f2c> center-aligned and classified as "framed", "type-2" and "caution" in a wrapper
=f|2c> center-aligned and classified as "framed", "type-2" and "caution" in a wrapper
=f2|c> center-aligned and classified as "framed", "type-2" and "caution" in a wrapper
=f2c|> center-aligned and classified as "framed", "type-2" and "caution" in a wrapper
```

## Options

All options are **optional** and have **default values**.

```javascript
type Alignment = "center" | "left" | "right" | "justify";
type RestrictedRecord = Record<string, unknown> & { className?: never };

type Dictionary = Partial<Record<Key, string>>;
type TagNameFunction = (alignment?: Alignment, classifications?: string[]) => string;
type ClassNameFunction = (alignment?: Alignment, classifications?: string[]) => string[];
type PropertyFunction = (alignment?: Alignment, classifications?: string[]) => RestrictedRecord;

use(remarkFlexibleParagraphs, {
  dictionary?: Dictionary; // explained in the options section
  paragraphClassName?: string | ClassNameFunction; // default is "flexible-paragraph"
  paragraphProperties?: PropertyFunction;
  paragraphClassificationPrefix?: string; // default is "flexiparaph"
  wrapperTagName?: string | TagNameFunction; // default is "div"
  wrapperClassName?: string | ClassNameFunction; // default is "flexible-paragraph-wrapper"
  wrapperProperties?: PropertyFunction;
} as FlexibleParagraphOptions)
```

#### `dictionary`

It is a **key, value** option for providing **custom classification** for the `paragraph` node. 

The dictionary is opinionated, by default.

```typescript
type Key = "a" | "b" | "c" | "d" | "e" | "f" | "g" | "h" | "i" | "j" | "k" | "l" | "m" 
         | "n" | "o" | "p" | "q" | "r" | "s" | "t" | "u" | "v" | "w" | "x" | "y" | "z"
         | "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";

type Dictionary = Partial<Record<Key, string>>;

const dictionary: Dictionary = {
  a: "alert",
  b: "blue",
  c: "caution",
  d: "danger",
  e: "error",
  f: "framed",
  g: "green",
  h: "horizontal",
  i: "info",
  j: "jumbo",
  k: "kindle",
  l: "lokum",
  m: "menu",
  n: "note",
  o: "ordinary",
  p: "pack",
  q: "quantity",
  r: "red",
  s: "success",
  t: "tip",
  u: "unified",
  v: "verticle",
  w: "warning",
  x: "xray",
  y: "yellow",
  z: "zigzag",
  "0": "type-0",
  "1": "type-1",
  "2": "type-2",
  "3": "type-3",
  "4": "type-4",
  "5": "type-5",
  "6": "type-6",
  "7": "type-7",
  "8": "type-8",
  "9": "type-9",
};
```

**You can override the dictionary entries.**

```javascript
use(remarkFlexibleParagraphs, {
  dictionary: {
    w: "white"
  },
});
```

Now, it is overriden for only `w` key, and the classification will be `white` instead of default one `warning`.

```markdown
~w> paragraph content
```

```html
<p class="flexible-paragraph flexiparaph-white">paragraph content</p>
```

#### `paragraphClassName`

It is a **string** or a **callback** `(alignment?: Alignment, classifications?: string[]) => string[]` option for providing custom class name for the `paragraph` node. 

By default, it is `flexible-paragraph`, and all paragraphs' classnames will contain `flexible-paragraph`.

A flexible paragraph node contains also **secondary class names** representing the **specification** and/or **alignment** which starts with the prefix `flexiparaph-`, like `flexiparaph-alert` or `flexiparaph-warning` or `flexiparaph-align-center`. If there is no classification or alignment, then the secondary class name will not take place.

```javascript
use(remarkFlexibleParagraphs, {
  paragraphClassName: "remark-paragraph",
});
```

Now, the paragraph nodes will contain `remark-paragraph` as a className.

```markdown
~> content
=> content in a container
```

```html
<p class="remark-paragraph">content</p>
<div class="...">
  <p class="remark-paragraph">content in a container</p>
</div>
```

The option can take also a callback function, which has two optional arguments `alignment` and `classifications`, and returns **array of strings** representing **class names**. For example, if the input contains `~:a> content`, the parameter `alignment` would be `"left"` and the `classifications` would be `["alert"]`.

```javascript
use(remarkFlexibleParagraphs, {
  paragraphClassName: (alignment, classifications) => {
    return [
      "custom-paragraph",
      ...(classifications ? classifications : []),
      ...(alignment ? [alignment] : []),
    ];
  },
});
```

Now, the paragraph **will contain class names** like `custom-paragraph`, `custom-paragraph alert center` etc.

```markdown
~> content
~a> content
~|> content
```

```html
<p class="custom-paragraph">content</p>
<p class="custom-paragraph alert">content</p>
<p class="custom-paragraph center" style="text-align:center">content</p>
```

> [!WARNING]
> **If you use the `paragraphClassName` option as a callback function, it is your responsibility to define class names, primary or secondary in an array.**

#### `paragraphClassificationPrefix`

It is a **string** option for providing classification prefix for the `paragraph` node.

By default, it is `flexiparaph`, which is added as a prefix like `flexiparaph-alert`, `flexiparaph-align-center` etc.

```javascript
use(remarkFlexibleParagraphs, {
  paragraphClassificationPrefix: "",
});
```

Now, the paragraph class name **will not take any prefix for the classifications and alignment**.

```markdown
~> content
~a> content
~|> content
```

```html
<p class="flexible-paragraph">content</p>
<p class="flexible-paragraph alert">content</p>
<p class="flexible-paragraph align-center" style="text-align:center">content</p>
```

#### `paragraphProperties`

It is a **callback** `(alignment?: Alignment, classifications?: string[]) => Record<string, unknown> & { className?: never }` option to set additional properties for the `paragraph` node.

The callback function that takes `alignment` and `classifications` as optional arguments and returns **object** which is going to be used for adding additional properties into the `paragraph` node. For example, if the input contains `~:a> content`, the parameter `alignment` would be `"left"` and the `classifications` would be `["alert"]`.

**The `className` key is forbidden and effectless in the returned object.**

```javascript
use(remarkFlexibleParagraphs, {
  paragraphProperties(alignment, classifications) {
    return {
      title: classifications,
      ["data-align"]: alignment,
    };
  },
});
```

Now, the paragraph nodes which have a classification will contain `title` property, which have an alignment will contain `data-align` property.

```markdown
~> content
~a:> content
```

```html
<p class="...">content</p>
<p class="..." title="alert" data-align="right">content</p>
```

#### `wrapperTagName`

It is a **string** or a **callback** `(alignment?: Alignment, classifications?: string[]) => string` option for providing custom HTML tag name for the `wrapper` nodes.

By default, it is `div` which is well known HTML element for containers.

```javascript
use(remarkFlexibleParagraphs, {
  wrapperTagName: "section",
});
```

Now, the wrapper tag names will be `section`.

```html
<section class="...">
  <p class="flexible-paragraph">content</p>
</section>
```

The option can take also a callback function, which has optional arguments `alignment` and `classifications`, and returns **string** representing the **custom tag name**. For example, if the input contains `=a> content`, the parameter `alignment` would be `undefined` and the `classifications` would be `["alert"]`.

```javascript
use(remarkFlexibleParagraphs, {
  wrapperTagName: (alignment, classifications) => {
    return classifications?.includes("alert") ? "section" : "div"
  },
});
```

Now, the element tag names will be the color name.

```markdown
=> content
=a> content
```

```html
<div class="...">
  <p class="flexible-paragraph">content</p>
</div>
<section class="...">
  <p class="flexible-paragraph flexiparaph-alert">content</p>
</section>
```

#### `wrapperClassName`

It is a **string** or a **callback** `(alignment?: Alignment, classifications?: string[]) => string[]` option for providing custom class name for the `wrapper` node. 

By default, it is `flexible-paragraph-wrapper`, and all wrappers' classnames will contain `flexible-paragraph-wrapper`.

```javascript
use(remarkFlexibleParagraphs, {
  wrapperClassName: "remark-wrapper",
});
```

Now, the wrapper nodes will contain `remark-wrapper` as a className.

```markdown
=a> content in a wrapper
```

```html
<div class="remark-wrapper">
  <p class="...">content in a wrapper</p>
</div>
```

The option can take also a callback function, which has two optional arguments `alignment` and `classifications`, and returns **array of strings** representing **class names**. For example, if the input contains `=w:> content`, the parameter `alignment` would be `"right"` and the `classifications` would be `["warning"]`.

```javascript
use(remarkFlexibleParagraphs, {
  wrapperClassName: (alignment, classifications) => {
    return alignment 
      ? [`custom-paragraph-${alignment}`]
      : [ "custom-paragraph"];
  },
});
```

Now, the wrapper class names **will contain a class name** like `custom-paragraph`, `custom-paragraph-center` etc.

```markdown
=> content
=|> content
```

```html
<div class="custom-paragraph">
  <p class="...">content</p>
</div>
<div class="custom-paragraph-center">
  <p class="..." style="text-align:center">content</p>
</div>
```

> [!WARNING]
> **If you use the `wrapperClassName` option as a callback function, it is your responsibility to define class names, primary or secondary in an array.**

#### `wrapperProperties`

It is a **callback** `(alignment?: Alignment, classifications?: string[]) => Record<string, unknown> & { className?: never }` option to set additional properties for the `wrapper` node.

The callback function that takes `alignment` and `classifications` as optional arguments and returns **object** which is going to be used for adding additional properties into the `wrapper` node. For example, if the input contains `=:aw:> content`, the parameter `alignment` would be `"justify"` and the `classifications` would be `["alert", "warning"]`.

**The `className` key is forbidden and effectless in the returned object.**

```javascript
use(remarkFlexibleParagraphs, {
  wrapperProperties(alignment, classifications) {
    return {
      title: classifications,
      ["data-align"]: alignment,
    };
  },
});
```

Now, the wrapper nodes which have a classification will contain `title` property, which have an alignment will contain `data-align` property.

```markdown
=> content
=a:> content
```

```html
<div class="...">
  <p class="...">content</p>
</div>
<div class="..." title="alert" data-align="right">
  <p class="...">content</p>
</div>
```

## Examples:

```markdown
~> Standard flexible paragraph
=:a:> Alert paragraph justified in a wrapper
~:s> Success paragraph left-aligned
=|> Centered paragraph in a wrapper
```

#### Without any option

```javascript
use(remarkFlexibleParagraphs);
```

is going to produce as default:

```html
<p class="flexible-paragraph">Standard flexible paragraph</p>
<div class="flexible-paragraph-wrapper">
  <p
    class="flexible-paragraph flexiparaph-alert flexiparaph-align-justify"
    style="text-align:justify"
  >
    Alert paragraph justified in a wrapper
  </p>
</div>
<p
  class="flexible-paragraph flexiparaph-success flexiparaph-align-left"
  style="text-align:left"
>
  Success paragraph left-aligned
</p>
<div class="flexible-paragraph-wrapper">
  <p class="flexible-paragraph flexiparaph-align-center" style="text-align:center">
    Centered paragraph in a wrapper
  </p>
</div>
```

#### With options

```javascript
use(remarkFlexibleParagraphs, {
  dictionary: {
    s: "solid",
  },
  paragraphClassName: "custom-paragraph",
  paragraphClassificationPrefix: "paraflex",
  wrapperTagName: "section",
  wrapperClassName: "custom-paragraph-wrapper",
  wrapperProperties(alignment, classifications) {
    return {
      ["data-alignment"]: alignment,
      ["data-classifications"]: classifications,
    };
  },
});
```

is going to produce:

```html
<p class="custom-paragraph">Standard flexible paragraph</p>
<section class="custom-paragraph-wrapper" data-alignment="justify" data-classifications="alert">
  <p class="custom-paragraph paraflex-alert paraflex-align-justify" style="text-align:justify">
    Alert paragraph justified in a wrapper
  </p>
</section>
<p class="custom-paragraph paraflex-solid paraflex-align-left" style="text-align:left">
  Success paragraph left-aligned
</p>
<section class="custom-paragraph-wrapper" data-alignment="center">
  <p class="custom-paragraph paraflex-align-center" style="text-align:center">
    Centered paragraph in a wrapper
  </p>
</section>
```

For detailed examples, you can have a look at the test files in the github repo.

## Syntax tree

This plugin only modifies the mdast (markdown abstract syntax tree) as explained.

## Types

This package is fully typed with [TypeScript][url-typescript]. The plugin options' type is exported as `FlexibleParagraphOptions`.

## Compatibility

This plugin works with `unified` version 6+ and `remark` version 7+. It is compatible with `mdx` version 2+.

## Security

Use of `remark-flexible-paragraphs` does not involve rehype (hast) or user content so there are no openings for cross-site scripting (XSS) attacks.

## My Plugins

I like to contribute the Unified / Remark / MDX ecosystem, so I recommend you to have a look my plugins.

### My Remark Plugins

- [`remark-flexible-code-titles`](https://www.npmjs.com/package/remark-flexible-code-titles)
  – Remark plugin to add titles or/and containers for the code blocks with customizable properties
- [`remark-flexible-containers`](https://www.npmjs.com/package/remark-flexible-containers)
  – Remark plugin to add custom containers with customizable properties in markdown
- [`remark-ins`](https://www.npmjs.com/package/remark-ins)
  – Remark plugin to add `ins` element in markdown
- [`remark-flexible-paragraphs`](https://www.npmjs.com/package/remark-flexible-paragraphs)
  – Remark plugin to add custom paragraphs with customizable properties in markdown
- [`remark-flexible-markers`](https://www.npmjs.com/package/remark-flexible-markers)
  – Remark plugin to add custom `mark` element with customizable properties in markdown
- [`remark-flexible-toc`](https://www.npmjs.com/package/remark-flexible-toc)
  – Remark plugin to expose the table of contents via `vfile.data` or via an option reference
- [`remark-mdx-remove-esm`](https://www.npmjs.com/package/remark-mdx-remove-esm)
  – Remark plugin to remove import and/or export statements (mdxjsEsm)

### My Rehype Plugins

- [`rehype-pre-language`](https://www.npmjs.com/package/rehype-pre-language)
  – Rehype plugin to add language information as a property to `pre` element
- [`rehype-highlight-code-lines`](https://www.npmjs.com/package/rehype-highlight-code-lines)
  – Rehype plugin to add line numbers to code blocks and allow highlighting of desired code lines
- [`rehype-code-meta`](https://www.npmjs.com/package/rehype-code-meta)
  – Rehype plugin to copy `code.data.meta` to `code.properties.metastring`
- [`rehype-image-toolkit`](https://www.npmjs.com/package/rehype-image-toolkit)
  – Rehype plugin to enhance Markdown image syntax `![]()` and Markdown/MDX media elements (`<img>`, `<audio>`, `<video>`) by auto-linking bracketed or parenthesized image URLs, wrapping them in `<figure>` with optional captions, unwrapping images/videos/audio from paragraph, parsing directives in title for styling and adding attributes, and dynamically converting images into `<video>` or `<audio>` elements based on file extension.

### My Recma Plugins

- [`recma-mdx-escape-missing-components`](https://www.npmjs.com/package/recma-mdx-escape-missing-components)
  – Recma plugin to set the default value `() => null` for the Components in MDX in case of missing or not provided so as not to throw an error
- [`recma-mdx-change-props`](https://www.npmjs.com/package/recma-mdx-change-props)
  – Recma plugin to change the `props` parameter into the `_props` in the `function _createMdxContent(props) {/* */}` in the compiled source in order to be able to use `{props.foo}` like expressions. It is useful for the `next-mdx-remote` or `next-mdx-remote-client` users in `nextjs` applications.
- [`recma-mdx-change-imports`](https://www.npmjs.com/package/recma-mdx-change-imports)
  – Recma plugin to convert import declarations for assets and media with relative links into variable declarations with string URLs, enabling direct asset URL resolution in compiled MDX.
- [`recma-mdx-import-media`](https://www.npmjs.com/package/recma-mdx-import-media)
  – Recma plugin to turn media relative paths into import declarations for both markdown and html syntax in MDX.
- [`recma-mdx-import-react`](https://www.npmjs.com/package/recma-mdx-import-react)
  – Recma plugin to ensure getting `React` instance from the arguments and to make the runtime props `{React, jsx, jsxs, jsxDev, Fragment}` is available in the dynamically imported components in the compiled source of MDX.
- [`recma-mdx-html-override`](https://www.npmjs.com/package/recma-mdx-html-override)
  – Recma plugin to allow selected raw HTML elements to be overridden via MDX components.
- [`recma-mdx-interpolate`](https://www.npmjs.com/package/recma-mdx-interpolate)
  – Recma plugin to enable interpolation of identifiers wrapped in curly braces within the `alt`, `src`, `href`, and `title` attributes of markdown link and image syntax in MDX.

## License

[MIT License](./LICENSE) © ipikuka

[unified]: https://github.com/unifiedjs/unified
[micromark]: https://github.com/micromark/micromark
[remark]: https://github.com/remarkjs/remark
[remarkplugins]: https://github.com/remarkjs/remark/blob/main/doc/plugins.md
[mdast]: https://github.com/syntax-tree/mdast

[badge-npm-version]: https://img.shields.io/npm/v/remark-flexible-paragraphs
[badge-npm-download]:https://img.shields.io/npm/dt/remark-flexible-paragraphs
[url-npm-package]: https://www.npmjs.com/package/remark-flexible-paragraphs
[url-github-package]: https://github.com/ipikuka/remark-flexible-paragraphs

[badge-license]: https://img.shields.io/github/license/ipikuka/remark-flexible-paragraphs
[url-license]: https://github.com/ipikuka/remark-flexible-paragraphs/blob/main/LICENSE

[badge-publish-to-npm]: https://github.com/ipikuka/remark-flexible-paragraphs/actions/workflows/publish.yml/badge.svg
[url-publish-github-actions]: https://github.com/ipikuka/remark-flexible-paragraphs/actions/workflows/publish.yml

[badge-typescript]: https://img.shields.io/npm/types/remark-flexible-paragraphs
[url-typescript]: https://www.typescriptlang.org/

[badge-codecov]: https://codecov.io/gh/ipikuka/remark-flexible-paragraphs/graph/badge.svg?token=MD4FTZUA1W
[url-codecov]: https://codecov.io/gh/ipikuka/remark-flexible-paragraphs

[badge-type-coverage]: https://img.shields.io/badge/dynamic/json.svg?label=type-coverage&prefix=%E2%89%A5&suffix=%&query=$.typeCoverage.atLeast&uri=https%3A%2F%2Fraw.githubusercontent.com%2Fipikuka%2Fremark-flexible-paragraphs%2Fmaster%2Fpackage.json
