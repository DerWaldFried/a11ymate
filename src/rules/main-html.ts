import * as vscode from "vscode";
import { A11yRule, RuleContext } from "../types";
import { HtmlNode } from "../html-types";
import { getLanguage } from "../language";

/**
 * Rule to check for the existence and uniqueness of the <main> tag.
 * Regel zur Überprüfung des Vorhandenseins und der Einzigartigkeit des <main>-Tags.
 */
export const mainTagRule: A11yRule = {
  id: "mainTag",

  /**
   * Checks the entire document for <main> tags.
   * Überprüft das gesamte Dokument auf <main>-Tags.
   *
   * @param nodes The list of root nodes in the document. / Die Liste der Wurzelknoten im Dokument.
   * @param context The rule context for reporting errors. / Der Regelkontext zum Melden von Fehlern.
   */
  checkDocument(nodes: HtmlNode[], context: RuleContext) {
    const mainNodes: HtmlNode[] = [];
    let htmlNode: HtmlNode | undefined;
    let bodyNode: HtmlNode | undefined;

    /**
     * Recursively traverses the DOM tree to collect all <main> tags.
     * Durchläuft rekursiv den DOM-Baum, um alle <main>-Tags zu sammeln.
     *
     * @param nodeList The list of nodes to traverse. / Die zu durchlaufende Knotenliste.
     */
    function traverse(nodeList: HtmlNode[]) {
      for (const node of nodeList) {
        if (node.tagName === "html") {
          htmlNode = node;
        }
        if (node.tagName === "body") {
          bodyNode = node;
        }
        if (node.tagName === "main") {
          mainNodes.push(node);
        }
        if (node.children) {
          traverse(node.children);
        }
      }
    }
    traverse(nodes);

    const lang = getLanguage() as any; // Cast as any da mainTag evtl. noch nicht im Typ definiert ist

    // Case 1: No <main> tag present / Fall 1: Kein <main> Tag vorhanden
    if (mainNodes.length === 0) {
      // Prefer reporting on body or html tag / Bevorzuge Meldung am Body- oder HTML-Tag
      if (bodyNode) {
        context.report({
          message: lang.mainTag.missing.title,
          description: lang.mainTag.missing.description,
          range: bodyNode.range,
          relatedNode: bodyNode
        });
      } else if (htmlNode) {
        context.report({
          message: lang.mainTag.missing.title,
          description: lang.mainTag.missing.description,
          range: htmlNode.range,
          relatedNode: htmlNode
        });
      } else {
        context.report({
          message: lang.mainTag.missing.title,
          description: lang.mainTag.missing.description,
          range: new vscode.Range(0, 0, 0, 0) // Fallback
        });
      }
    } 
    // Case 2: More than one <main> tag / Fall 2: Mehr als ein <main> Tag
    else if (mainNodes.length > 1) {
      for (const node of mainNodes) {
        context.report({
          message: lang.mainTag.tooMany.title,
          description: lang.mainTag.tooMany.description,
          range: node.range,
          relatedNode: node
        });
      }
    }
  }
};