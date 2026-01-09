import * as vscode from "vscode";
import { A11yRule, RuleContext } from "../types";
import { HtmlNode } from "../html-types";
import { getLanguage } from "../language";

export const mainTagRule: A11yRule = {
  id: "mainTag",

  checkDocument(nodes: HtmlNode[], context: RuleContext) {
    const mainNodes: HtmlNode[] = [];

    // Rekursive Funktion zum Sammeln aller <main> Tags
    function traverse(nodeList: HtmlNode[]) {
      for (const node of nodeList) {
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

    // Fall 1: Kein <main> Tag vorhanden
    if (mainNodes.length === 0) {
      context.report({
        message: lang.mainTag.missing.title,
        description: lang.mainTag.missing.description,
        range: new vscode.Range(0, 0, 0, 0) // Markiert den Anfang der Datei
      });
    } 
    // Fall 2: Mehr als ein <main> Tag
    else if (mainNodes.length > 1) {
      for (const node of mainNodes) {
        context.report({
          message: lang.mainTag.tooMany.title,
          description: lang.mainTag.tooMany.description,
          range: node.range
        });
      }
    }
  }
};