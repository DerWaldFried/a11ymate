export function extractHtmlFromPhp(text: string): string {
  return text.replace(/<\?php[\s\S]*?\?>/g, "");
}
