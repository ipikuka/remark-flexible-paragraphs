import { visit, EXIT, type Visitor, type VisitorResult } from "unist-util-visit";
import type { Plugin, Transformer } from "unified";
import type { Node, Parent } from "unist";
import type { Paragraph, PhrasingContent, Root, Text } from "mdast";
import { u } from "unist-builder";

type Alignment = "center" | "left" | "right" | "justify";
type Kind = "wrapper" | "paragraph";

type FlexibleNode = {
  type: Kind;
  alignment?: Alignment;
  classNames?: string[];
};

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

type PropertyFunction = (
  alignment?: Alignment,
  classifications?: string[],
) => Record<string, unknown>;

export type FlexibleParagraphOptions = {
  dictionary?: Dictionary;
  paragraphClassName?: string;
  paragraphClassificationPrefix?: string;
  wrapperTagName?: string;
  wrapperClassName?: string;
  wrapperProperties?: PropertyFunction;
};

const DEFAULT_SETTINGS: FlexibleParagraphOptions = {
  dictionary,
  paragraphClassName: "flexible-paragraph",
  paragraphClassificationPrefix: "flexiparaph",
  wrapperTagName: "div",
  wrapperClassName: "flexible-paragraph-wrapper",
  wrapperProperties: undefined,
};

export const REGEX = /([~=])(:)?([a-z0-9]*\|?[a-z0-9]*)?(:)?>\s*/;
export const REGEX_GLOBAL = /([~=])(:)?([a-z0-9]*\|?[a-z0-9]*)?(:)?>\s*/g;

/**
 *
 * This plugin turns a paragraph into a flexible paragraph or splits it as a flexible paragraph,
 * with optional wrapper, customizable classifications and customizable alignment
 *
 * for example:
 *
 * ~> I am a flexible paragraph
 * => I am a flexible paragraph wrapped in a div
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
    alignment?: Alignment,
    classNames?: string[],
  ): Parent => {
    const classifications: string[] = [];

    // extract the classifications from the className array
    classNames?.forEach((className, i) => {
      // it is assumed that the first className is the pragraph className which is not a classification
      if (i !== 0) {
        if (settings.paragraphClassificationPrefix) {
          classifications.push(
            className.slice(settings.paragraphClassificationPrefix.length + 1),
          ); // +1 for the dash
        } else {
          classifications.push(className);
        }
      }
    });

    let _properties: Record<string, unknown> | undefined;

    if (settings.wrapperProperties) {
      _properties = settings.wrapperProperties(alignment, classifications);

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
  function getFlexibleNode({
    marker,
    left,
    classes,
    right,
  }: {
    marker?: string;
    left?: string;
    classes?: string;
    right?: string;
  }): FlexibleNode {
    let _alignment: Alignment | undefined;

    if (!left && !right) {
      _alignment = undefined;
    } else if (left && right) {
      _alignment = "justify";
    } else if (left) {
      _alignment = "left";
    } else if (right) {
      _alignment = "right";
    }

    if (classes?.includes("|")) {
      _alignment = "center";
    }

    if (classes === "|") {
      if (left && right) {
        _alignment = "justify";
      } else if (left) {
        _alignment = "left";
      } else if (right) {
        _alignment = "right";
      }
    }

    const markers = {
      "=": "wrapper",
      "~": "paragraph",
    } as const;

    const type = markers[marker as keyof typeof markers];
    const alignment = _alignment;
    const classNames = settings.paragraphClassName ? [settings.paragraphClassName] : [];

    if (classes) {
      Array.from(classes).forEach((char) => {
        if (char !== "|") {
          const name = settings.dictionary?.[char as Keys];

          if (name) {
            classNames?.push(`${settings.paragraphClassificationPrefix!}-${name}`);
          }
        }
      });
    }

    return { type, alignment, classNames };
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

    const nodes: Array<Paragraph | Parent> = [];
    const phrasesMatrix: PhrasingContent[][] = [[]];
    const flexibleNodes: FlexibleNode[] = [];
    let matrixIndex = 0;

    // traverse the paragraph looking for the markers
    for (const phrasingContent of node.children) {
      if (!isTextNode(phrasingContent)) {
        phrasesMatrix[matrixIndex] = insert(phrasesMatrix[matrixIndex], phrasingContent);
      } else {
        const value = phrasingContent.value;

        // console.log("value: ", JSON.stringify(value));
        // console.log(Array.from(value.matchAll(REGEX_GLOBAL), (m) => m[0]));

        const matches = Array.from(value.matchAll(REGEX_GLOBAL));

        if (!matches.length) {
          phrasesMatrix[matrixIndex] = insert(phrasesMatrix[matrixIndex], phrasingContent);
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
                phrasesMatrix[matrixIndex] = insert(phrasesMatrix[matrixIndex], text);
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
              phrasesMatrix[matrixIndex] = insert(phrasesMatrix[matrixIndex], text);
            }

            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const [input, marker, left, classes, right] = match;

            flexibleNodes[matrixIndex] = getFlexibleNode({
              marker,
              left,
              classes,
              right,
            });
          }
        }
      }
    }

    phrasesMatrix.forEach((phrasingContents, i) => {
      // clean the newline and spaces at the last phrase (if Text)
      const lastPhrase = phrasingContents[phrasingContents.length - 1];
      if (lastPhrase.type === "text") {
        lastPhrase.value = lastPhrase.value.replace(/[\s\r\n]+$/, "");
      }

      const paragraph = u("paragraph", phrasingContents) as Paragraph;

      if (flexibleNodes[i]) {
        const classNames: string[] = [];

        flexibleNodes[i].classNames?.forEach((className) => {
          classNames.push(className);
        });

        const alignmentClassName = flexibleNodes[i].alignment
          ? settings.paragraphClassificationPrefix
            ? `${settings.paragraphClassificationPrefix}-align-${flexibleNodes[i].alignment}`
            : `align-${flexibleNodes[i].alignment}`
          : undefined;

        if (alignmentClassName) classNames.push(alignmentClassName);

        paragraph.data = {
          hProperties: {
            className: classNames,
            style: flexibleNodes[i].alignment
              ? `text-align:${flexibleNodes[i].alignment}`
              : undefined,
          },
        };
      }

      if (flexibleNodes[i]?.type === "wrapper") {
        const wrapper = constructWrapper(
          paragraph,
          flexibleNodes[i].alignment,
          flexibleNodes[i].classNames,
        );

        nodes.push(wrapper);
      } else {
        nodes.push(paragraph);
      }
    });

    if (nodes.length) parent.children.splice(index!, 1, ...nodes);
  };

  const transformer: Transformer<Root> = (tree) => {
    visit(tree, "paragraph", visitor);
  };

  return transformer;
};

export default plugin;
