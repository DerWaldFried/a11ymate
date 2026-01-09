import * as vscode from "vscode";
import { getLanguage } from "./language";

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
        // Check if it is the "Missing" error (Line 0)
        // Prüfen ob es der "Fehlt"-Fehler ist (Zeile 0)
        if (diagnostic.range.start.line === 0 && diagnostic.range.start.character === 0) {
          this.addMainFix(document, lang, actions);
        }
      } else if (diagnostic.code === "heading-order") {
        this.addHeadingFix(document, diagnostic.range, actions);
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
  private addMainFix(document: vscode.TextDocument, lang: any, actions: vscode.CodeAction[]) {
    const fix = new vscode.CodeAction(lang.mainTag.missing.action, vscode.CodeActionKind.QuickFix);
    fix.edit = new vscode.WorkspaceEdit();
    
    const firstLine = document.lineAt(0);
    const lastLine = document.lineAt(document.lineCount - 1);

    fix.edit.insert(document.uri, firstLine.range.start, "<main>\n");
    fix.edit.insert(document.uri, lastLine.range.end, "\n</main>");
    actions.push(fix);
  }

  /**
   * Adds a Quick Fix to correct the heading level.
   * Fügt einen Quick Fix hinzu, um die Überschriftenebene zu korrigieren.
   */
  private addHeadingFix(document: vscode.TextDocument, range: vscode.Range, actions: vscode.CodeAction[]) {
    const startTagText = document.getText(range);
    const match = startTagText.match(/^<h([1-6])/i);
    if (!match) return;

    const currentLevel = parseInt(match[1]);
    // Logic: h1 -> h2 (demote), h(n) -> h(n-1) (promote/fix gap)
    // Logik: h1 -> h2 (abstufen), h(n) -> h(n-1) (aufstufen/Lücke schließen)
    const targetLevel = currentLevel === 1 ? 2 : currentLevel - 1;
    const newTagName = `h${targetLevel}`;

    const fix = new vscode.CodeAction(`Ändere zu <${newTagName}>`, vscode.CodeActionKind.QuickFix);
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
}
