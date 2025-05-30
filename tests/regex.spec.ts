import { describe, it, expect } from "vitest";

import { REGEX } from "../src";

type Fixture = {
  input: string;
  expect: null | {
    marker: "~" | "=";
    left: ":" | undefined;
    classes: undefined | string;
    right: ":" | undefined;
  };
};

describe("remark-flexigraph regex tests", () => {
  it("REGEX_IN_BEGINNING matches or not", () => {
    const fixtures: Fixture[] = [
      {
        input: "~=>",
        expect: {
          marker: "=",
          left: undefined,
          classes: undefined,
          right: undefined,
        },
      },
      {
        input: "=~>",
        expect: {
          marker: "~",
          left: undefined,
          classes: undefined,
          right: undefined,
        },
      },
      {
        input: "=ç>",
        expect: null,
      },
      {
        input: "=_>",
        expect: null,
      },
      {
        input: "~A>",
        expect: null,
      },
      {
        input: "~dg::>",
        expect: null,
      },
      {
        input: "~:::>",
        expect: null,
      },
      {
        input: "~::|>",
        expect: null,
      },
      //********************************* */
      {
        input: "~>",
        expect: {
          marker: "~",
          left: undefined,
          classes: undefined,
          right: undefined,
        },
      },
      {
        input: "=>",
        expect: {
          marker: "=",
          left: undefined,
          classes: undefined,
          right: undefined,
        },
      },

      {
        input: "=|>",
        expect: {
          marker: "=",
          left: undefined,
          classes: "|",
          right: undefined,
        },
      },
      {
        input: "=:|>",
        expect: {
          marker: "=",
          left: ":",
          classes: "|",
          right: undefined,
        },
      },
      {
        input: "=|:>",
        expect: {
          marker: "=",
          left: undefined,
          classes: "|",
          right: ":",
        },
      },
      {
        input: "=::>",
        expect: {
          marker: "=",
          left: ":",
          classes: undefined,
          right: ":",
        },
      },
      {
        input: "=a>",
        expect: {
          marker: "=",
          left: undefined,
          classes: "a",
          right: undefined,
        },
      },
      {
        input: "=1>",
        expect: {
          marker: "=",
          left: undefined,
          classes: "1",
          right: undefined,
        },
      },
      {
        input: "~s>",
        expect: {
          marker: "~",
          left: undefined,
          classes: "s",
          right: undefined,
        },
      },
      {
        input: "~s|>",
        expect: {
          marker: "~",
          left: undefined,
          classes: "s|",
          right: undefined,
        },
      },
      {
        input: "~|s>",
        expect: {
          marker: "~",
          left: undefined,
          classes: "|s",
          right: undefined,
        },
      },
      {
        input: "~:s:>",
        expect: {
          marker: "~",
          left: ":",
          classes: "s",
          right: ":",
        },
      },
      {
        input: "~:s>",
        expect: {
          marker: "~",
          left: ":",
          classes: "s",
          right: undefined,
        },
      },
      {
        input: "~s:>",
        expect: {
          marker: "~",
          left: undefined,
          classes: "s",
          right: ":",
        },
      },

      {
        input: "~w>",
        expect: {
          marker: "~",
          left: undefined,
          classes: "w",
          right: undefined,
        },
      },
      {
        input: "~d>",
        expect: {
          marker: "~",
          left: undefined,
          classes: "d",
          right: undefined,
        },
      },
      {
        input: "~i>",
        expect: {
          marker: "~",
          left: undefined,
          classes: "i",
          right: undefined,
        },
      },
      {
        input: "~n>",
        expect: {
          marker: "~",
          left: undefined,
          classes: "n",
          right: undefined,
        },
      },
      {
        input: "~t>",
        expect: {
          marker: "~",
          left: undefined,
          classes: "t",
          right: undefined,
        },
      },

      {
        input: "~gw>",
        expect: {
          marker: "~",
          left: undefined,
          classes: "gw",
          right: undefined,
        },
      },
      {
        input: "~gw:>",
        expect: {
          marker: "~",
          left: undefined,
          classes: "gw",
          right: ":",
        },
      },
      {
        input: "~:gw>",
        expect: {
          marker: "~",
          left: ":",
          classes: "gw",
          right: undefined,
        },
      },
      {
        input: "~:gw:>",
        expect: {
          marker: "~",
          left: ":",
          classes: "gw",
          right: ":",
        },
      },
      {
        input: "~|gw>",
        expect: {
          marker: "~",
          left: undefined,
          classes: "|gw",
          right: undefined,
        },
      },
      {
        input: "~g|w>",
        expect: {
          marker: "~",
          left: undefined,
          classes: "g|w",
          right: undefined,
        },
      },
      {
        input: "~gw|>",
        expect: {
          marker: "~",
          left: undefined,
          classes: "gw|",
          right: undefined,
        },
      },

      {
        input: "=:g2c>",
        expect: {
          marker: "=",
          left: ":",
          classes: "g2c",
          right: undefined,
        },
      },
      {
        input: "=g2c:>",
        expect: {
          marker: "=",
          left: undefined,
          classes: "g2c",
          right: ":",
        },
      },
      {
        input: "=:g2c:>",
        expect: {
          marker: "=",
          left: ":",
          classes: "g2c",
          right: ":",
        },
      },
      {
        input: "=|g2c>",
        expect: {
          marker: "=",
          left: undefined,
          classes: "|g2c",
          right: undefined,
        },
      },
      {
        input: "=g|2c>",
        expect: {
          marker: "=",
          left: undefined,
          classes: "g|2c",
          right: undefined,
        },
      },
      {
        input: "=g2|c>",
        expect: {
          marker: "=",
          left: undefined,
          classes: "g2|c",
          right: undefined,
        },
      },
      {
        input: "=g2c|>",
        expect: {
          marker: "=",
          left: undefined,
          classes: "g2c|",
          right: undefined,
        },
      },
      {
        input: "~w:>",
        expect: {
          marker: "~",
          left: undefined,
          classes: "w",
          right: ":",
        },
      },
    ];

    fixtures.forEach((fixture) => {
      // console.log(fixture.input);

      const match = fixture.input.match(REGEX);

      if (fixture.expect === null) {
        expect(match).toBeNull();
      } else {
        expect(match).not.toBeNull();
      }

      if (match) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const [_, marker, left, classes, right] = match;

        expect(marker).toBe(fixture.expect?.marker);
        expect(left).toBe(fixture.expect?.left);
        expect(classes).toBe(fixture.expect?.classes);
        expect(right).toBe(fixture.expect?.right);
      }
    });
  });
});
