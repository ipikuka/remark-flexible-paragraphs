import { describe, it, expect } from "vitest";
import dedent from "dedent";

import { type FlexibleParagraphOptions } from "../src";
import { process } from "./util/index";

const options: FlexibleParagraphOptions = {
  dictionary: {
    s: "solid",
  },
  paragraphClassName: (alignment, classifications) => {
    return classifications && classifications.length
      ? [`remark-${classifications?.join("-")}-paragraph`, alignment ?? ""]
      : ["remark-paragraph", alignment ?? ""];
  },
  paragraphClassificationPrefix: "",
  wrapperTagName: (alignment, classifications) => {
    return classifications?.includes("alert") ? "alert" : "div";
  },
  wrapperClassName: (alignment, classifications) => {
    return classifications && classifications.length
      ? [`remark-${classifications?.join("-")}-wrapper`]
      : ["remark-wrapper"];
  },
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

    expect(await process(input, options)).toMatchInlineSnapshot(`
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

    expect(await process(input, options)).toMatchInlineSnapshot(`
      "
      <p class="remark-paragraph">Standard flexible paragraph</p>
      <alert class="remark-alert-wrapper">
        <p class="remark-alert-paragraph justify" style="text-align:justify">Alert paragraph justified in a wrapper</p>
      </alert>
      <p class="remark-solid-paragraph left" style="text-align:left">Success paragraph aligned left</p>
      <div class="remark-wrapper">
        <p class="remark-paragraph center" style="text-align:center">Centered paragraph in a wrapper</p>
      </div>
      "
    `);
  });
});
