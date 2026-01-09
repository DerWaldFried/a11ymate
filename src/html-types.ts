import * as vscode from "vscode";

/**
 * Represents an HTML attribute.
 * Repräsentiert ein HTML-Attribut.
 */
export interface HtmlAttribute {
  name: string;
  value: string;
}

/**
 * Represents a simplified HTML node for analysis.
 * Repräsentiert einen vereinfachten HTML-Knoten für die Analyse.
 */
export interface HtmlNode {
  tagName: string;
  attributes: HtmlAttribute[];
  children: HtmlNode[];
  range: vscode.Range;
}
