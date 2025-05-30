import { describe, it, expect } from "vitest";
import dedent from "dedent";

import { type FlexibleParagraphOptions } from "../src";
import { process } from "./util/index";

const options: FlexibleParagraphOptions = {
  dictionary: {
    s: "solid",
  },
  paragraphClassName: "custom-paragraph",
  paragraphProperties(alignment, classifications) {
    return {
      title: classifications,
      dummy: "", // shouldn't be added
      empty: [], // shouldn't be added
      className: undefined, // shouldn't be taken account
    };
  },
  paragraphClassificationPrefix: "paraflex",
  wrapperTagName: "section",
  wrapperClassName: "custom-paragraph-wrapper",
  wrapperProperties(alignment, classifications) {
    return {
      ["data-alignment"]: alignment,
      ["data-classifications"]: classifications,
      dummy: "", // shouldn't be added
      empty: [], // shouldn't be added
      className: undefined, // shouldn't be taken account
    };
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
