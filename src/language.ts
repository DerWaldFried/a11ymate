import * as vscode from "vscode";
import en from "./languages/en.json";
import de from "./languages/de.json";

export type LanguagePack = typeof en;

const languages: Record<string, LanguagePack> = {
  en,
  de
};

export function getLanguage(): LanguagePack {
  const config = vscode.workspace.getConfiguration("a11ymate");
  const lang = config.get<string>("language", "en");

  return languages[lang] || languages["en"];
}
