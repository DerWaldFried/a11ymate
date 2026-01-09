import { HtmlNode } from "./html-types";

/**
 * Context provided to a rule during execution.
 * Kontext, der einer Regel während der Ausführung bereitgestellt wird.
 */
export interface RuleContext {
  /**
   * Reports an issue found by the rule.
   * Meldet ein von der Regel gefundenes Problem.
   */
  report: (data: {
    message: string;
    description: string;
    range: any;
    relatedNode?: HtmlNode;
  }) => void;
}

/**
 * Interface definition for an accessibility rule.
 * Schnittstellendefinition für eine Barrierefreiheitsregel.
 */
export interface A11yRule {
  /**
   * Unique identifier for the rule.
   * Eindeutige Kennung für die Regel.
   */
  id: string;
  
  /**
   * Checks a single node.
   * Überprüft einen einzelnen Knoten.
   */
  check?(node: HtmlNode, context: RuleContext): void;
  
  /**
   * Checks the entire document structure.
   * Überprüft die gesamte Dokumentstruktur.
   */
  checkDocument?(nodes: HtmlNode[], context: RuleContext): void;
}
