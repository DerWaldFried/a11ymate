import * as vscode from "vscode";
import { parseHtml } from "./parser";
import { extractHtmlFromPhp } from "./php-extractor";
import { imgAltRule } from "./rules/img-alt";
import { A11yRule } from "./types";
import { AddAltAttributeFix } from "./quickfix";

export function activate(context: vscode.ExtensionContext) {
  const diagnostics = vscode.languages.createDiagnosticCollection("a11ymate");
  context.subscriptions.push(diagnostics);

  vscode.languages.registerCodeActionsProvider(
    ["html", "php"],
    new AddAltAttributeFix(),
    { providedCodeActionKinds: [vscode.CodeActionKind.QuickFix] }
  );

  const rules: A11yRule[] = [imgAltRule];

  vscode.workspace.onDidChangeTextDocument(event => {
    const doc = event.document;

    if (!["html", "php"].includes(doc.languageId)) return;

    let text = doc.getText();

    if (doc.languageId === "php") {
      text = extractHtmlFromPhp(text);
    }

    const nodes = parseHtml(text);
    const diags: vscode.Diagnostic[] = [];

    function walk(node: any) {
      for (const rule of rules) {
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
          }
        });
      }

      if (node.children) {
        for (const child of node.children) walk(child);
      }
    }

    for (const node of nodes) walk(node);

    diagnostics.set(doc.uri, diags);
  });
}

export function deactivate() {}
