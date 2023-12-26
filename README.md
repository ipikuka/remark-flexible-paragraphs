# remark-flexible-paragraphs

[![NPM version][npm-image]][npm-url]
[![Build][github-build]][github-build-url]
![npm-typescript]
[![License][github-license]][github-license-url]

This package is a [unified][unified] ([remark][remark]) plugin to add custom paragraphs in a flexible way (compatible with new parser "[micromark][micromark]").

"**unified**" is a project that transforms content with abstract syntax trees (ASTs). "**remark**" adds support for markdown to unified. "**mdast**" is the markdown abstract syntax tree (AST) that remark uses.

**This plugin is a remark plugin that transforms the mdast.**

## When should I use this?

This plugin is useful if you want to **add a custom paragraph** in markdown, _with alignment support, custom class name, custom classifications, and also additional properties_. This plugin also give an option to wrap the paragraph with a container. **You can easily center or align the paragraphs with the `remark-flexible-paragraphs`.**

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

#### ~> [paragraph content]

#### => [paragraph content wrapped in a container]

Say we have the following file, `example.md`, which consists a flexible paragraph.

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
4. each dictionary key has a predefined but customizable classification value (some are `undefined` yet)
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

## Dictionary

```javascript
{
  a: "alert",
  b: "blue",
  c: "caution",
  d: "danger",
  e: "error",
  f: "framed",
  g: "green",
  h: "horizontal",
  i: "info",
  j: undefined,
  k: undefined,
  l: undefined,
  m: undefined,
  n: "note",
  o: undefined,
  p: undefined,
  q: undefined,
  r: "red",
  s: "success",
  t: "tip",
  u: undefined,
  v: "verticle",
  w: "warning",
  x: undefined,
  y: "yellow",
  z: undefined,
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

## Options

All options are **optional** and have **defaultvalues**.

```javascript
/* the type definitions in the package
type Dictionary = Partial<Record<Keys, string>>;
type Alignment = "center" | "left" | "right" | "justify";
type PropertyFunction = (alignment?: Alignment, classifications?: string[]) => Record<string,unknown>;
*/

// create flexible paragraph options object
const flexibleParagraphOptions: FlexibleParagraphOptions = {
  dictionary?: Dictionary; // default is represented above
  paragraphClassName?: string; // default is "flexible-paragraph"
  paragraphClassificationPrefix?: string; // default is "flexiparaph"
  wrapperTagName?: string; // default is "div"
  wrapperClassName?: string; // default is "flexible-paragraph-wrapper"
  wrapperProperties?: PropertyFunction; // default is undefined
};

// use these options like below
use(remarkFlexibleParagraphs, flexibleParagraphOptions)
```

#### `dictionary`

It is an **key, value** option for providing custom classification value for the `paragraph` node. If you provide `dictionary: {w: "white"}`, it overrides to the only `w` key, and the value would be "white" instead of default one "warning".

#### `paragraphClassName`

It is a **string** option for providing custom className for the `paragraph` node other than default `flexible-paragraph`.

#### `paragraphClassificationPrefix`

It is a **string** option for providing custom classification prefix for the `paragraph` node other than default `flexiparaph`.

#### `wrapperTagName`

It is a **string** option for providing custom HTML tag name for the `wrapper` node other than default `div`.

#### `wrapperClassName`

It is a **string** option for providing custom className for the `wrapper` node other than default `flexible-paragraph-wrapper`.

#### `wrapperProperties`

It is an option to set additional properties for the `wrapper` node. It is a callback function that takes the `alignment` and the `classifications` as optional arguments and returns the object which is going to be used for adding additional properties into the `wrapper` node. If you input for example as `=:aw:>`, the param `alignment` would be `"justify"` and the `classifications` would be `["alert", "warning"]`.

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

This package is fully typed with [TypeScript][typeScript]. The plugin options' type is exported as `FlexibleParagraphOptions`.

## Compatibility

This plugin works with unified version 6+ and remark version 7+. It is compatible with mdx version.2.

## Security

Use of `remark-flexible-paragraphs` does not involve rehype (hast) or user content so there are no openings for cross-site scripting (XSS) attacks.

## My Remark Plugins

The remark packages I have published are presented below:
+ [`remark-flexible-code-titles`](https://www.npmjs.com/package/remark-flexible-code-titles)
  – Remark plugin to add titles or/and containers for the code blocks with customizable properties
+ [`remark-flexible-containers`](https://www.npmjs.com/package/remark-flexible-containers)
  – Remark plugin to add custom containers with customizable properties in markdown
+ [`remark-flexible-paragraphs`](https://www.npmjs.com/package/remark-flexible-paragraphs)
  – Remark plugin to add custom paragraphs with customizable properties in markdown
+ [`remark-flexible-markers`](https://www.npmjs.com/package/remark-flexible-markers)
  – Remark plugin to add custom `mark` element with customizable properties in markdown
+ [`remark-ins`](https://www.npmjs.com/package/remark-ins)
  – Remark plugin to add `ins` element in markdown

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
