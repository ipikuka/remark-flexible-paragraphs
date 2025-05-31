import { visit, EXIT, type Visitor, type VisitorResult } from "unist-util-visit";
import type { Plugin, Transformer } from "unified";
import type { Data, Node, Paragraph, Parent, PhrasingContent, Root, Text } from "mdast";
import { u } from "unist-builder";

type Prettify<T> = { [K in keyof T]: T[K] } & {};

type PartiallyRequired<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface WrapperData extends Data {}

interface Wrapper extends Parent {
  /**
   * Node type of mdast Mark.
   */
  type: "wrapper";
  /**
   * Children of paragraph.
   */
  children: [Paragraph];
  /**
   * Data associated with the mdast paragraph.
   */
  data?: WrapperData | undefined;
}

declare module "mdast" {
  interface RootContentMap {
    wrapper: Wrapper;
  }
}

type Alignment = "center" | "left" | "right" | "justify";
type Kind = "wrapper" | "paragraph";

type FlexibleNode = {
  type: Kind;
  alignment?: Alignment;
  classifications: string[];
};

// satisfies the regex [a-z0-9]
type Key =
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

type Dictionary = Partial<Record<Key, string>>;

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
  j: "jumbo",
  k: "kindle",
  l: "lokum",
  m: "menu",
  n: "note",
  o: "ordinary",
  p: "pack",
  q: "quantity",
  r: "red",
  s: "success",
  t: "tip",
  u: "unified",
  v: "verticle",
  w: "warning",
  x: "xray",
  y: "yellow",
  z: "zigzag",
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

type RestrictedRecord = Record<string, unknown> & { className?: never };
type TagNameFunction = (alignment?: Alignment, classifications?: string[]) => string;
type ClassNameFunction = (alignment?: Alignment, classifications?: string[]) => string[];
type PropertyFunction = (alignment?: Alignment, classifications?: string[]) => RestrictedRecord;

export type FlexibleParagraphOptions = {
  dictionary?: Dictionary;
  paragraphClassName?: string | ClassNameFunction;
  paragraphProperties?: PropertyFunction;
  paragraphClassificationPrefix?: string;
  wrapperTagName?: string | TagNameFunction;
  wrapperClassName?: string | ClassNameFunction;
  wrapperProperties?: PropertyFunction;
};

const DEFAULT_SETTINGS: FlexibleParagraphOptions = {
  dictionary,
  paragraphClassName: "flexible-paragraph",
  paragraphClassificationPrefix: "flexiparaph",
  wrapperTagName: "div",
  wrapperClassName: "flexible-paragraph-wrapper",
};

type PartiallyRequiredFlexibleParagraphOptions = Prettify<
  PartiallyRequired<
    FlexibleParagraphOptions,
    | "dictionary"
    | "paragraphClassName"
    | "paragraphClassificationPrefix"
    | "wrapperTagName"
    | "wrapperClassName"
  >
>;

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
  const settings = Object.assign(
    {},
    DEFAULT_SETTINGS,
    options,
  ) as PartiallyRequiredFlexibleParagraphOptions;

  if (options?.dictionary && Object.keys(options.dictionary).length) {
    settings.dictionary = Object.assign({}, dictionary, options.dictionary);
  }

  /**
   *
   * constracts the paragraph node
   *
   */
  const constructParagraph = (
    phrasingContents: PhrasingContent[],
    classifications: string[],
    alignment?: Alignment,
  ): Paragraph => {
    const classnames: string[] = [];

    classifications.forEach((classification) => {
      classnames.push(
        settings.paragraphClassificationPrefix === ""
          ? `${classification}`
          : `${settings.paragraphClassificationPrefix}-${classification}`,
      );
    });

    if (alignment) {
      classnames.push(
        settings.paragraphClassificationPrefix === ""
          ? `align-${alignment}`
          : `${settings.paragraphClassificationPrefix}-align-${alignment}`,
      );
    }

    const paragraphClassName =
      typeof settings.paragraphClassName === "function"
        ? settings.paragraphClassName(alignment, classifications)
        : [settings.paragraphClassName, ...classnames];

    let properties: Record<string, unknown> | undefined;

    if (settings.paragraphProperties) {
      properties = settings.paragraphProperties(alignment, classifications);

      Object.entries(properties).forEach(([k, v]) => {
        if (
          (typeof v === "string" && v === "") ||
          (Array.isArray(v) && (v as unknown[]).length === 0)
        ) {
          if (properties) {
            properties[k] = undefined;
          }
        }

        if (k === "className") delete properties?.["className"];
      });
    }

    return {
      type: "paragraph",
      children: phrasingContents,
      data: {
        hName: "p",
        hProperties: {
          className: paragraphClassName,
          ...(properties && { ...properties }),
          style: alignment ? `text-align:${alignment}` : undefined,
        },
      },
    };
  };

  /**
   *
   * constracts the wrapper node
   *
   */
  const constructWrapper = (
    paragraph: Paragraph,
    classifications: string[],
    alignment?: Alignment,
  ): Wrapper => {
    const wrapperTagName =
      typeof settings.wrapperTagName === "string"
        ? settings.wrapperTagName
        : settings.wrapperTagName(alignment, classifications);

    const wrapperClassName =
      typeof settings.wrapperClassName === "function"
        ? settings.wrapperClassName(alignment, classifications)
        : [settings.wrapperClassName];

    let properties: Record<string, unknown> | undefined;

    if (settings.wrapperProperties) {
      properties = settings.wrapperProperties(alignment, classifications);

      Object.entries(properties).forEach(([k, v]) => {
        if (
          (typeof v === "string" && v === "") ||
          (Array.isArray(v) && (v as unknown[]).length === 0)
        ) {
          if (properties) {
            properties[k] = undefined;
          }
        }

        if (k === "className") delete properties?.["className"];
      });
    }

    return {
      type: "wrapper",
      children: [paragraph],
      data: {
        hName: wrapperTagName,
        hProperties: {
          className: wrapperClassName,
          ...(properties && { ...properties }),
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
    const classifications = classes
      ? Array.from(classes).reduce((list, char) => {
          if (char !== "|") {
            const name = settings.dictionary[char as Key];
            if (name) list.push(name);
          }
          return list;
        }, [] as string[])
      : [];

    return { type, alignment, classifications };
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
   * visits the Paragraph nodes
   *
   */
  const visitor: Visitor<Paragraph, Parent> = function (node, index, parent): VisitorResult {
    /* v8 ignore next */
    if (!parent || typeof index === "undefined") return;

    const isTarget = checkIsTarget(node);

    if (!isTarget) return;

    const nodes: Array<Paragraph | Wrapper> = [];
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

            const [matched, marker, left, classes, right] = match;
            const mIndex = match.index;
            const mLength = matched.length;

            // if it is the first match but the marker index is not first
            if (idx === 0 && mIndex !== 0) {
              const textValue = value.substring(0, mIndex);

              if (textValue) {
                const text = u("text", textValue) as Text;
                phrasesMatrix[matrixIndex] = insert(phrasesMatrix[matrixIndex], text);
              }
            }

            // do not increase matrixIndex if the marker is in the first phrase in the beginning
            if (idx !== 0 || mIndex !== 0) matrixIndex++;

            const textValue =
              idx === matches.length - 1
                ? // if it is the last match
                  value.slice(mIndex + mLength)
                : // if it is NOT the last match
                  value.substring(mIndex + mLength, matches[idx + 1].index);

            if (textValue) {
              const text = u("text", textValue) as Text;
              phrasesMatrix[matrixIndex] = insert(phrasesMatrix[matrixIndex], text);
            }

            flexibleNodes[matrixIndex] = getFlexibleNode({
              marker, // "=" or "~"
              left,
              classes,
              right,
            });
          }
        }
      }
    }

    // clean the newline and spaces at the last phrases (if Text) of each flexible paragraph
    phrasesMatrix.forEach((phrasingContents) => {
      const lastPhrase = phrasingContents[phrasingContents.length - 1];
      if (lastPhrase.type === "text") {
        lastPhrase.value = lastPhrase.value.replace(/[\s\r\n]+$/, "");
      }
    });

    // construct the flexible paragraphs whether in a wrapper or not
    phrasesMatrix.forEach((phrasingContents, i) => {
      const paragraph = flexibleNodes[i]
        ? constructParagraph(
            phrasingContents,
            flexibleNodes[i].classifications,
            flexibleNodes[i].alignment,
          )
        : (u("paragraph", phrasingContents) as Paragraph);

      if (flexibleNodes[i]?.type === "wrapper") {
        const wrapper = constructWrapper(
          paragraph,
          flexibleNodes[i].classifications,
          flexibleNodes[i].alignment,
        );

        nodes.push(wrapper);
      } else {
        nodes.push(paragraph);
      }
    });

    if (nodes.length) parent.children.splice(index, 1, ...nodes);
  };

  const transformer: Transformer<Root> = (tree) => {
    visit(tree, "paragraph", visitor);
  };

  return transformer;
};

export default plugin;
