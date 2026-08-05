# Repository Guidelines

## Project Structure & Module Organization

Where Am I is a dependency-free Chrome extension built with Manifest V3. `manifest.json` declares permissions and entry points. Runtime code lives under `src/`: `background/background.js` owns badge and matching behavior, `content/content.js` injects page indicators, `popup/` contains the toolbar UI, and `options/` contains the configuration page. Static extension icons are in `icons/`. Keep component-specific HTML, CSS, and JavaScript together in their existing directories.

Environment records are stored in `chrome.storage.sync` under `environments`. URL and cookie matching affects several components; when changing that behavior, keep the background, content, and popup flows consistent. The first matching environment wins.

## Build, Test, and Development Commands

- `make zip` removes any old package and creates `where-am-i.zip` from `manifest.json`, `icons/`, and `src/`.
- `make clean` removes the generated archive.
- `npm test` is currently a placeholder that exits with an error; do not treat it as a validation command.

There is no compilation or dependency-install step. For local development, open `chrome://extensions/`, enable Developer Mode, choose **Load unpacked**, and select the repository root. Reload the extension after each change.

## Coding Style & Naming Conventions

Use four-space indentation in JavaScript and CSS, semicolons in JavaScript, and single quotes for JavaScript strings unless interpolation or embedded markup makes another form clearer. Prefer `camelCase` for variables and functions, `UPPER_SNAKE_CASE` for constants, and kebab-case for CSS classes and file names. Keep UI text in Brazilian Portuguese to match the existing interface. No formatter or linter is configured, so follow nearby code and keep diffs focused.

## Testing Guidelines

Automated tests and coverage thresholds are not configured. Manually verify changes in Chrome: URL substring and `/regex/` matching, optional cookie matching, extension enable/disable behavior, badge updates, all three indicator types, popup editing, and options-page CRUD. Check the service-worker console and page console for errors. Include exact manual test steps in the pull request.

## Commit & Pull Request Guidelines

Recent history uses short subjects such as `feat: manter posição do balão` and `add: processo de build`. Follow that concise, imperative `type: description` pattern; use a focused type such as `feat`, `fix`, `docs`, or `add`. Pull requests should explain the user-visible change, list validation performed, link related issues, and include screenshots or a short recording for popup, options, or indicator changes. Call out any new Chrome permission explicitly.
