import { visit, EXIT, type Visitor, type VisitorResult } from "unist-util-visit";
import type { Plugin, Transformer } from "unified";
import type { Node, Parent } from "unist";
import type { Paragraph, PhrasingContent, Root, Text } from "mdast";
import { u } from "unist-builder";

type Property = {
  type: "wrapper" | "paragraph";
  properties: {
    align?: "center" | "left" | "right";
    className?: string[];
  };
};

type PhrasingContents = PhrasingContent[];

// satisfies the regex [a-z0-9]
type Keys =
  | "a"
  | "b"
  | "c"
  | "d"
  | "e"
  | "f"
  | "g"
  | "h"
  | "i"
  | "j"
  | "k"
  | "l"
  | "m"
  | "n"
  | "o"
  | "p"
  | "q"
  | "r"
  | "s"
  | "t"
  | "u"
  | "v"
  | "w"
  | "x"
  | "y"
  | "z"
  | "0"
  | "1"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9";

type Dictionary = Partial<Record<Keys, string>>;

const dictionary: Dictionary = {
  a: "alert",
  b: "boring",
  c: "caution",
  d: "danger",
  e: "error",
  f: "flex",
  g: "grid",
  h: "horizontal",
  i: "info",
  j: "justify",
  k: undefined,
  l: "left",
  m: undefined,
  n: "note",
  o: undefined,
  p: undefined,
  q: undefined,
  r: "right",
  s: "success",
  t: "tip",
  u: undefined,
  v: "verticle",
  w: "warning",
  x: undefined,
  y: undefined,
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

type TPropertyFunction = (
  align?: "center" | "left" | "right",
  classifications?: string[],
) => Record<string, unknown>;

export type FlexibleParagraphOptions = {
  dictionary?: Dictionary;
  paragraphClassName?: string;
  paragraphClassificationPrefix?: string;
  wrapperTagName?: string;
  wrapperClassName?: string;
  wrapperProperties?: TPropertyFunction;
};

const DEFAULT_SETTINGS: FlexibleParagraphOptions = {
  dictionary,
  paragraphClassName: "flexible-paragraph",
  paragraphClassificationPrefix: "flexigraph",
  wrapperTagName: "div",
  wrapperClassName: "flexible-paragraph-wrapper",
  wrapperProperties: undefined,
};

export const REGEX = /([~=])(:)?([a-z0-9]*\|?[a-z0-9]*)?(:)?>\s*/;
export const REGEX_GLOBAL = /([~=])(:)?([a-z0-9]*\|?[a-z0-9]*)?(:)?>\s*/g;

/**
 *
 * This plugin turns a paragraph into a flexible paragraph or splits a paragraph, with optional wrapper and customizable classifications
 *
 * for example:
 *
 * ~> with no classification and no alignment
 * => in a wrapper with no classification and no alignment
 *
 * =|> center-aligned in a wrapper with no classification
 * =:|> left-aligned in a wrapper with no classification
 * =|:> right-aligned in a wrapper with no classification
 * =::> center-aligned in a wrapper with no classification
 *
 * ~s> classified as "success" with no alignment
 * ~s|> center-aligned and classified as "success"
 * ~|s> center-aligned and classified as "success"
 * ~:s:> center-aligned and classified as "success"
 * ~:s> left-aligned and classified as "success"
 * ~s:> right-aligned and classified as "success"
 *
 * ~w> classified as "warning" with no alignment
 * ~d> classified as "danger" with no alignment
 * ~i> classified as "info" with no alignment
 * ~n> classified as "note" with no alignment
 * ~t> classified as "tip" with no alignment
 *
 * ~gw> classified as "grid" and "warning" with no alignment
 * ~gw:> right-aligned and classified as "grid" and "warning"
 * ~:gw> left-aligned and classified as "grid" and "warning"
 * ~:gw:> center-aligned and classified as "grid" and "warning"
 * ~|gw> center-aligned and classified as "grid" and "warning"
 * ~g|w> center-aligned and classified as "grid" and "warning"
 * ~gw|> center-aligned and classified as "grid" and "warning"
 *
 * =:g2c> left-aligned and classified as "grid", "type-2" and "caution" in a wrapper
 * =g2c:> right-aligned and classified as "grid", "type-2" and "caution" in a wrapper
 * =:g2c:> center-aligned and classified as "grid", "type-2" and "caution" in a wrapper
 * =|g2c> center-aligned and classified as "grid", "type-2" and "caution" in a wrapper
 * =g|2c> center-aligned and classified as "grid", "type-2" and "caution" in a wrapper
 * =g2|c> center-aligned and classified as "grid", "type-2" and "caution" in a wrapper
 * =g2c|> center-aligned and classified as "grid", "type-2" and "caution" in a wrapper
 *
 * The way of the usage (it is easy)
 * 1. choose the marker   a) "~>" for paragraph   b) "=>" for paragraph with wrapper
 * 2. put the marker "~>" or "=>" in the first column always in the beginning of the paragraph or where the flexible paragraph begins
 * 3. choose a character or characters from the dictionary [a-z0-9] (only lowercase and numbers), each has a predefined but customizable value
 * 4. put the letter(s) into middle of the marker
 * 5. it has no alignment by default, if you want to center it, use a pipe "|" or double colon "::"; the pipe "|" takes precedence
 * 6. if you want to align left or right use a colon ":" at one of the side; if colons at both sides that means center
 * 7. if there is no classification, but want to align left or right, use the colon with the pipe ":|" for left or "|:" for right
 *
 */
export const plugin: Plugin<[FlexibleParagraphOptions?], Root> = (options) => {
  const settings = Object.assign({}, DEFAULT_SETTINGS, options);

  if (options?.dictionary && Object.keys(options.dictionary).length) {
    settings.dictionary = Object.assign({}, dictionary, options.dictionary);
  }

  /**
   *
   * constracts the wrapper node
   *
   */
  const constructWrapper = (
    paragraph: Paragraph,
    properties: Property["properties"],
  ): Parent => {
    const classifications: string[] = [];

    // extract the classifications from the className array
    properties.className?.forEach((c, i) => {
      // it is assumed that the first className is the pragraph className which is not a classification
      if (i !== 0) {
        if (settings.paragraphClassificationPrefix) {
          classifications.push(c.slice(settings.paragraphClassificationPrefix.length + 1)); // +1 for the dash
        } else {
          classifications.push(c);
        }
      }
    });

    let _properties: Record<string, unknown> | undefined;

    if (settings.wrapperProperties) {
      _properties = settings.wrapperProperties(properties.align, classifications);

      Object.entries(_properties).forEach(([k, v]) => {
        if ((typeof v === "string" && v === "") || (Array.isArray(v) && v.length === 0)) {
          _properties && (_properties[k] = undefined);
        }
      });
    }

    return {
      type: "wrapper",
      children: [paragraph],
      data: {
        hName: settings.wrapperTagName,
        hProperties: {
          className: [settings.wrapperClassName],
          ...(_properties && { ..._properties }),
        },
      },
    };
  };

  /**
   *
   * checks whether the paragraph node contains a text node which has a regex match.
   *
   */
  function checkIsTarget(node: Paragraph): boolean {
    let isTarget = false;

    visit(node, "text", (textNode) => {
      if (!REGEX.test(textNode.value)) return;

      isTarget = true;
      return EXIT;
    });

    return isTarget;
  }

  /**
   *
   * returns the array with added value, handles if the array is undefined
   *
   */
  function insert(array: PhrasingContent[], phrasingContent: PhrasingContent) {
    if (typeof array === "undefined") {
      array = [phrasingContent];
    } else {
      array.push(phrasingContent);
    }

    return array;
  }

  /**
   *
   * returns the extracted info about flexible paragraph from the match
   *
   */
  function getProperties({
    dictionary,
    className,
    prefix,
    marker,
    left,
    classes,
    right,
  }: {
    dictionary?: Dictionary;
    className?: string;
    prefix?: string;
    marker?: string;
    left?: string;
    classes?: string;
    right?: string;
  }): Property {
    const markers = {
      "=": "wrapper",
      "~": "paragraph",
    } as const;

    const type: Property["type"] = markers[marker as keyof typeof markers];

    const properties: Property["properties"] = {
      align: "center",
      className: className ? [className] : [],
    };

    if (!left && !right) {
      properties.align = undefined;
    } else if (left && right) {
      properties.align = "center";
    } else if (left) {
      properties.align = "left";
    } else if (right) {
      properties.align = "right";
    }

    if (classes?.includes("|")) {
      properties.align = "center";
    }

    if (classes === "|") {
      properties.align = "center";
    } else if (classes === ":|") {
      properties.align = "left";
    } else if (classes === "|:") {
      properties.align = "right";
    }

    if (classes) {
      Array.from(classes).forEach((char) => {
        if (char !== "|") {
          const name = dictionary?.[char as Keys];

          if (name) {
            properties.className?.push(prefix ? `${prefix}-${name}` : name);
          }
        }
      });
    }

    return { type, properties };
  }

  /**
   *
   * type guard
   *
   */
  const isTextNode = (node: Node): node is Text => {
    return "value" in node && node.type === "text";
  };

  /**
   *
   * visits the paragraphs
   *
   */
  const visitor: Visitor<Paragraph> = function (node, index, parent): VisitorResult {
    if (!parent) return;

    const isTarget = checkIsTarget(node);

    if (!isTarget) return;

    const paragraphs: Array<Paragraph | Parent> = [];
    const paragraphMatrix: PhrasingContents[] = [[]];
    const propertyMatrix: Property[] = [];
    let matrixIndex = 0;

    // traverse the paragraph looking for the markers
    for (const phrasingContent of node.children) {
      if (!isTextNode(phrasingContent)) {
        paragraphMatrix[matrixIndex] = insert(paragraphMatrix[matrixIndex], phrasingContent);
      } else {
        const value = phrasingContent.value;

        // console.log("value: ", JSON.stringify(value));
        // console.log(Array.from(value.matchAll(REGEX_GLOBAL), (m) => m[0]));

        const matches = Array.from(value.matchAll(REGEX_GLOBAL));

        if (!matches.length) {
          paragraphMatrix[matrixIndex] = insert(paragraphMatrix[matrixIndex], phrasingContent);
        } else {
          for (let idx = 0; idx < matches.length; idx++) {
            const match = matches[idx];

            const mIndex = match.index ?? 0;
            const mLength = match[0].length;

            // if it is the first match but the marker index is not first
            if (idx === 0 && mIndex !== 0) {
              const textValue = value.substring(0, mIndex);

              if (textValue) {
                const text = u("text", textValue) as Text;
                paragraphMatrix[matrixIndex] = insert(paragraphMatrix[matrixIndex], text);
              }
            }

            // do not increase index if the marker is in the first phrase in the beginning
            if (idx !== 0 || mIndex !== 0) matrixIndex++;

            const textValue =
              idx === matches.length - 1
                ? // if it is the last match
                  value.slice(mIndex + mLength)
                : // if it is NOT the last match
                  value.substring(mIndex + mLength, matches[idx + 1].index);

            // console.log({ textValue });

            if (textValue) {
              const text = u("text", textValue) as Text;
              paragraphMatrix[matrixIndex] = insert(paragraphMatrix[matrixIndex], text);
            }

            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const [input, marker, left, classes, right] = match;
            propertyMatrix[matrixIndex] = getProperties({
              dictionary: settings.dictionary,
              className: settings.paragraphClassName,
              prefix: settings.paragraphClassificationPrefix,
              marker,
              left,
              classes,
              right,
            });
          }
        }
      }
    }

    // paragraphMatrix.forEach(console.log);
    // propertyMatrix.forEach(console.log);

    paragraphMatrix.forEach((phrasingContents, i) => {
      // clean the newline and spaces at the last phrase (if Text)
      const lastPhrase = phrasingContents[phrasingContents.length - 1];
      if (lastPhrase.type === "text") {
        lastPhrase.value = lastPhrase.value.replace(/[\s\r\n]+$/, "");
      }

      const paragraph = u("paragraph", phrasingContents) as Paragraph;

      if (propertyMatrix[i]) {
        paragraph.data = {
          hProperties: propertyMatrix[i].properties,
        };
      }

      if (propertyMatrix[i]?.type === "wrapper") {
        const wrapper = constructWrapper(paragraph, {
          ...propertyMatrix[i].properties,
        });

        paragraphs.push(wrapper);
      } else {
        paragraphs.push(paragraph);
      }
    });

    if (paragraphs.length) parent.children.splice(index!, 1, ...paragraphs);
  };

  const transformer: Transformer<Root> = (tree) => {
    visit(tree, "paragraph", visitor);
  };

  return transformer;
};

export default plugin;
