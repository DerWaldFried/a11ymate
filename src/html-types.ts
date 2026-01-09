import * as vscode from "vscode";

export interface HtmlAttribute {
  name: string;
  value: string;
}

export interface HtmlNode {
  tagName: string;
  attributes: HtmlAttribute[];
  children: HtmlNode[];
  range: vscode.Range;
}
