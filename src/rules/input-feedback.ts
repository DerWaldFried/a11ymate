import { A11yRule } from "../types";
import { getLanguage } from "../language";

export const inputFeedbackRule: A11yRule = {
  id: "input-feedback",
  check(node, context) {
    if (node.tagName !== "input") return;

    const attributes = node.attributes;
    const isRequired = attributes.some(a => a.name === "required");
    const hasDescribedBy = attributes.some(a => a.name === "aria-describedby");

    if (isRequired && !hasDescribedBy) {
      const lang = getLanguage() as any;
      context.report({
        message: lang.inputFeedback.missingDescribedBy.title,
        description: lang.inputFeedback.missingDescribedBy.description,
        range: node.range
      });
    }
  }
};