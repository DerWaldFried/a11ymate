import { A11yRule } from "../types";
import { getLanguage } from "../language";
import { parseColor, getContrast } from "../utils/color";

export const colorContrastRule: A11yRule = {
  id: "color-contrast",
  check(node, context) {
    const lang = getLanguage() as any;
    const styleAttr = node.attributes.find(a => a.name === "style");
    if (!styleAttr) return;

    const style = styleAttr.value;

    // 1. Check: No content conveyed by color alone (Links without underline)
    // 1. Prüfung: Keine Inhalte nur durch Farbe (Links ohne Unterstreichung)
    if (node.tagName === "a") {
      const hasColor = /color\s*:/.test(style);
      const noDecoration = /text-decoration\s*:\s*none/.test(style);
      
      if (hasColor && noDecoration) {
        context.report({
          message: lang.colorContrast.colorAlone.title,
          description: lang.colorContrast.colorAlone.description,
          range: node.range
        });
      }
    }

    // 2. Check: Contrast Ratio
    // 2. Prüfung: Kontrastverhältnis
    const colorMatch = style.match(/color\s*:\s*([^;]+)/);
    const bgMatch = style.match(/background-color\s*:\s*([^;]+)/);

    if (colorMatch && bgMatch) {
      const fgColor = parseColor(colorMatch[1]);
      const bgColor = parseColor(bgMatch[1]);

      if (fgColor && bgColor) {
        const ratio = getContrast(fgColor, bgColor);
        const roundedRatio = Math.round(ratio * 100) / 100;

        // Determine required ratio based on element type
        // Bestimme benötigtes Verhältnis basierend auf Elementtyp
        let requiredRatio = 4.5; // Default Text (AA)
        let type = "text";

        // Large Text (h1-h4) or UI Elements (button, input, etc.) -> 3.0
        // Großer Text (h1-h4) oder UI-Elemente -> 3.0
        const isLargeText = ["h1", "h2", "h3", "h4"].includes(node.tagName);
        const isUI = ["button", "input", "select", "textarea"].includes(node.tagName);

        if (isLargeText) {
          requiredRatio = 3.0;
          type = "largeText";
        } else if (isUI) {
          requiredRatio = 3.0;
          type = "ui";
        }

        if (ratio < requiredRatio) {
          let message = "";
          let description = "";

          if (type === "largeText") {
            message = lang.colorContrast.ratio.largeText.title;
            description = lang.colorContrast.ratio.largeText.description;
          } else if (type === "ui") {
            message = lang.colorContrast.ratio.ui.title;
            description = lang.colorContrast.ratio.ui.description;
          } else {
            message = lang.colorContrast.ratio.normal.title;
            description = lang.colorContrast.ratio.normal.description;
          }

          // Append current ratio to description
          description = description.replace("{ratio}", roundedRatio.toString());

          context.report({
            message,
            description,
            range: node.range
          });
        }
      }
    }
  }
};