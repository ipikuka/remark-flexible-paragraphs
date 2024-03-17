import dedent from "dedent";

import { process } from "./util/index";

describe("no options - fail", () => {
  // ******************************************
  it("bad usage", async () => {
    const input = dedent`
      -> content

      =_> content
      =ç> content
      =A> content

      =dg::> content
      =::dg> content

      =:::> content
      =::|> content
      =|::> content
    `;

    expect(await process(input)).toMatchInlineSnapshot(`
      "
      <p>-> content</p>
      <p>
        =_> content
        =ç> content
        =A> content
      </p>
      <p>
        =dg::> content
        =::dg> content
      </p>
      <p>
        =:::> content
        =::|> content
        =|::> content
      </p>
      "
    `);
  });
});

describe("no options - success", () => {
  // ******************************************
  it("standart usage without classification and alignment", async () => {
    const input = dedent(`
      => standard
    `);

    expect(await process(input)).toMatchInlineSnapshot(`
      "
      <div class="flexible-paragraph-wrapper">
        <p class="flexible-paragraph">standard</p>
      </div>
      "
    `);
  });

  // ******************************************
  it("only catches the exact marker", async () => {
    const input = dedent`
        ==> content

        ~=> content
      `;

    expect(await process(input)).toMatchInlineSnapshot(`
      "
      <p>=</p>
      <div class="flexible-paragraph-wrapper">
        <p class="flexible-paragraph">content</p>
      </div>
      <p>~</p>
      <div class="flexible-paragraph-wrapper">
        <p class="flexible-paragraph">content</p>
      </div>
      "
    `);
  });

  // ******************************************
  it("one paragraph that starts with the marker", async () => {
    const input = dedent(`
      =:wf2:> hello
      **bold** with
      continue *italic*
    `);

    expect(await process(input)).toMatchInlineSnapshot(`
      "
      <div class="flexible-paragraph-wrapper">
        <p class="flexible-paragraph flexiparaph-warning flexiparaph-framed flexiparaph-type-2 flexiparaph-align-justify" style="text-align:justify">
          hello
          <strong>bold</strong> with
          continue <em>italic</em>
        </p>
      </div>
      "
    `);
  });

  // ******************************************
  it("one paragraph that each line turns into seperate paragraph", async () => {
    const input = dedent(`
      =w2|g> hello
      => **bold** with
      =|>continue *italic*
    `);

    expect(await process(input)).toMatchInlineSnapshot(`
      "
      <div class="flexible-paragraph-wrapper">
        <p class="flexible-paragraph flexiparaph-warning flexiparaph-type-2 flexiparaph-green flexiparaph-align-center" style="text-align:center">hello</p>
      </div>
      <div class="flexible-paragraph-wrapper">
        <p class="flexible-paragraph"><strong>bold</strong> with</p>
      </div>
      <div class="flexible-paragraph-wrapper">
        <p class="flexible-paragraph flexiparaph-align-center" style="text-align:center">continue <em>italic</em></p>
      </div>
      "
    `);
  });

  // ******************************************
  it("one paragraph that multiple lines turn into seperate paragraph ", async () => {
    const input = dedent(`
      =w:> hello
      **bold** with
      =:w> xxx
      continue *italic*
      => yyy
    `);

    expect(await process(input)).toMatchInlineSnapshot(`
      "
      <div class="flexible-paragraph-wrapper">
        <p class="flexible-paragraph flexiparaph-warning flexiparaph-align-right" style="text-align:right">
          hello
          <strong>bold</strong> with
        </p>
      </div>
      <div class="flexible-paragraph-wrapper">
        <p class="flexible-paragraph flexiparaph-warning flexiparaph-align-left" style="text-align:left">
          xxx
          continue <em>italic</em>
        </p>
      </div>
      <div class="flexible-paragraph-wrapper">
        <p class="flexible-paragraph">yyy</p>
      </div>
      "
    `);
  });

  // ******************************************
  it("more paragraph, some markers are in the middle", async () => {
    const input = dedent(`
      **bold** with
      =w:> hello warning
      =:s> xxx

      continue *italic*

      *italic*
      =::> yyy **bold**
      aaa *italic*

      *italic* continue

      *italic* content
      =:0:> zzz
      *italic*
    `);

    expect(await process(input)).toMatchInlineSnapshot(`
      "
      <p><strong>bold</strong> with</p>
      <div class="flexible-paragraph-wrapper">
        <p class="flexible-paragraph flexiparaph-warning flexiparaph-align-right" style="text-align:right">hello warning</p>
      </div>
      <div class="flexible-paragraph-wrapper">
        <p class="flexible-paragraph flexiparaph-success flexiparaph-align-left" style="text-align:left">xxx</p>
      </div>
      <p>continue <em>italic</em></p>
      <p><em>italic</em></p>
      <div class="flexible-paragraph-wrapper">
        <p class="flexible-paragraph flexiparaph-align-justify" style="text-align:justify">
          yyy <strong>bold</strong>
          aaa <em>italic</em>
        </p>
      </div>
      <p><em>italic</em> continue</p>
      <p><em>italic</em> content</p>
      <div class="flexible-paragraph-wrapper">
        <p class="flexible-paragraph flexiparaph-type-0 flexiparaph-align-justify" style="text-align:justify">
          zzz
          <em>italic</em>
        </p>
      </div>
      "
    `);
  });

  // ******************************************
  it("more paragraph, some markers are in the middle in the texts", async () => {
    const input = dedent(`
      another paragraph

      abc *italic* =w|> hello
      =:s> aaa **strong** bbb =>
      ccc
      =|> yyy
      =0:> zzz

      **another paragraph**
    `);

    expect(await process(input)).toMatchInlineSnapshot(`
      "
      <p>another paragraph</p>
      <p>abc <em>italic</em></p>
      <div class="flexible-paragraph-wrapper">
        <p class="flexible-paragraph flexiparaph-warning flexiparaph-align-center" style="text-align:center">hello</p>
      </div>
      <div class="flexible-paragraph-wrapper">
        <p class="flexible-paragraph flexiparaph-success flexiparaph-align-left" style="text-align:left">aaa <strong>strong</strong> bbb</p>
      </div>
      <div class="flexible-paragraph-wrapper">
        <p class="flexible-paragraph">ccc</p>
      </div>
      <div class="flexible-paragraph-wrapper">
        <p class="flexible-paragraph flexiparaph-align-center" style="text-align:center">yyy</p>
      </div>
      <div class="flexible-paragraph-wrapper">
        <p class="flexible-paragraph flexiparaph-type-0 flexiparaph-align-right" style="text-align:right">zzz</p>
      </div>
      <p><strong>another paragraph</strong></p>
      "
    `);
  });

  // ******************************************
  it("alignment", async () => {
    const input = dedent(`
      =|> content
      =:> content
      =:|> content
      =|:> content
      =:|:> content
      =::> content
    `);

    expect(await process(input)).toMatchInlineSnapshot(`
      "
      <div class="flexible-paragraph-wrapper">
        <p class="flexible-paragraph flexiparaph-align-center" style="text-align:center">content</p>
      </div>
      <div class="flexible-paragraph-wrapper">
        <p class="flexible-paragraph flexiparaph-align-left" style="text-align:left">content</p>
      </div>
      <div class="flexible-paragraph-wrapper">
        <p class="flexible-paragraph flexiparaph-align-left" style="text-align:left">content</p>
      </div>
      <div class="flexible-paragraph-wrapper">
        <p class="flexible-paragraph flexiparaph-align-right" style="text-align:right">content</p>
      </div>
      <div class="flexible-paragraph-wrapper">
        <p class="flexible-paragraph flexiparaph-align-justify" style="text-align:justify">content</p>
      </div>
      <div class="flexible-paragraph-wrapper">
        <p class="flexible-paragraph flexiparaph-align-justify" style="text-align:justify">content</p>
      </div>
      "
    `);
  });

  // ******************************************
  it("one classification", async () => {
    const input = dedent(`
      =s> content
      =:s> content
      =s:> content
      =:s:> content
      =s|> content
      =|s> content
    `);

    expect(await process(input)).toMatchInlineSnapshot(`
      "
      <div class="flexible-paragraph-wrapper">
        <p class="flexible-paragraph flexiparaph-success">content</p>
      </div>
      <div class="flexible-paragraph-wrapper">
        <p class="flexible-paragraph flexiparaph-success flexiparaph-align-left" style="text-align:left">content</p>
      </div>
      <div class="flexible-paragraph-wrapper">
        <p class="flexible-paragraph flexiparaph-success flexiparaph-align-right" style="text-align:right">content</p>
      </div>
      <div class="flexible-paragraph-wrapper">
        <p class="flexible-paragraph flexiparaph-success flexiparaph-align-justify" style="text-align:justify">content</p>
      </div>
      <div class="flexible-paragraph-wrapper">
        <p class="flexible-paragraph flexiparaph-success flexiparaph-align-center" style="text-align:center">content</p>
      </div>
      <div class="flexible-paragraph-wrapper">
        <p class="flexible-paragraph flexiparaph-success flexiparaph-align-center" style="text-align:center">content</p>
      </div>
      "
    `);
  });

  // ******************************************
  it("different classifications", async () => {
    const input = dedent(`
      =w> classified as "warning"
      =d> classified as "danger"
      =i> classified as "info"
      =n> classified as "note"
      =t> classified as "tip"
    `);

    expect(await process(input)).toMatchInlineSnapshot(`
      "
      <div class="flexible-paragraph-wrapper">
        <p class="flexible-paragraph flexiparaph-warning">classified as "warning"</p>
      </div>
      <div class="flexible-paragraph-wrapper">
        <p class="flexible-paragraph flexiparaph-danger">classified as "danger"</p>
      </div>
      <div class="flexible-paragraph-wrapper">
        <p class="flexible-paragraph flexiparaph-info">classified as "info"</p>
      </div>
      <div class="flexible-paragraph-wrapper">
        <p class="flexible-paragraph flexiparaph-note">classified as "note"</p>
      </div>
      <div class="flexible-paragraph-wrapper">
        <p class="flexible-paragraph flexiparaph-tip">classified as "tip"</p>
      </div>
      "
    `);
  });

  // ******************************************
  it("two classification", async () => {
    const input = dedent(`
      =gw> content
      =:gw> content
      =gw:> content
      =:gw:> content
      =|gw> content
      =g|w> content
      =gw|> content
    `);

    expect(await process(input)).toMatchInlineSnapshot(`
      "
      <div class="flexible-paragraph-wrapper">
        <p class="flexible-paragraph flexiparaph-green flexiparaph-warning">content</p>
      </div>
      <div class="flexible-paragraph-wrapper">
        <p class="flexible-paragraph flexiparaph-green flexiparaph-warning flexiparaph-align-left" style="text-align:left">content</p>
      </div>
      <div class="flexible-paragraph-wrapper">
        <p class="flexible-paragraph flexiparaph-green flexiparaph-warning flexiparaph-align-right" style="text-align:right">content</p>
      </div>
      <div class="flexible-paragraph-wrapper">
        <p class="flexible-paragraph flexiparaph-green flexiparaph-warning flexiparaph-align-justify" style="text-align:justify">content</p>
      </div>
      <div class="flexible-paragraph-wrapper">
        <p class="flexible-paragraph flexiparaph-green flexiparaph-warning flexiparaph-align-center" style="text-align:center">content</p>
      </div>
      <div class="flexible-paragraph-wrapper">
        <p class="flexible-paragraph flexiparaph-green flexiparaph-warning flexiparaph-align-center" style="text-align:center">content</p>
      </div>
      <div class="flexible-paragraph-wrapper">
        <p class="flexible-paragraph flexiparaph-green flexiparaph-warning flexiparaph-align-center" style="text-align:center">content</p>
      </div>
      "
    `);
  });

  // ******************************************
  it("three classification", async () => {
    const input = dedent(`
      =g2c> content
      =:g2c> content
      =g2c:> content
      =:g2c:> content
      =|g2c> content
      =g|2c> content
      =g2|c> content
      =g2c|> content
    `);

    expect(await process(input)).toMatchInlineSnapshot(`
      "
      <div class="flexible-paragraph-wrapper">
        <p class="flexible-paragraph flexiparaph-green flexiparaph-type-2 flexiparaph-caution">content</p>
      </div>
      <div class="flexible-paragraph-wrapper">
        <p class="flexible-paragraph flexiparaph-green flexiparaph-type-2 flexiparaph-caution flexiparaph-align-left" style="text-align:left">content</p>
      </div>
      <div class="flexible-paragraph-wrapper">
        <p class="flexible-paragraph flexiparaph-green flexiparaph-type-2 flexiparaph-caution flexiparaph-align-right" style="text-align:right">content</p>
      </div>
      <div class="flexible-paragraph-wrapper">
        <p class="flexible-paragraph flexiparaph-green flexiparaph-type-2 flexiparaph-caution flexiparaph-align-justify" style="text-align:justify">content</p>
      </div>
      <div class="flexible-paragraph-wrapper">
        <p class="flexible-paragraph flexiparaph-green flexiparaph-type-2 flexiparaph-caution flexiparaph-align-center" style="text-align:center">content</p>
      </div>
      <div class="flexible-paragraph-wrapper">
        <p class="flexible-paragraph flexiparaph-green flexiparaph-type-2 flexiparaph-caution flexiparaph-align-center" style="text-align:center">content</p>
      </div>
      <div class="flexible-paragraph-wrapper">
        <p class="flexible-paragraph flexiparaph-green flexiparaph-type-2 flexiparaph-caution flexiparaph-align-center" style="text-align:center">content</p>
      </div>
      <div class="flexible-paragraph-wrapper">
        <p class="flexible-paragraph flexiparaph-green flexiparaph-type-2 flexiparaph-caution flexiparaph-align-center" style="text-align:center">content</p>
      </div>
      "
    `);
  });

  // ******************************************
  it("Example in README", async () => {
    const input = dedent(`
      ~> Standard flexible paragraph
      =:a:> Alert paragraph justified in a wrapper
      ~:s> Success paragraph aligned left
      =|> Centered paragraph in a wrapper
    `);

    expect(await process(input)).toMatchInlineSnapshot(`
      "
      <p class="flexible-paragraph">Standard flexible paragraph</p>
      <div class="flexible-paragraph-wrapper">
        <p class="flexible-paragraph flexiparaph-alert flexiparaph-align-justify" style="text-align:justify">Alert paragraph justified in a wrapper</p>
      </div>
      <p class="flexible-paragraph flexiparaph-success flexiparaph-align-left" style="text-align:left">Success paragraph aligned left</p>
      <div class="flexible-paragraph-wrapper">
        <p class="flexible-paragraph flexiparaph-align-center" style="text-align:center">Centered paragraph in a wrapper</p>
      </div>
      "
    `);
  });
});
