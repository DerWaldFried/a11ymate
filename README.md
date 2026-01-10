# A11yMate - Accessibility Helper for VS Code

A11yMate is a VS Code extension designed to help developers identify and fix accessibility (a11y) issues in HTML and PHP files directly within the editor. It features real-time analysis, CodeLens indicators, and Quick Fixes.

A11yMate ist eine VS Code-Erweiterung, die Entwicklern hilft, Barrierefreiheitsprobleme (a11y) in HTML- und PHP-Dateien direkt im Editor zu erkennen und zu beheben. Sie bietet Echtzeitanalyse, CodeLens-Indikatoren und Quick Fixes.

## 🚀 Features / Funktionen

*   **Real-time Analysis / Echtzeitanalyse**: Checks for missing attributes (e.g., `alt` on `<img>`) and structural issues (e.g., missing `<main>`). / Prüft auf fehlende Attribute (z. B. `alt` bei `<img>`) und strukturelle Probleme (z. B. fehlendes `<main>`).
*   **Color Contrast / Farbkontrast**: Verifies WCAG AA compliance for text and UI elements. / Überprüft die Einhaltung von WCAG AA für Text und UI-Elemente.
*   **Form Accessibility / Formular-Barrierefreiheit**: Ensures required inputs have associated descriptions. / Stellt sicher, dass erforderliche Eingabefelder verknüpfte Beschreibungen haben.
*   **Heading Structure / Überschriftenstruktur**: Validates the hierarchy (h1-h6). / Validiert die Hierarchie (h1-h6).
*   **CodeLens**: Shows status directly above the code. / Zeigt den Status direkt über dem Code an.
*   **Quick Fixes**: Automatically fix common issues. / Behebt häufige Probleme automatisch.
*   **Bilingual / Zweisprachig**: Supports English and German. / Unterstützt Englisch und Deutsch.

---

## 🛠️ Development Guide / Entwicklungsleitfaden

This guide explains how to add a new check (rule) for a tag or attribute cleanly.
Dieser Leitfaden erklärt, wie man sauber eine neue Prüfung (Regel) für einen Tag oder ein Attribut hinzufügt.

### 1. Create a new Rule File / Erstelle eine neue Regel-Datei

Create a new file in `src/rules/`, e.g., `src/rules/my-new-rule.ts`.
Erstelle eine neue Datei in `src/rules/`, z. B. `src/rules/my-new-rule.ts`.

```typescript
import { A11yRule, RuleContext } from "../types";
import { HtmlNode } from "../html-types";
import { getLanguage } from "../language";

export const myNewRule: A11yRule = {
  id: "my-new-rule", // Unique ID / Eindeutige ID

  // OPTION A: Check specific attributes on a single node
  // OPTION A: Prüfe spezifische Attribute an einem einzelnen Knoten
  check(node: HtmlNode, context: RuleContext) {
    if (node.tagName !== "div") return; // Target tag / Ziel-Tag

    const lang = getLanguage();
    // Check logic / Prüflogik
    const hasRole = node.attributes.some(a => a.name === "role");
    
    if (!hasRole) {
      context.report({
        message: "Missing role",
        description: "Div needs a role.",
        range: node.range
      });
    }
  },

  // OPTION B: Check document structure (e.g. count tags)
  // OPTION B: Prüfe Dokumentenstruktur (z. B. Tags zählen)
  checkDocument(nodes: HtmlNode[], context: RuleContext) {
    // Traverse nodes recursively to count or find relations
    // Durchlaufe Knoten rekursiv, um zu zählen oder Beziehungen zu finden
  }
};
```

### 2. Add Localization / Füge Lokalisierung hinzu

Add your messages to `src/languages/en.json` and `src/languages/de.json`.
Füge deine Nachrichten zu `src/languages/en.json` und `src/languages/de.json` hinzu.

```json
"myNewRule": {
  "title": "⚠️ Issue found",
  "description": "Description of the issue."
}
```

### 3. Register the Rule / Registriere die Regel

Open `src/extension.ts` and add your rule to the `rules` array.
Öffne `src/extension.ts` und füge deine Regel zum `rules`-Array hinzu.

```typescript
import { myNewRule } from "./rules/my-new-rule";

// ...

const rules: A11yRule[] = [imgAltRule, mainTagRule, myNewRule]; // Add here / Hier hinzufügen
```

### 4. (Optional) Add Quick Fix / (Optional) Füge Quick Fix hinzu

If you want to offer an automatic fix, update `src/quickfix.ts`.
Wenn du eine automatische Korrektur anbieten möchtest, aktualisiere `src/quickfix.ts`.

1.  Open `src/quickfix.ts`. / Öffne `src/quickfix.ts`.
2.  In `provideCodeActions`, check for your `diagnostic.code`. / Prüfe in `provideCodeActions` auf deinen `diagnostic.code`.
3.  Implement a private method to create the `CodeAction`. / Implementiere eine private Methode, um die `CodeAction` zu erstellen.

### 5. (Optional) Add CodeLens / (Optional) Füge CodeLens hinzu

Update `src/codelens.ts` to display a specific message for your tag.
Aktualisiere `src/codelens.ts`, um eine spezifische Nachricht für deinen Tag anzuzeigen.

1.  Open `src/codelens.ts`. / Öffne `src/codelens.ts`.
2.  Add a condition for your tag in `provideCodeLenses`. / Füge eine Bedingung für deinen Tag in `provideCodeLenses` hinzu.

---

## 📂 Project Structure / Projektstruktur

*   `src/extension.ts`: Main entry point & rule registration. / Haupteinstiegspunkt & Regelregistrierung.
*   `src/rules/`: Individual rule logic. / Individuelle Regellogik.
*   `src/languages/`: Localization files. / Lokalisierungsdateien.
*   `src/codelens.ts`: CodeLens provider logic. / CodeLens-Provider-Logik.
*   `src/quickfix.ts`: Quick Fix provider logic. / Quick-Fix-Provider-Logik.