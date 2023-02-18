import { unified, type Processor } from "unified";
import remarkParse from "remark-parse";
import gfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import dedent from "dedent";
import type { VFileCompatible } from "vfile";

import plugin from "../src";

const compiler: Processor = unified()
  .use(remarkParse)
  .use(gfm)
  .use(plugin)
  .use(remarkRehype)
  .use(rehypeStringify);

const process = async (contents: VFileCompatible): Promise<VFileCompatible> => {
  return compiler.process(contents).then((file) => file.value);
};

describe("no options - fail", () => {
  // ******************************************
  it("bad usage", async () => {
    const input = dedent`
      -> content

      ~_> content
      ~ç> content
      ~A> content

      ~dg::> content
      ~::dg> content

      ~:::> content
      ~::|> content
      ~|::> content
    `;

    expect(await process(input)).toMatchInlineSnapshot(`
      "<p>-> content</p>
      <p>~_> content
      ~ç> content
      ~A> content</p>
      <p>~dg::> content
      ~::dg> content</p>
      <p>~:::> content
      ~::|> content
      ~|::> content</p>"
    `);
  });
});

describe("no options - success", () => {
  // ******************************************
  it("standart usage without classification and alignment", async () => {
    const input = dedent(`
      ~> hello standard
    `);

    expect(await process(input)).toMatchInlineSnapshot(
      `"<p class="flexible-paragraph">hello standard</p>"`,
    );
  });

  // ******************************************
  it("only catches the exact marker", async () => {
    const input = dedent`
        ~~> content

        =~> content
      `;

    expect(await process(input)).toMatchInlineSnapshot(`
      "<p>~</p>
      <p class="flexible-paragraph">content</p>
      <p>=</p>
      <p class="flexible-paragraph">content</p>"
    `);
  });

  // ******************************************
  it("one paragraph that starts with the marker", async () => {
    const input = dedent(`
      ~:wf2:> hello
      **bold** with
      continue *italic*
    `);

    expect(await process(input)).toMatchInlineSnapshot(`
      "<p align="center" class="flexible-paragraph flexigraph-warning flexigraph-flex flexigraph-type-2">hello
      <strong>bold</strong> with
      continue <em>italic</em></p>"
    `);
  });

  // ******************************************
  it("one paragraph that each line turns into seperate paragraph", async () => {
    const input = dedent(`
      ~w2|g> hello
      ~> **bold** with
      ~|>continue *italic*
    `);

    expect(await process(input)).toMatchInlineSnapshot(`
      "<p align="center" class="flexible-paragraph flexigraph-warning flexigraph-type-2 flexigraph-grid">hello</p>
      <p class="flexible-paragraph"><strong>bold</strong> with</p>
      <p align="center" class="flexible-paragraph">continue <em>italic</em></p>"
    `);
  });

  // ******************************************
  it("one paragraph that multiple lines turn into seperate paragraph ", async () => {
    const input = dedent(`
      ~w:> hello
      **bold** with
      ~:w> xxx
      continue *italic*
      ~> yyy
    `);

    expect(await process(input)).toMatchInlineSnapshot(`
      "<p align="right" class="flexible-paragraph flexigraph-warning">hello
      <strong>bold</strong> with</p>
      <p align="left" class="flexible-paragraph flexigraph-warning">xxx
      continue <em>italic</em></p>
      <p class="flexible-paragraph">yyy</p>"
    `);
  });

  // ******************************************
  it("more paragraph, some markers are in the middle", async () => {
    const input = dedent(`
      **bold** with
      ~w:> hello warning
      ~:s> xxx

      continue *italic*

      *italic*
      ~::> yyy **bold**
      aaa *italic*

      *italic* continue

      *italic* content
      ~:0:> zzz
      *italic*
    `);

    expect(await process(input)).toMatchInlineSnapshot(`
      "<p><strong>bold</strong> with</p>
      <p align="right" class="flexible-paragraph flexigraph-warning">hello warning</p>
      <p align="left" class="flexible-paragraph flexigraph-success">xxx</p>
      <p>continue <em>italic</em></p>
      <p><em>italic</em></p>
      <p align="center" class="flexible-paragraph">yyy <strong>bold</strong>
      aaa <em>italic</em></p>
      <p><em>italic</em> continue</p>
      <p><em>italic</em> content</p>
      <p align="center" class="flexible-paragraph flexigraph-type-0">zzz
      <em>italic</em></p>"
    `);
  });

  // ******************************************
  it("more paragraph, some markers are in the middle in the texts", async () => {
    const input = dedent(`
      another paragraph

      abc *ithalic* ~w|> hello
      ~:s> aaa **strong** bbb ~>
      ccc
      ~|> yyy
      ~0:> zzz

      **another paragraph**
    `);

    expect(await process(input)).toMatchInlineSnapshot(`
      "<p>another paragraph</p>
      <p>abc <em>ithalic</em></p>
      <p align="center" class="flexible-paragraph flexigraph-warning">hello</p>
      <p align="left" class="flexible-paragraph flexigraph-success">aaa <strong>strong</strong> bbb</p>
      <p class="flexible-paragraph">ccc</p>
      <p align="center" class="flexible-paragraph">yyy</p>
      <p align="right" class="flexible-paragraph flexigraph-type-0">zzz</p>
      <p><strong>another paragraph</strong></p>"
    `);
  });

  // ******************************************
  it("alignment", async () => {
    const input = dedent(`
      ~|> content
      ~:|> content
      ~|:> content
      ~::> content
    `);

    expect(await process(input)).toMatchInlineSnapshot(`
      "<p align="center" class="flexible-paragraph">content</p>
      <p align="center" class="flexible-paragraph">content</p>
      <p align="center" class="flexible-paragraph">content</p>
      <p align="center" class="flexible-paragraph">content</p>"
    `);
  });

  // ******************************************
  it("one classification", async () => {
    const input = dedent(`
      ~s> content
      ~s|> content
      ~|s> content
      ~:s:> content
      ~:s> content
      ~s:> content
    `);

    expect(await process(input)).toMatchInlineSnapshot(`
      "<p class="flexible-paragraph flexigraph-success">content</p>
      <p align="center" class="flexible-paragraph flexigraph-success">content</p>
      <p align="center" class="flexible-paragraph flexigraph-success">content</p>
      <p align="center" class="flexible-paragraph flexigraph-success">content</p>
      <p align="left" class="flexible-paragraph flexigraph-success">content</p>
      <p align="right" class="flexible-paragraph flexigraph-success">content</p>"
    `);
  });

  // ******************************************
  it("different classifications", async () => {
    const input = dedent(`
      ~w> classified as "warning"
      ~d> classified as "danger"
      ~i> classified as "info"
      ~n> classified as "note"
      ~t> classified as "tip"
    `);

    expect(await process(input)).toMatchInlineSnapshot(`
      "<p class="flexible-paragraph flexigraph-warning">classified as "warning"</p>
      <p class="flexible-paragraph flexigraph-danger">classified as "danger"</p>
      <p class="flexible-paragraph flexigraph-info">classified as "info"</p>
      <p class="flexible-paragraph flexigraph-note">classified as "note"</p>
      <p class="flexible-paragraph flexigraph-tip">classified as "tip"</p>"
    `);
  });

  // ******************************************
  it("two classification", async () => {
    const input = dedent(`
      ~gw> content
      ~gw:> content
      ~:gw> content
      ~:gw:> content
      ~|gw> content
      ~g|w> content
      ~gw|> content
    `);

    expect(await process(input)).toMatchInlineSnapshot(`
      "<p class="flexible-paragraph flexigraph-grid flexigraph-warning">content</p>
      <p align="right" class="flexible-paragraph flexigraph-grid flexigraph-warning">content</p>
      <p align="left" class="flexible-paragraph flexigraph-grid flexigraph-warning">content</p>
      <p align="center" class="flexible-paragraph flexigraph-grid flexigraph-warning">content</p>
      <p align="center" class="flexible-paragraph flexigraph-grid flexigraph-warning">content</p>
      <p align="center" class="flexible-paragraph flexigraph-grid flexigraph-warning">content</p>
      <p align="center" class="flexible-paragraph flexigraph-grid flexigraph-warning">content</p>"
    `);
  });

  // ******************************************
  it("three classification", async () => {
    const input = dedent(`
      ~g2c> content
      ~:g2c> content
      ~g2c:> content
      ~:g2c:> content
      ~|g2c> content
      ~g|2c> content
      ~g2|c> content
      ~g2c|> content
    `);

    expect(await process(input)).toMatchInlineSnapshot(`
      "<p class="flexible-paragraph flexigraph-grid flexigraph-type-2 flexigraph-caution">content</p>
      <p align="left" class="flexible-paragraph flexigraph-grid flexigraph-type-2 flexigraph-caution">content</p>
      <p align="right" class="flexible-paragraph flexigraph-grid flexigraph-type-2 flexigraph-caution">content</p>
      <p align="center" class="flexible-paragraph flexigraph-grid flexigraph-type-2 flexigraph-caution">content</p>
      <p align="center" class="flexible-paragraph flexigraph-grid flexigraph-type-2 flexigraph-caution">content</p>
      <p align="center" class="flexible-paragraph flexigraph-grid flexigraph-type-2 flexigraph-caution">content</p>
      <p align="center" class="flexible-paragraph flexigraph-grid flexigraph-type-2 flexigraph-caution">content</p>
      <p align="center" class="flexible-paragraph flexigraph-grid flexigraph-type-2 flexigraph-caution">content</p>"
    `);
  });
});
