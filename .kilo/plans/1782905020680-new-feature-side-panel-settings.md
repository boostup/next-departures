# Settings Side-Panel Implementation Plan

## 1. Component Architecture & DOM Restructuring
* Create a new, standalone `<settings-panel>` Web Component.
* Follow the project's strict file structure by separating the component into `settings-panel.js`, `settings-panel.html` (imported via Vite's `?raw` query), and `settings-panel.css` (imported via `?inline`).
* Implement Shadow DOM encapsulation for the panel to manage its own styling and markup.
* Restructure `index.html` to place `<settings-panel>` as a direct sibling to `<screen-manager>` inside the `.app-layout`.
* Move all settings-related views (`#view-settings`, `#view-settings-favorites`, `#view-settings-filters`, `#view-settings-api-key`) out of the `<screen-manager>` and into the new `<settings-panel>`.

## 2. Navigation & State Management
* Update `<screen-manager>` to only manage its direct descendants by changing `document.querySelectorAll('.view-screen')` to `this.querySelectorAll('.view-screen')`.
* Transfer the `settings-click` event listener from `<screen-manager>` to `<settings-panel>` so the panel handles its own open state.
* The `<settings-panel>` will manage its internal sub-screen navigation, retaining the existing `.view-screen` classes so child screens slide relative to the panel's bounding box.
* Ensure the panel intercepts and handles internal clicks on `.settings-item` and `.back-btn` elements to transition between the main settings screen and its sub-screens.

## 3. Design System & Styling
* The panel container must slide in from the right, using the standardized `0.3s cubic-bezier(0.16, 1, 0.3, 1)` transition.
* The backdrop must be a semi-transparent overlay that dims the main application behind the panel.
* Wrap the panel and internal slide animations in a `@media (prefers-reduced-motion: reduce)` block to comply with accessibility requirements.

## 4. Testing Pipeline (TDD)
* Write a failing test for the `<settings-panel>` component before implementing the UI logic.
* Update `screen-manager.test.js` to reflect that it no longer handles settings navigation.

## 5. Resolution for `favorites-manager` 
* **The Conflict:** When the `favorites-manager` directly targets and manipulates the `#view-settings-favorites` and `#view-board` classes to toggle their `active` states, it completely bypasses the new panel's internal state management. 
* **The Solution:** Because these elements will now be separated—with the board managed by `<screen-manager>` and favorites managed by `<settings-panel>`—we must refactor the `favorites-manager`. Instead of direct class manipulation, it should dispatch a centralized event that explicitly tells the `<settings-panel>` to invoke its `close()` method while simultaneously instructing the `<screen-manager>` to navigate back to the board.