# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

"Where Am I" is a Chrome Extension (Manifest V3) that visually identifies the environment (staging, production, dev) of the current URL. Users configure URL patterns mapped to environment names, colors, and visual indicator types. The UI language is Brazilian Portuguese (pt-BR).

## Development

There is no build step, bundler, or package manager. The extension is plain HTML/CSS/JS loaded directly by Chrome. To develop:

1. Open `chrome://extensions/` with Developer Mode enabled
2. Click "Load unpacked" and select the project root
3. After code changes, click the reload button on the extension card

There are no tests, linters, or CI configured.

## Architecture

### Chrome Extension Components

- **`manifest.json`** — Manifest V3 config. Declares permissions (`storage`, `activeTab`), registers all entry points.
- **`src/background/background.js`** — Service worker. Listens to `tabs.onUpdated` and `tabs.onActivated` to update the extension badge color when a tab URL matches a configured environment.
- **`src/content/content.js`** — Content script injected on all URLs. Applies visual indicators (border, top bar, or floating balloon) to the page based on matched environment config. Listens to `chrome.storage.onChanged` for real-time updates.
- **`src/popup/`** — Extension popup (action click). Shows the current environment for the active tab with view/edit modes. Allows inline registration of new environments.
- **`src/options/`** — Full-page options UI. CRUD table for managing all environment configurations with pagination (10 per page).

### Data Model

All environment configs are stored in `chrome.storage.sync` under the key `environments` as an array of objects:

```js
{
  urlPattern: string,      // plain substring match, or regex if wrapped in /slashes/
  name: string,            // display name (e.g., "Produção", "Staging")
  indicationType: string,  // "borda-completa" | "somente-topo" | "balao"
  color: string,           // hex color (e.g., "#b91c1c")
  borderWidth: string      // CSS value (e.g., "5px")
}
```

### URL Matching Logic

URL matching is duplicated across three files (background, content, popup). The pattern uses: if `urlPattern` starts and ends with `/`, it's treated as a regex; otherwise, it's a simple `url.includes(pattern)` substring match. First match wins.

### Visual Indicator Types

- **`borda-completa`** — Fixed full-viewport border with hover zones showing a tooltip with the environment name.
- **`somente-topo`** — Fixed top bar with hover tooltip.
- **`balao`** — Draggable floating balloon (double-click to minimize). All indicators use `z-index: 2147483647`.
