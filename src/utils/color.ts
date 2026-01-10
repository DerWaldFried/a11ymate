/**
 * Represents a color in RGB format.
 * Repräsentiert eine Farbe im RGB-Format.
 */
export interface RgbColor {
  r: number;
  g: number;
  b: number;
}

/**
 * Parses a color string (hex or rgb) into an RgbColor object.
 * Parst einen Farbstring (Hex oder RGB) in ein RgbColor-Objekt.
 */
export function parseColor(color: string): RgbColor | null {
  color = color.trim().toLowerCase();

  // Hex #RRGGBB or #RGB
  if (color.startsWith("#")) {
    const hex = color.substring(1);
    if (hex.length === 3) {
      return {
        r: parseInt(hex[0] + hex[0], 16),
        g: parseInt(hex[1] + hex[1], 16),
        b: parseInt(hex[2] + hex[2], 16)
      };
    } else if (hex.length === 6) {
      return {
        r: parseInt(hex.substring(0, 2), 16),
        g: parseInt(hex.substring(2, 4), 16),
        b: parseInt(hex.substring(4, 6), 16)
      };
    }
  }

  // rgb(r, g, b)
  const rgbMatch = color.match(/^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/);
  if (rgbMatch) {
    return {
      r: parseInt(rgbMatch[1]),
      g: parseInt(rgbMatch[2]),
      b: parseInt(rgbMatch[3])
    };
  }

  return null;
}

/**
 * Calculates the relative luminance of a color.
 * Berechnet die relative Luminanz einer Farbe.
 * Formula: https://www.w3.org/TR/WCAG20/#relativeluminancedef
 */
export function getLuminance(c: RgbColor): number {
  const adjust = (v: number) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * adjust(c.r) + 0.7152 * adjust(c.g) + 0.0722 * adjust(c.b);
}

/**
 * Calculates the contrast ratio between two colors.
 * Berechnet das Kontrastverhältnis zwischen zwei Farben.
 */
export function getContrast(c1: RgbColor, c2: RgbColor): number {
  const l1 = getLuminance(c1);
  const l2 = getLuminance(c2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Converts RgbColor back to Hex string.
 * Konvertiert RgbColor zurück in einen Hex-String.
 */
export function rgbToHex(c: RgbColor): string {
  const toHex = (n: number) => {
    const hex = Math.max(0, Math.min(255, Math.round(n))).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };
  return `#${toHex(c.r)}${toHex(c.g)}${toHex(c.b)}`;
}

/**
 * Suggests a new foreground color that meets the target contrast ratio.
 * Schlägt eine neue Vordergrundfarbe vor, die das Ziel-Kontrastverhältnis erfüllt.
 */
export function suggestColor(fg: RgbColor, bg: RgbColor, targetRatio: number): string | null {
  let currentFg = { ...fg };
  const bgLum = getLuminance(bg);
  const step = bgLum > 0.5 ? -5 : 5; // Darken if bg is light, lighten if bg is dark

  for (let i = 0; i < 50; i++) { // Max 50 iterations to prevent infinite loops
    const contrast = getContrast(currentFg, bg);
    if (contrast >= targetRatio) {
      return rgbToHex(currentFg);
    }

    // Adjust brightness
    currentFg.r = Math.max(0, Math.min(255, currentFg.r + step));
    currentFg.g = Math.max(0, Math.min(255, currentFg.g + step));
    currentFg.b = Math.max(0, Math.min(255, currentFg.b + step));
  }

  // Fallback: Black or White
  const black = { r: 0, g: 0, b: 0 };
  const white = { r: 255, g: 255, b: 255 };
  
  if (getContrast(black, bg) >= targetRatio) return "#000000";
  if (getContrast(white, bg) >= targetRatio) return "#ffffff";

  return null;
}
