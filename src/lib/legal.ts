import fs from "fs";
import path from "path";
import { marked } from "marked";

/**
 * Reads and parses legal document content from markdown files
 */
export async function getLegalContent(page: string): Promise<string> {
  const contentDir = path.join(process.cwd(), "src/content/legal");
  const filePath = path.join(contentDir, `${page}.md`);

  try {
    const fileContent = fs.readFileSync(filePath, "utf-8");
    const htmlContent = await marked(fileContent);
    return htmlContent;
  } catch (error) {
    console.error(`Error reading legal page: ${page}`, error);
    return "";
  }
}
