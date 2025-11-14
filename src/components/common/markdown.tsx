/* eslint-disable @next/next/no-img-element */
import React, { Fragment } from "react";
import type { ReactNode } from "react";
import type { Tokens } from "marked";

type TokenList = Tokens.Generic[];

const SAFE_PROTOCOLS = ["http:", "https:", "mailto:", "tel:"];

const INLINE_TYPES = new Set([
  "text",
  "strong",
  "em",
  "codespan",
  "link",
  "image",
  "br",
]);

function sanitizeHref(href?: string): string {
  if (!href) {
    return "#";
  }

  if (href.startsWith("#") || href.startsWith("/")) {
    return href;
  }

  for (const protocol of SAFE_PROTOCOLS.slice(2)) {
    if (href.toLowerCase().startsWith(protocol)) {
      return href;
    }
  }

  try {
    const url = new URL(href);
    if (SAFE_PROTOCOLS.includes(url.protocol)) {
      return url.toString();
    }
  } catch {
    /* noop */
  }

  return "#";
}

function sanitizeSrc(src?: string): string | undefined {
  if (!src) {
    return undefined;
  }

  if (src.startsWith("/") || src.startsWith("./")) {
    return src;
  }

  try {
    const url = new URL(src);
    if (SAFE_PROTOCOLS.includes(url.protocol)) {
      return url.toString();
    }
  } catch {
    /* noop */
  }

  return undefined;
}

function inlineTokensFrom(token: Tokens.Generic): TokenList {
  if ("tokens" in token && token.tokens) {
    return token.tokens as TokenList;
  }
  return [token];
}

function renderInline(tokens?: TokenList): ReactNode[] {
  if (!tokens) {
    return [];
  }

  return tokens
    .map((token, index) => {
      switch (token.type) {
        case "text":
          return <Fragment key={index}>{token.text}</Fragment>;
        case "strong":
          return <strong key={index}>{renderInline(inlineTokensFrom(token))}</strong>;
        case "em":
          return <em key={index}>{renderInline(inlineTokensFrom(token))}</em>;
        case "codespan":
          return <code key={index}>{token.text}</code>;
        case "link": {
          const href = sanitizeHref(token.href);
          const rel = href.startsWith("http") ? "noopener noreferrer" : undefined;
          const target = href.startsWith("http") ? "_blank" : undefined;
          return (
            <a key={index} href={href} target={target} rel={rel}>
              {renderInline(inlineTokensFrom(token))}
            </a>
          );
        }
        case "image": {
          const src = sanitizeSrc(token.href);
          if (!src) {
            return null;
          }
          return (
            <img
              key={index}
              src={src}
              alt={token.text ?? ""}
              loading="lazy"
            />
          );
        }
        case "br":
          return <br key={index} />;
        default:
          return null;
      }
    })
    .filter(Boolean) as ReactNode[];
}

function splitListItemTokens(tokens: TokenList = []): {
  inline: TokenList;
  block: TokenList;
} {
  const inline: TokenList = [];
  const block: TokenList = [];

  tokens.forEach((token) => {
    if (INLINE_TYPES.has(token.type)) {
      inline.push(token);
    } else {
      block.push(token);
    }
  });

  return { inline, block };
}

function renderTokens(tokens: TokenList): ReactNode[] {
  return tokens
    .map((token, index) => {
      switch (token.type) {
        case "space":
          return null;
        case "paragraph":
          return (
            <p key={index}>
              {renderInline(token.tokens as TokenList)}
            </p>
          );
        case "text":
          return (
            <p key={index}>
              {renderInline(inlineTokensFrom(token))}
            </p>
          );
        case "heading": {
          const HeadingTag = `h${token.depth}` as keyof React.JSX.IntrinsicElements;
          return (
            <HeadingTag key={index}>
              {renderInline(token.tokens as TokenList)}
            </HeadingTag>
          );
        }
        case "blockquote":
          return (
            <blockquote key={index}>
              {renderTokens(token.tokens as TokenList)}
            </blockquote>
          );
        case "list": {
          const ListTag = token.ordered ? "ol" : "ul";
          return (
            <ListTag key={index}>
              {token.items.map((item: Tokens.ListItem, itemIndex: number) => {
                const tokensList = (item.tokens ?? []) as TokenList;
                const { inline, block } = splitListItemTokens(tokensList);
                return (
                  <li key={itemIndex}>
                    {inline.length > 0 ? renderInline(inline) : item.text}
                    {block.length > 0 && renderTokens(block)}
                  </li>
                );
              })}
            </ListTag>
          );
        }
        case "code":
          return (
            <pre key={index}>
              <code className={token.lang ? `language-${token.lang}` : undefined}>
                {token.text}
              </code>
            </pre>
          );
        case "table":
          return (
            <table key={index}>
              <thead>
                <tr>
                  {token.header.map((header: Tokens.TableCell, headerIndex: number) => (
                    <th key={headerIndex}>{renderInline(header.tokens as TokenList)}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {token.rows.map((row: Tokens.TableCell[], rowIndex: number) => (
                  <tr key={rowIndex}>
                    {row.map((cell: Tokens.TableCell, cellIndex: number) => (
                      <td key={cellIndex}>{renderInline(cell.tokens as TokenList)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          );
        case "hr":
          return <hr key={index} />;
        default:
          return null;
      }
    })
    .filter(Boolean) as ReactNode[];
}

type MarkdownRendererProps = {
  tokens: TokenList;
};

export function MarkdownRenderer({ tokens }: MarkdownRendererProps) {
  return <>{renderTokens(tokens)}</>;
}
