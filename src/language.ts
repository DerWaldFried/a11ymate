import * as vscode from "vscode";
import en from "./languages/en.json";
import de from "./languages/de.json";

/**
 * Type definition for the language pack based on the English file.
 * Typdefinition für das Sprachpaket basierend auf der englischen Datei.
 */
export type LanguagePack = typeof en;

const languages: Record<string, LanguagePack> = {
  en,
  de
};

/**
 * Retrieves the current language pack based on configuration.
 * Ruft das aktuelle Sprachpaket basierend auf der Konfiguration ab.
 * 
 * @returns The selected language pack (default: en). / Das ausgewählte Sprachpaket (Standard: en).
 */
export function getLanguage(): LanguagePack {
  const config = vscode.workspace.getConfiguration("a11ymate");
  const lang = config.get<string>("language", "en");

  return languages[lang] || languages["en"];
}
