import fs from "fs";
import path from "path";
import { marked } from "marked";
import type { Tokens } from "marked";

type TokenList = Tokens.Generic[];

/**
 * Reads Markdown blog posts and returns a sanitized token list.
 */
export async function getBlogPostContent(slug: string): Promise<TokenList> {
  const contentDir = path.join(process.cwd(), "src/content/blog");
  const filePath = path.join(contentDir, `${slug}.md`);

  try {
    const fileContent = fs.readFileSync(filePath, "utf-8");
    return marked.lexer(fileContent);
  } catch (error) {
    console.error(`Error reading blog post: ${slug}`, error);
    return [];
  }
}
