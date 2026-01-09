import * as vscode from "vscode";
import { HtmlNode } from "./html-types";

export class A11yCodeLensProvider implements vscode.CodeLensProvider {
  private nodes: HtmlNode[] = [];

  setNodes(nodes: HtmlNode[]) {
    this.nodes = nodes;
  }

  provideCodeLenses(): vscode.CodeLens[] {
    return this.nodes.map(node => {
      return new vscode.CodeLens(node.range, {
        title: "⚠️ A11y: alt-Attribut fehlt",
        command: "",
        tooltip: "Dieses Bild benötigt ein alt-Attribut (WCAG 1.1.1)"
      });
    });
  }
}
