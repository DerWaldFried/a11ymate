import { HtmlNode } from "./html-types";

export interface RuleContext {
  report: (data: {
    message: string;
    description: string;
    range: any;
  }) => void;
}

export interface A11yRule {
  id: string;
  check(node: HtmlNode, context: RuleContext): void;
}
