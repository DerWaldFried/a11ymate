import * as vscode from "vscode";

export class AddAltAttributeFix implements vscode.CodeActionProvider {
  provideCodeActions(document: vscode.TextDocument, range: vscode.Range) {
    const line = document.lineAt(range.start.line).text;

    // Finde die Position nach <img
    const imgIndex = line.indexOf("<img");
    if (imgIndex === -1) return;

    const insertPos = new vscode.Position(
      range.start.line,
      imgIndex + 4 // nach "<img"
    );

    const fix = new vscode.CodeAction(
      'Add alt="" attribute',
      vscode.CodeActionKind.QuickFix
    );

    fix.edit = new vscode.WorkspaceEdit();
    fix.edit.insert(document.uri, insertPos, ' alt=""');

    return [fix];
  }
}
