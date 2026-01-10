import * as vscode from "vscode";
import { HtmlNode } from "./html-types";
import { getLanguage } from "./language";

/**
 * Provider for CodeLens in HTML and PHP files.
 * Provider für CodeLens in HTML- und PHP-Dateien.
 */
export class A11yCodeLensProvider implements vscode.CodeLensProvider {
  /**
   * List of nodes that have issues.
   * Liste der Knoten, die Probleme aufweisen.
   */
  private nodes: HtmlNode[] = [];

  /**
   * Current language configuration.
   * Aktuelle Sprachkonfiguration.
   */
  lang = getLanguage();

  /**
   * Updates the list of failing nodes.
   * Aktualisiert die Liste der fehlerhaften Knoten.
   *
   * @param nodes The new list of nodes. / Die neue Liste der Knoten.
   */
  setNodes(nodes: HtmlNode[]) {
    this.nodes = nodes;
  }

  /**
   * Provides CodeLenses for the document.
   * Stellt CodeLenses für das Dokument bereit.
   */
  provideCodeLenses(): vscode.CodeLens[] {
    return this.nodes.map(node => {
      const lang = this.lang as any;
      let title = "";
      let tooltip = "";

      if (node.tagName === "img") {
        title = lang.imgAlt.title;
        tooltip = lang.imgAlt.description;
      } else if (node.tagName === "main") {
        // Distinction: Is it missing (dummy node at 0,0) or are there too many?
        // Unterscheidung: Fehlt er (Dummy-Node bei 0,0) oder gibt es zu viele?
        if (node.range.start.line === 0 && node.range.end.character === 0) {
          title = lang.mainTag.missing.title;
          tooltip = lang.mainTag.missing.description;
        } else {
          title = lang.mainTag.tooMany.title;
          tooltip = lang.mainTag.tooMany.description;
        }
      } else if (/^h[1-6]$/.test(node.tagName)) {
        // Generic message for headings, details are in the diagnostic hover
        // Generische Nachricht für Überschriften, Details sind im Diagnose-Hover
        if (node.tagName === "h1") {
           title = lang.headingOrder.multipleH1.title;
           tooltip = lang.headingOrder.multipleH1.description;
        } else {
           title = lang.headingOrder.skippedLevel.title;
           tooltip = lang.headingOrder.skippedLevel.description;
        }
      } else if (node.tagName === "input") {
        title = lang.inputFeedback.codeLens.title;
        tooltip = lang.inputFeedback.codeLens.description;
      } else if (node.tagName === "button" || node.tagName === "textarea" || node.attributes.some(a => a.name === "style")) {
        // Fallback for color contrast issues on generic or specific tags
        title = lang.colorContrast.codeLens.title;
        tooltip = lang.colorContrast.codeLens.description;
      }

      return new vscode.CodeLens(node.range, {
        title,
        command: "",
        tooltip
      });
    });
  }
}
