import { unified } from "unified";
import remarkParse from "remark-parse";
import gfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeFormat from "rehype-format";
import rehypeStringify from "rehype-stringify";
import type { VFileCompatible, Value } from "vfile";

import plugin, { FlexibleParagraphOptions } from "../../src";

const compilerCreator = (options?: FlexibleParagraphOptions) =>
  unified()
    .use(remarkParse)
    .use(gfm)
    .use(plugin, options)
    .use(remarkRehype)
    .use(rehypeFormat)
    .use(rehypeStringify);

export const process = async (
  content: VFileCompatible,
  options?: FlexibleParagraphOptions,
): Promise<Value> => {
  const vFile = await compilerCreator(options).process(content);

  return String(vFile.value);
};
