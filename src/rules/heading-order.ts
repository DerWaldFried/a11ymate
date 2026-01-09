import * as vscode from "vscode";
import { A11yRule, RuleContext } from "../types";
import { HtmlNode } from "../html-types";
import { getLanguage } from "../language";

/**
 * Rule to check heading order (h1-h6) according to WCAG.
 * Regel zur Überprüfung der Überschriftenreihenfolge (h1-h6) gemäß WCAG.
 */
export const headingOrderRule: A11yRule = {
  id: "heading-order",

  /**
   * Checks the document for correct heading hierarchy.
   * Überprüft das Dokument auf korrekte Überschriftenhierarchie.
   */
  checkDocument(nodes: HtmlNode[], context: RuleContext) {
    const headings: HtmlNode[] = [];

    // Traverse to find all headings in order
    // Durchlaufen, um alle Überschriften in der Reihenfolge zu finden
    function traverse(nodeList: HtmlNode[]) {
      for (const node of nodeList) {
        if (/^h[1-6]$/.test(node.tagName)) {
          headings.push(node);
        }
        if (node.children) {
          traverse(node.children);
        }
      }
    }
    traverse(nodes);

    const lang = getLanguage() as any;
    let h1Count = 0;
    let previousLevel = 0; // 0 indicates start of document / 0 zeigt den Dokumentanfang an

    for (const heading of headings) {
      const level = parseInt(heading.tagName.substring(1));

      // Check 1: Only one h1 allowed
      // Prüfung 1: Nur eine h1 erlaubt
      if (level === 1) {
        h1Count++;
        if (h1Count > 1) {
          context.report({
            message: lang.headingOrder.multipleH1.title,
            description: lang.headingOrder.multipleH1.description,
            range: heading.range,
            relatedNode: heading
          });
        }
      }

      // Check 2: No skipped levels (e.g. h1 -> h3 is bad, h2 -> h2 is ok, h2 -> h1 is ok)
      // Prüfung 2: Keine übersprungenen Ebenen
      // Logic: Current level cannot be more than previous level + 1
      // Logik: Aktuelle Ebene darf nicht größer als vorherige Ebene + 1 sein
      if (previousLevel !== 0 && level > previousLevel + 1) {
        context.report({
          message: lang.headingOrder.skippedLevel.title,
          description: lang.headingOrder.skippedLevel.description,
          range: heading.range,
          relatedNode: heading
        });
      }

      previousLevel = level;
    }
  }
};