import * as vscode from "vscode";

export class AddAltAttributeFix implements vscode.CodeActionProvider {
  provideCodeActions(document: vscode.TextDocument, range: vscode.Range) {
    const line = document.lineAt(range.start.line).text;

    if (line.includes("alt=")) {
      return;
    }

    const imgIndex = line.indexOf("<img");
    if (imgIndex === -1) {
      return;
    }

    const insertPos = new vscode.Position(
      range.start.line,
      imgIndex + 4
    );

    const fix = new vscode.CodeAction(
      'Add alt="" attribute',
      vscode.CodeActionKind.QuickFix
    );

    fix.edit = new vscode.WorkspaceEdit();
    fix.edit.insert(document.uri, insertPos, ' alt=""');
    fix.isPreferred = true;

    return [fix];
  }
}
