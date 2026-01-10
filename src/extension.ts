import * as vscode from "vscode";
import { parseHtml } from "./parser";
import { extractHtmlFromPhp } from "./php-extractor";
import { imgAltRule } from "./rules/img-alt";
import { mainTagRule } from "./rules/main-html";
import { headingOrderRule } from "./rules/heading-order";
import { colorContrastRule } from "./rules/color-contrast";
import { A11yRule } from "./types";
import { A11yQuickFixProvider } from "./quickfix";
import { A11yCodeLensProvider } from "./codelens";
import { a11yDecoration } from "./decorations";

/**
 * Activates the extension.
 * Aktiviert die Erweiterung.
 */
export function activate(context: vscode.ExtensionContext) {
  // Create a diagnostic collection to report errors/warnings
  // Erstellt eine Diagnose-Sammlung, um Fehler/Warnungen zu melden
  const diagnostics = vscode.languages.createDiagnosticCollection("a11ymate");
  context.subscriptions.push(diagnostics);

  // Register CodeLens provider
  // Registriert den CodeLens-Provider
  const codeLensProvider = new A11yCodeLensProvider();
  vscode.languages.registerCodeLensProvider(["html", "php"], codeLensProvider);

  // Register QuickFix provider
  // Registriert den QuickFix-Provider
  vscode.languages.registerCodeActionsProvider(
    ["html", "php"],
    new A11yQuickFixProvider(),
    { providedCodeActionKinds: [vscode.CodeActionKind.QuickFix] }
  );

  const rules: A11yRule[] = [imgAltRule, mainTagRule, headingOrderRule, colorContrastRule];

  // Listen for document changes
  // Lauscht auf Dokumentänderungen
  vscode.workspace.onDidChangeTextDocument(async event => {
    await analyze(event.document);
  });

  // Listen for document saves
  // Lauscht auf das Speichern von Dokumenten
  vscode.workspace.onDidSaveTextDocument(async doc => {
    await analyze(doc);
  });

  /**
   * Analyzes the document and reports accessibility issues.
   * Analysiert das Dokument und meldet Barrierefreiheitsprobleme.
   */
  async function analyze(doc: vscode.TextDocument) {
    if (!["html", "php"].includes(doc.languageId)) return;

    let text = doc.getText();
    // Remove PHP code to parse HTML correctly
    // Entfernt PHP-Code, um HTML korrekt zu parsen
    if (doc.languageId === "php") text = extractHtmlFromPhp(text);

    const nodes = await parseHtml(text);
    const diags: vscode.Diagnostic[] = [];
    const failingNodes: any[] = [];

    /**
     * Traverses the node tree and executes node-specific rules.
     * Durchläuft den Knotenbaum und führt knotenspezifische Regeln aus.
     */
    function walk(node: any) {
      for (const rule of rules) {
        if (rule.check) {
          rule.check(node, {
            report: ({ message, description, range }) => {
              const diagnostic = new vscode.Diagnostic(
                range,
                message,
                vscode.DiagnosticSeverity.Warning
              );
              diagnostic.source = "A11yMate";
              diagnostic.code = rule.id;
              diags.push(diagnostic);
              failingNodes.push(node);
            }
          });
        }
      }

      if (node.children) {
        for (const child of node.children) walk(child);
      }
    }

    for (const node of nodes) walk(node);

    // Execute document-wide rules
    // Dokument-weite Regeln ausführen
    for (const rule of rules) {
      if (rule.checkDocument) {
        rule.checkDocument(nodes, {
          report: ({ message, description, range, relatedNode }) => {
            const diagnostic = new vscode.Diagnostic(
              range,
              message,
              vscode.DiagnosticSeverity.Warning
            );
            diagnostic.source = "A11yMate";
            diagnostic.code = rule.id;
            diags.push(diagnostic);
            
            // IMPORTANT: Document-wide errors must also be registered for CodeLens.
            // WICHTIG: Auch dokumentweite Fehler müssen für CodeLens registriert werden.
            // Since 'checkDocument' often doesn't return specific nodes, we create a dummy node if necessary
            // Da 'checkDocument' oft keine spezifischen Nodes zurückgibt, erstellen wir hier ggf. einen Dummy-Node
            // or use the node from the range if available.
            // oder nutzen den Node aus dem Range, falls vorhanden.
            
            if (relatedNode) {
              failingNodes.push(relatedNode);
            } else if (range.start.line === 0 && range.end.character === 0) {
               // For "Main missing" (Range 0,0) we create a dummy:
               // Für "Main fehlt" (Range 0,0) erstellen wir einen Dummy:
               failingNodes.push({ tagName: "main", attributes: [], children: [], range });
            }
          }
        });
      }
    }

    diagnostics.set(doc.uri, diags);

    // Update CodeLens
    // CodeLens aktualisieren
    codeLensProvider.setNodes(failingNodes);

    // Set decorations
    // Decorations setzen
    const editor = vscode.window.activeTextEditor;
    if (editor && editor.document.uri.toString() === doc.uri.toString()) {
      editor.setDecorations(
        a11yDecoration,
        failingNodes.map(n => n.range)
      );
    }
  }
}

/**
 * Deactivates the extension.
 * Deaktiviert die Erweiterung.
 */
export function deactivate() {}
