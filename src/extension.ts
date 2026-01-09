import * as vscode from "vscode";
import { parseHtml } from "./parser";
import { extractHtmlFromPhp } from "./php-extractor";
import { imgAltRule } from "./rules/img-alt";
import { mainTagRule } from "./rules/main-html";
import { A11yRule } from "./types";
import { AddAltAttributeFix } from "./quickfix";
import { A11yCodeLensProvider } from "./codelens";
import { a11yDecoration } from "./decorations";

export function activate(context: vscode.ExtensionContext) {
  const diagnostics = vscode.languages.createDiagnosticCollection("a11ymate");
  context.subscriptions.push(diagnostics);

  const codeLensProvider = new A11yCodeLensProvider();
  vscode.languages.registerCodeLensProvider(["html", "php"], codeLensProvider);

  vscode.languages.registerCodeActionsProvider(
    ["html", "php"],
    new AddAltAttributeFix(),
    { providedCodeActionKinds: [vscode.CodeActionKind.QuickFix] }
  );

    const rules: A11yRule[] = [imgAltRule, mainTagRule];

  vscode.workspace.onDidChangeTextDocument(async event => {
    await analyze(event.document);
  });

  vscode.workspace.onDidSaveTextDocument(async doc => {
    await analyze(doc);
  });

  async function analyze(doc: vscode.TextDocument) {
    if (!["html", "php"].includes(doc.languageId)) return;

    let text = doc.getText();
    if (doc.languageId === "php") text = extractHtmlFromPhp(text);

    const nodes = await parseHtml(text);
    const diags: vscode.Diagnostic[] = [];
    const failingNodes: any[] = [];

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

    diagnostics.set(doc.uri, diags);

    // CodeLens aktualisieren
    codeLensProvider.setNodes(failingNodes);

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

export function deactivate() {}
