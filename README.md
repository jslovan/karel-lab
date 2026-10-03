# 🇺🇸 Karel the Robot - Development environment

Declarative, browser-based learning environment based on the concept of **Karel the Robot** interpreted by **Tau-Prolog**.

The Project is designed for the progressive discovery of computer science – ranging from basic logic and debugging to recursion, graph algorithms, Turing completeness, number theory, and meta-programming.

## 🚀 Key Features

- **Architecture**: Parser (DCG) → Reducer (Structural Operational Semantics) → Diff Engine → UI.
- **Backend-free**: The entire state (world, code, tasks) is stored and shared directly within URL hashes (Base64), making challenge distribution seamless.
- **Internationalization**: Full support for Czech and English via local dictionaries (./locales/), further extensible.
- **Developer-friendly diagnostics**: Hierarchical, direction-neutral syntax error reporting for smooth debugging.

## 📁 File Structure

- `./locales/` – Language files and challenge texts (CZ/EN)
- `./worlds/` – Declarative definitions of maps and worlds in JSON
- `./src/` – Logic engine in Tau-Prolog and UI interface

## 🛠️ Getting Started

Open `index.html` in any modern web browser or visit the live application on GitHub Pages.

----

# 🇨🇿 Robot Karel – Pedagogické vývojové prostředí

Deklarativní, prohlížečové výukové prostředí založené na konceptu **Robot Karel**, poháněné **Tau-Prologem**.

Projekt je navržen pro postupné objevování informatiky – od základní logiky a debuggování přes rekurzi a grafové algoritmy až po meta-programování.

## 🚀 Hlavní vlastnosti

- **Architektura:** Parser (DCG) $\rightarrow$ Reducer (Strukturální operační sémantika) $\rightarrow$ Diff Engine $\rightarrow$ UI.
- **Bez backendu:** Kompletní stav (svět, kód, úlohy) je ukládán a sdílen přímo v URL adresách (Base64 hash), což usnadňuje distribuci výzev.
- **Internacionalizace:** Plná podpora češtiny a angličtiny skrze lokální slovníky (`./locales/`) a dále rozšiřitelná.
- **Přívětivá diagnostika:** Hierarchické, směrově neutrální hlášení syntaktických chyb pro snadné debuggování.

## 📁 Souborová struktura

- `./locales/` – Jazykové soubory a texty výzev (CZ/EN)
- `./worlds/` – Deklarativní definice map a světů v JSONu
- `./src/` – Logic engine v Tau-Prologu a UI rozhraní

## 🛠️ Spuštění

Otevřete `index.html` v libovolném moderním webovém prohlížeči nebo navštivte živou aplikaci na GitHub Pages.
