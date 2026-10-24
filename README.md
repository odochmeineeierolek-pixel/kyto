# Kyto Task (Phase 1)
Lokaler Windows-Desktop-Assistent (Electron, React, TypeScript, SQLite).

## Installation ohne CMD
1. Repo auf GitHub hochladen (Web-Oberfläche: „Add file → Upload files“).
2. Reiter **Actions → Windows Build → Run workflow**. Nach dem Lauf liegt der Installer unter *Artifacts*.
3. Für ein Release: Tag `v0.1.0` anlegen; der Workflow veröffentlicht die EXE automatisch.
Unsigniert: Windows SmartScreen warnt. Code-Signing ist noch nicht eingerichtet.

## Erster Start
Standard-PIN **6894** – muss sofort geändert werden. Die PIN ist nur eine App-Sperre.

## Status
| Modul | Stand |
|---|---|
| PIN-Sperre (scrypt-Hash, Versuchslimit, Zwangsänderung) | umgesetzt, ungetestet auf Windows |
| Permission-Service + 4 Standardwerte, Protokoll, Backend-Regeln | umgesetzt, Unit-Tests vorhanden |
| SQLite + Migrationen | umgesetzt |
| Symbolleiste, Tooltips, KYTO-Kreis (6 Zustände, nur Demo) | umgesetzt |
| PC-Übersicht | nur CPU/RAM |
| Workflow-Builder, KI (Ollama), Sprache, Stimmen, Musik, Plugin Studio, Krypto/Trading/Mining, Einstellungen, Autostart, Updater | **noch nicht umgesetzt** |

Hinweis: Trading, Mining, Plugins und Dateizugriffe haben bisher nur die Regelprüfung (`electron/decide.ts`), keine eigentlichen Funktionen.
