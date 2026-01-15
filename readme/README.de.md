<p align="center">
  <img src="../public/icons/icon-raw.png" alt="APolish Logo" width="400">
</p>

<h1 align="center">APolish</h1>

<p align="center">
  <strong>Polieren Sie Ihren Text mit KI</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-0.8.0-blue" alt="Version">
  <img src="https://img.shields.io/badge/license-MIT-green" alt="License">
  <img src="https://img.shields.io/badge/chrome-extension-red" alt="Chrome">
  <img src="https://img.shields.io/badge/typescript-5.x-blue" alt="TypeScript">
</p>

<p align="center">
  <a href="../README.md">English</a> |
  <a href="README.zh-CN.md">简体中文</a> |
  <a href="README.zh-TW.md">繁體中文</a> |
  <a href="README.ja.md">日本語</a> |
  <a href="README.es.md">Español</a> |
  <a href="README.pt.md">Português</a> |
  <a href="README.fr.md">Français</a> |
  <strong>Deutsch</strong> |
  <a href="README.ru.md">Русский</a> |
  <a href="README.hi.md">हिन्दी</a>
</p>

---

Eine datenschutzorientierte Chrome Extension, die Text auf jeder Webseite mit KI poliert. Wählen Sie Text aus, klicken Sie auf die Polierschaltfläche und erhalten Sie KI-gestützte Verbesserungsvorschläge mit visuellem Vergleich der Unterschiede.

## Funktionen

- **Multi-Anbieter KI-Unterstützung**: Wählen Sie zwischen OpenAI, Claude oder Gemini mit Ihrem eigenen API-Schlüssel
- **Text-Polierung**: Wählen Sie beliebigen Text aus und polieren Sie ihn mit KI
- **Mehrere Voreinstellungen**: Standard-, professionelle, native, vereinfachte oder benutzerdefinierte Prompts
- **Visuelle Unterschiede**: Sehen Sie hervorgehobene Änderungen mit Einfügungen (grün) und Löschungen (rot)
- **Datenschutz zuerst**: Ihr API-Schlüssel bleibt lokal, keine Datenerfassung oder Telemetrie
- **Universelle Kompatibilität**: Funktioniert auf jeder Webseite, einschließlich Gmail, Google Docs und mehr

## Installation

### Aus dem Quellcode

1. Repository klonen:
```bash
git clone https://github.com/changliu0828/apolisher-chrome.git
cd apolisher-chrome
```

2. Abhängigkeiten installieren:
```bash
npm install
```

3. Extension erstellen:
```bash
npm run build
```

4. In Chrome laden:
   - Öffnen Sie `chrome://extensions`
   - Aktivieren Sie "Entwicklermodus"
   - Klicken Sie auf "Entpackte Erweiterung laden"
   - Wählen Sie den `dist`-Ordner aus

## Verwendung

1. **Einrichtung**: Wählen Sie Ihren KI-Anbieter (OpenAI, Claude oder Gemini) und fügen Sie Ihren API-Schlüssel in den Extension-Einstellungen hinzu
2. **Auswählen**: Markieren Sie Text auf einer beliebigen Webseite
3. **Polieren**: Klicken Sie auf die <img src="../public/icons/icon32.png" width="16" height="16" alt="APolish Icon" style="vertical-align: middle;"> Schaltfläche, die erscheint
4. **Überprüfen**: Sehen Sie sich den Unterschiedsvergleich im Modal an
5. **Akzeptieren**: Klicken Sie auf das Häkchen, um die Änderungen anzuwenden

## Konfiguration

Greifen Sie auf die Einstellungen zu, indem Sie auf das Extension-Symbol klicken oder mit der rechten Maustaste klicken und "Optionen" auswählen:

- **KI-Anbieter**: Wählen Sie zwischen OpenAI (GPT-4o Mini), Claude (3.5 Haiku) oder Gemini (2.5 Flash)
- **API-Schlüssel**: Ihr anbieterspezifischer API-Schlüssel (sicher im Chrome-Synchronisierungsspeicher gespeichert)
- **Prompt-Voreinstellungen**: Wählen Sie zwischen Standard, professionell, nativ, vereinfacht oder benutzerdefiniert
- **Maximum Token**: Kontrollieren Sie die Antwortlänge (100-4000 Token, Standard: 2000)

## Technologie-Stack

- **React** + **TypeScript** - UI-Komponenten
- **Vite** - Build-System mit @crxjs/vite-plugin
- **Tailwind CSS** - Styling
- **Chrome Extension Manifest V3** - Extension-Architektur
- **Multi-Anbieter KI**: OpenAI (GPT-4o Mini), Claude (3.5 Haiku) oder Gemini (2.5 Flash)
- **Shadow DOM** - Stil-Isolation für Content-Script

## Entwicklung

```bash
# Abhängigkeiten installieren
npm install

# Entwicklungs-Build (mit HMR)
npm run dev

# Produktions-Build
npm run build

# Linter ausführen
npm run lint

# Typprüfung
npm run type-check
```

## Projektstruktur

```
src/
├── background/      # Service Worker für API-Aufrufe
├── content/         # Content-Script und UI-Komponenten
├── options/         # Einstellungsseite
├── prompts/         # Prompt-Voreinstellungen
├── services/        # Multi-Anbieter KI-Dienste (OpenAI, Claude, Gemini)
├── types/           # TypeScript-Typen
└── utils/           # Hilfsprogramme
```

## Unterstützen Sie dieses Projekt

Wenn Sie apolisher-chrome nützlich finden, ziehen Sie bitte ein Sponsoring in Betracht! Ihre Unterstützung hilft, dieses Projekt kostenlos und Open Source zu halten.

[![Sponsor](https://img.shields.io/badge/Sponsor-%E2%9D%A4-red?style=for-the-badge&logo=github-sponsors)](https://github.com/sponsors/changliu0828)

**Möglichkeiten zur Unterstützung:**
- ⭐ Geben Sie diesem Repository einen Stern
- 💖 [Werden Sie Sponsor](https://github.com/sponsors/changliu0828) (ab $3/Monat)
- 🐛 Melden Sie Fehler und tragen Sie Code bei
- 📢 Teilen Sie es mit anderen, die es nützlich finden könnten

### Sponsoren

Vielen Dank an alle unsere Sponsoren! 🙏

<!-- sponsors --><!-- sponsors -->

*Werden Sie der erste Sponsor und setzen Sie Ihren Namen hier!*

## Lizenz

MIT
