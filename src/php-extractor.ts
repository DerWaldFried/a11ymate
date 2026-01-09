/**
 * Removes PHP tags from the text to allow HTML parsing.
 * Entfernt PHP-Tags aus dem Text, um das HTML-Parsing zu ermöglichen.
 * 
 * @param text The original text containing PHP. / Der ursprüngliche Text, der PHP enthält.
 * @returns The text with PHP tags removed. / Der Text ohne PHP-Tags.
 */
export function extractHtmlFromPhp(text: string): string {
  return text.replace(/<\?php[\s\S]*?\?>/g, "");
}
