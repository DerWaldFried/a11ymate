import * as vscode from "vscode";
import { HtmlNode } from "./html-types";

export async function parseHtml(html: string): Promise<HtmlNode[]> {
  const parse5 = await import("parse5");

  const document = parse5.parseFragment(html, {
    sourceCodeLocationInfo: true
  });

  const nodes: HtmlNode[] = [];

  function walk(node: any) {
    if (node.tagName && node.sourceCodeLocation) {
      const loc = node.sourceCodeLocation;

      if (!loc.startTag) return;

      // WICHTIG: Nur den Start-Tag markieren, nicht das ganze Element
      const start = loc.startTag.startOffset;
      const end = loc.startTag.endOffset;

      const htmlNode: HtmlNode = {
        tagName: node.tagName,
        attributes: node.attrs?.map((a: any) => ({
          name: a.name,
          value: a.value
        })) || [],
        children: [],
        range: new vscode.Range(
          positionFromIndex(html, start),
          positionFromIndex(html, end)
        )
      };

      nodes.push(htmlNode);
    }

    if (node.childNodes) {
      for (const child of node.childNodes) {
        walk(child);
      }
    }
  }

  walk(document);

  return nodes;
}

function positionFromIndex(text: string, index: number): vscode.Position {
  const lines = text.slice(0, index).split("\n");
  const line = lines.length - 1;
  const character = lines[lines.length - 1].length;
  return new vscode.Position(line, character);
}
