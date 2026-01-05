export function extractHtmlFromPhp(text: string): string {
  // Entfernt alles zwischen <?php ... ?>
  return text.replace(/<\?php[\s\S]*?\?>/g, "");
}
