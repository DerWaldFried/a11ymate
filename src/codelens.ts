import * as vscode from "vscode";
import { HtmlNode } from "./html-types";
import { getLanguage } from "./language";

export class A11yCodeLensProvider implements vscode.CodeLensProvider {
  private nodes: HtmlNode[] = [];

  lang = getLanguage();

  setNodes(nodes: HtmlNode[]) {
    this.nodes = nodes;
  }

  provideCodeLenses(): vscode.CodeLens[] {
    return this.nodes.map(node => {
      return new vscode.CodeLens(node.range, {
        title: this.lang.imgAlt.title,
        command: "",
        tooltip: this.lang.imgAlt.description
      });
    });
  }
}
