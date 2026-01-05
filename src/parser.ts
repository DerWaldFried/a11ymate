import { Parser } from "htmlparser2";
import * as vscode from "vscode";
import { HtmlNode } from "./html-types";

export function parseHtml(html: string): HtmlNode[] {
  const roots: HtmlNode[] = [];
  const stack: HtmlNode[] = [];

  const parser = new Parser(
    {
      onopentag(name, attributes) {
        const start = parser.startIndex;
        const end = parser.endIndex;

        const node: HtmlNode = {
          tagName: name,
          attributes: Object.entries(attributes).map(([k, v]) => ({
            name: k,
            value: v ?? ""
          })),
          children: [],
          range: new vscode.Range(
            positionFromIndex(html, start),
            positionFromIndex(html, end + 1)
          )
        };

        if (stack.length === 0) roots.push(node);
        else stack[stack.length - 1].children!.push(node);

        stack.push(node);
      },

      onclosetag() {
        stack.pop();
      }
    },
    { decodeEntities: true }
  );

  parser.write(html);
  parser.end();

  return roots;
}

function positionFromIndex(text: string, index: number): vscode.Position {
  let line = 0;
  let lastBreak = 0;

  for (let i = 0; i < index; i++) {
    if (text.charCodeAt(i) === 10) { // \n
      line++;
      lastBreak = i + 1;
    }
  }

  return new vscode.Position(line, index - lastBreak);
}
