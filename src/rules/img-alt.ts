import * as vscode from "vscode";
import { A11yRule, RuleContext } from "../types";
import { HtmlNode } from "../html-types";
import { getLanguage } from "../language";

export const imgAltRule: A11yRule = {
  id: "img-alt",

  check(node: HtmlNode, context: RuleContext) {
    if (node.tagName !== "img") return;

    const lang = getLanguage();
    const messages = lang.imgAlt;

    const hasAlt = node.attributes?.some(attr => attr.name === "alt");

    if (!hasAlt) {
      context.report({
        message: messages.title,
        description: messages.description,
        range: new vscode.Range(0, 0, 0, 0) // Platzhalter
      });
    }
  }
};
