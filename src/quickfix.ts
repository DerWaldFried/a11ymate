import * as vscode from "vscode";
import { getLanguage } from "./language";
import { parseColor, suggestColor } from "./utils/color";

/**
 * Provider for Quick Fixes (Code Actions).
 * Provider für Quick Fixes (Code Actions).
 */
export class A11yQuickFixProvider implements vscode.CodeActionProvider {
  /**
   * Provides available code actions for a given range.
   * Stellt verfügbare Code-Aktionen für einen gegebenen Bereich bereit.
   *
   * @param document The document in which the command was invoked. / Das Dokument, in dem der Befehl aufgerufen wurde.
   * @param range The range for which the command was invoked. / Der Bereich, für den der Befehl aufgerufen wurde.
   * @param context Context carrying additional information. / Kontext, der zusätzliche Informationen enthält.
   */
  provideCodeActions(
    document: vscode.TextDocument,
    range: vscode.Range,
    context: vscode.CodeActionContext
  ): vscode.CodeAction[] | undefined {
    const actions: vscode.CodeAction[] = [];
    const lang = getLanguage() as any;

    for (const diagnostic of context.diagnostics) {
      if (diagnostic.code === "img-alt") {
        this.addAltFix(document, diagnostic.range, lang, actions);
      } else if (diagnostic.code === "mainTag") {
        // Check if it is NOT the "Too many" error (which points to <main>)
        // Prüfen, ob es NICHT der "Zu viele"-Fehler ist (der auf <main> zeigt)
        const text = document.getText(diagnostic.range);
        if (!text.trim().toLowerCase().startsWith("<main")) {
          this.addMainFix(document, diagnostic.range, lang, actions);
        }
      } else if (diagnostic.code === "heading-order") {
        this.addHeadingFix(document, diagnostic.range, lang, actions);
      } else if (diagnostic.code === "color-contrast") {
        this.addColorFix(document, diagnostic.range, lang, actions);
      } else if (diagnostic.code === "input-feedback") {
        this.addInputFeedbackFix(document, diagnostic.range, lang, actions);
      }
    }

    return actions;
  }

  /**
   * Adds a Quick Fix to insert an empty alt attribute.
   * Fügt einen Quick Fix hinzu, um ein leeres alt-Attribut einzufügen.
   */
  private addAltFix(document: vscode.TextDocument, range: vscode.Range, lang: any, actions: vscode.CodeAction[]) {
    const line = document.lineAt(range.start.line).text;
    if (line.includes("alt=")) return;

    const imgIndex = line.indexOf("<img");
    if (imgIndex === -1) return;

    const insertPos = new vscode.Position(range.start.line, imgIndex + 4);
    const fix = new vscode.CodeAction(lang.imgAlt.action, vscode.CodeActionKind.QuickFix);
    fix.edit = new vscode.WorkspaceEdit();
    fix.edit.insert(document.uri, insertPos, ' alt=""');
    fix.isPreferred = true;
    actions.push(fix);
  }

  /**
   * Adds a Quick Fix to wrap the content in a <main> tag.
   * Fügt einen Quick Fix hinzu, um den Inhalt in ein <main>-Tag einzuwickeln.
   */
  private addMainFix(document: vscode.TextDocument, range: vscode.Range, lang: any, actions: vscode.CodeAction[]) {
    const fix = new vscode.CodeAction(lang.mainTag.missing.action, vscode.CodeActionKind.QuickFix);
    fix.edit = new vscode.WorkspaceEdit();
    
    const text = document.getText(range);

    // Check if we are on <body> (smart fix) / Prüfen ob wir auf <body> sind (schlauer Fix)
    if (text.match(/^<body/i)) {
      // Insert <main> after <body> start tag / <main> nach <body> Start-Tag einfügen
      fix.edit.insert(document.uri, range.end, "\n<main>");

      // Insert </main> before </body> end tag / </main> vor </body> End-Tag einfügen
      const docText = document.getText();
      const bodyEndIndex = docText.lastIndexOf("</body>"); // Search in full document / Suche im ganzen Dokument
      if (bodyEndIndex !== -1) {
        const insertEndPos = document.positionAt(bodyEndIndex);
        fix.edit.insert(document.uri, insertEndPos, "\n</main>\n");
      }
    } else {
      // Fallback: Wrap everything (e.g. if no body found) / Fallback: Alles einwickeln
      const firstLine = document.lineAt(0);
      const lastLine = document.lineAt(document.lineCount - 1);
      fix.edit.insert(document.uri, firstLine.range.start, "<main>\n");
      fix.edit.insert(document.uri, lastLine.range.end, "\n</main>");
    }
    
    actions.push(fix);
  }

  /**
   * Adds a Quick Fix to correct the heading level.
   * Fügt einen Quick Fix hinzu, um die Überschriftenebene zu korrigieren.
   */
  private addHeadingFix(document: vscode.TextDocument, range: vscode.Range, lang: any, actions: vscode.CodeAction[]) {
    const startTagText = document.getText(range);
    const match = startTagText.match(/^<h([1-6])/i);
    if (!match) return;

    const currentLevel = parseInt(match[1]);
    // Logic: h1 -> h2 (demote), h(n) -> h(n-1) (promote/fix gap)
    // Logik: h1 -> h2 (abstufen), h(n) -> h(n-1) (aufstufen/Lücke schließen)
    const targetLevel = currentLevel === 1 ? 2 : currentLevel - 1;
    const newTagName = `h${targetLevel}`;

    const title = lang.headingOrder.action.replace("{tag}", newTagName);
    const fix = new vscode.CodeAction(title, vscode.CodeActionKind.QuickFix);
    fix.edit = new vscode.WorkspaceEdit();

    // Replace start tag (preserve attributes) / Start-Tag ersetzen (Attribute erhalten)
    const newStartTagText = startTagText.replace(new RegExp(`h${currentLevel}`, "i"), newTagName);
    fix.edit.replace(document.uri, range, newStartTagText);

    // Find and replace end tag / End-Tag finden und ersetzen
    const docText = document.getText();
    const startIndex = document.offsetAt(range.end);
    const textAfter = docText.slice(startIndex);
    const endTagRegex = new RegExp(`</h${currentLevel}>`, "i");
    const endMatch = textAfter.match(endTagRegex);

    if (endMatch && endMatch.index !== undefined) {
      const endTagStartOffset = startIndex + endMatch.index;
      const endTagEndOffset = endTagStartOffset + endMatch[0].length;
      const endTagRange = new vscode.Range(
        document.positionAt(endTagStartOffset),
        document.positionAt(endTagEndOffset)
      );
      fix.edit.replace(document.uri, endTagRange, `</${newTagName}>`);
    }

    actions.push(fix);
  }

  /**
   * Adds a Quick Fix to adjust color contrast.
   * Fügt einen Quick Fix hinzu, um den Farbkontrast anzupassen.
   */
  private addColorFix(document: vscode.TextDocument, range: vscode.Range, lang: any, actions: vscode.CodeAction[]) {
    const text = document.getText(range);
    
    // Extract colors again to calculate suggestion
    // Farben erneut extrahieren, um Vorschlag zu berechnen
    const colorMatch = /color\s*:\s*([^;"]+)/.exec(text);
    const bgMatch = /background-color\s*:\s*([^;"]+)/.exec(text);

    if (colorMatch && bgMatch) {
      const fg = parseColor(colorMatch[1]);
      const bg = parseColor(bgMatch[1]);

      if (fg && bg) {
        // Determine target ratio (simplified logic, assuming 4.5 for safety)
        // Zielverhältnis bestimmen (vereinfachte Logik, Annahme 4.5 zur Sicherheit)
        const targetRatio = 4.5;
        const newColorHex = suggestColor(fg, bg, targetRatio);

        if (newColorHex) {
          const title = lang.colorContrast.actions.adjustColor.replace("{color}", newColorHex);
          const fix = new vscode.CodeAction(title, vscode.CodeActionKind.QuickFix);
          fix.edit = new vscode.WorkspaceEdit();

          // Find the exact range of the color value in the text
          // Finde den exakten Bereich des Farbwerts im Text
          // colorMatch[0] is e.g. "color: red", colorMatch[1] is "red"
          const matchIndex = colorMatch.index;
          const valueOffset = colorMatch[0].indexOf(colorMatch[1]);
          const startPos = document.positionAt(document.offsetAt(range.start) + matchIndex + valueOffset);
          const endPos = document.positionAt(document.offsetAt(range.start) + matchIndex + valueOffset + colorMatch[1].length);
          
          fix.edit.replace(document.uri, new vscode.Range(startPos, endPos), newColorHex);
          fix.isPreferred = true;
          actions.push(fix);
        }
      }
    } else if (/text-decoration\s*:\s*none/.test(text) && /^<a\b/i.test(text)) {
       // Fix for "Color alone": Remove text-decoration: none
       // Fix für "Nur Farbe": Entferne text-decoration: none
       const fix = new vscode.CodeAction(lang.colorContrast.actions.removeDecoration, vscode.CodeActionKind.QuickFix);
       fix.edit = new vscode.WorkspaceEdit();
       
       // Simple replace for demonstration. In production, use regex to be precise.
       // Einfaches Ersetzen zur Demonstration. In Produktion Regex nutzen.
       const newText = text.replace(/text-decoration\s*:\s*none;?/, "");
       fix.edit.replace(document.uri, range, newText);
       actions.push(fix);
    }
  }

  /**
   * Adds a Quick Fix to add aria-describedby and a corresponding info element.
   * Fügt einen Quick Fix hinzu, um aria-describedby und ein entsprechendes Info-Element hinzuzufügen.
   */
  private addInputFeedbackFix(document: vscode.TextDocument, range: vscode.Range, lang: any, actions: vscode.CodeAction[]) {
    const text = document.getText(range);
    
    // Try to find existing ID
    // Versuche existierende ID zu finden
    const idMatch = /id=["']([^"']+)["']/.exec(text);
    let baseId = "input";
    if (idMatch) {
      baseId = idMatch[1];
    } else {
      // Generate a simple ID if none exists (in a real app, maybe use random or line number)
      // Generiere eine einfache ID, falls keine existiert
      baseId = `field-${range.start.line}`;
    }

    const errorId = `error-${baseId}`;
    const fix = new vscode.CodeAction(lang.inputFeedback.action, vscode.CodeActionKind.QuickFix);
    fix.edit = new vscode.WorkspaceEdit();

    // 1. Add aria-describedby to input
    // 1. Füge aria-describedby zum Input hinzu
    // Insert before the closing /> or >
    const insertAttrPos = range.end.translate(0, text.endsWith("/>") ? -2 : -1);
    fix.edit.insert(document.uri, insertAttrPos, ` aria-describedby="${errorId}"`);

    // 2. Add paragraph above the input
    // 2. Füge Paragraph über dem Input hinzu
    const pTag = `<p id="${errorId}">Error Info</p>\n`;
    fix.edit.insert(document.uri, range.start, pTag);

    actions.push(fix);
  }
}
