// src/html-types.ts

export interface HtmlAttribute {
  name: string;
  value?: string;
}

export interface HtmlNode {
  tagName: string;
  attributes: HtmlAttribute[];
  children?: HtmlNode[];
  range: any; // später ersetzen wir das durch vscode.Range
}
