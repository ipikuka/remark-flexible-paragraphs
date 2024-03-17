import { unified } from "unified";
import remarkParse from "remark-parse";
import gfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeFormat from "rehype-format";
import rehypeStringify from "rehype-stringify";
import dedent from "dedent";
import type { VFileCompatible } from "vfile";

import plugin from "../src";

const compiler = unified()
  .use(remarkParse)
  .use(gfm)
  .use(plugin, {
    dictionary: {
      s: "solid",
    },
    paragraphClassName: "custom-paragraph",
    paragraphProperties(alignment, classifications) {
      return {
        title: classifications,
      };
    },
    paragraphClassificationPrefix: "paraflex",
    wrapperTagName: "section",
    wrapperClassName: "custom-paragraph-wrapper",
    wrapperProperties(alignment, classifications) {
      return {
        ["data-alignment"]: alignment,
        ["data-classifications"]: classifications,
      };
    },
  })
  .use(remarkRehype)
  .use(rehypeFormat)
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
      "
      <p>-> content</p>
      <p>
        ~_> content
        ~ç> content
        ~A> content
      </p>
      <p>
        ~dg::> content
        ~::dg> content
      </p>
      <p>
        ~:::> content
        ~::|> content
        ~|::> content
      </p>
      "
    `);
  });
});

describe("with options - success", () => {
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
      <p class="custom-paragraph">Standard flexible paragraph</p>
      <section class="custom-paragraph-wrapper" data-alignment="justify" data-classifications="alert">
        <p class="custom-paragraph paraflex-alert paraflex-align-justify" title="alert" style="text-align:justify">Alert paragraph justified in a wrapper</p>
      </section>
      <p class="custom-paragraph paraflex-solid paraflex-align-left" title="solid" style="text-align:left">Success paragraph aligned left</p>
      <section class="custom-paragraph-wrapper" data-alignment="center">
        <p class="custom-paragraph paraflex-align-center" style="text-align:center">Centered paragraph in a wrapper</p>
      </section>
      "
    `);
  });
});
