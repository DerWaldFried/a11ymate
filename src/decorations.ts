import * as vscode from "vscode";

/**
 * Decoration type for highlighting accessibility issues in the editor.
 * Dekorationstyp zum Hervorheben von Barrierefreiheitsproblemen im Editor.
 */
export const a11yDecoration = vscode.window.createTextEditorDecorationType({
  borderWidth: "0 0 2px 0",
  borderStyle: "solid",
  borderColor: "#ff8800",
  overviewRulerColor: "#ff8800",
  overviewRulerLane: vscode.OverviewRulerLane.Right,
});
