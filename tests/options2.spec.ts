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
    paragraphClassName: (alignment, classifications) => {
      return classifications
        ? [`remark-${classifications?.join("-")}-paragraph`, alignment ?? ""]
        : ["remark-paragraph", alignment ?? ""];
    },
    paragraphClassificationPrefix: "paraflex",
    wrapperTagName: (alignment, classifications) => {
      return classifications?.includes("alert") ? "alert" : "div";
    },
    wrapperClassName: (alignment, classifications) => {
      return classifications
        ? [`remark-${classifications?.join("-")}-wrapper`]
        : ["remark-wrapper"];
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
      <p class="remark--paragraph">Standard flexible paragraph</p>
      <alert class="remark-alert-wrapper">
        <p class="remark-alert-paragraph justify" style="text-align:justify">Alert paragraph justified in a wrapper</p>
      </alert>
      <p class="remark-solid-paragraph left" style="text-align:left">Success paragraph aligned left</p>
      <div class="remark--wrapper">
        <p class="remark--paragraph center" style="text-align:center">Centered paragraph in a wrapper</p>
      </div>
      "
    `);
  });
});
