import { A11yRule } from "../types";
import { getLanguage } from "../language";

export const htmlLangRule: A11yRule = {
  id: "html-lang",
  check(node, context) {
    if (node.tagName !== "html") return;

    const langAttr = node.attributes.find(a => a.name === "lang");
    const lang = getLanguage() as any;

    // Check if lang attribute is missing or empty
    // Prüfen, ob das lang-Attribut fehlt oder leer ist
    if (!langAttr || !langAttr.value.trim()) {
      context.report({
        message: lang.htmlLang.missing.title,
        description: lang.htmlLang.missing.description,
        range: node.range
      });
    }
  }
};