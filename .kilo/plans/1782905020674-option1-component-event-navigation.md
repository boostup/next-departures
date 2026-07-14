# Option 1: Component-Event Navigation Architecture

## Goal

Eliminate all direct DOM querying for navigation triggers outside their owning components. Every element that initiates a screen transition dispatches a custom event with a `detail.destination` (or `detail.target`) payload. A thin router module or `main.js` subscribes centrally and calls `transitionToScreen()`.

This is the path to take if navigation complexity grows (multiple stacks, nested routers, history integration, conditional gating).

## Constraints

- Preserve all existing custom-event patterns already used in the codebase (`settings-click`, `favorite-click`, `refresh`, `item-selected`, `query-changed`, `clear`, `app-state-changed`).
- Keep `transitionToScreen()` as the single mutation point for `.view-screen` `.active` class toggling.
- No external npm dependencies.
- All event names flow through a single convention: `navigate-to:<dest>` for general navigation, plus backward-compatible aliases where the existing codebase uses semantic names (`settings-click`, `favorite-click`).
- Follow existing component file conventions (Shadow DOM, separate `.html` + `.css`, barrel export).

## Affected Boundaries

- `src/utils/navigation.js` — remove entirely after moving all trigger wiring.
- `index.html` — clean up inline `onclick`-style class targeting if any; minimal structural changes (classes stay, wiring moves).
- `src/main.js` — central event listener registration for `navigate-to:*` events.
- New components: none strictly required, but settings-list items may be promoted to components later.

## Implementation Steps (ordered)

### 1. Define the navigation event contract

Pick one event name schema and apply it consistently across the app:

```
navigate-to:<dest>    — dispatched by any nav trigger; detail: { destination?: string, target?: string }
back-click             — alias for navigate-to with target derived from button `data-target`
```

Add a comment block at the top of `navigation.js` (or a new `src/constants.js` section) documenting the schema so consumers and producers share it.

### 2. Remove `initNavigationRouter()` from the codebase

Delete `src/utils/navigation.js` entirely. Remove its import from `main.js`. This file was the architectural leak.

### 3. Make every navigation trigger dispatch a custom event

#### 3a. Settings gear button (`<header-actions>`)

Already emits `settings-click`. Add a parallel `navigate-to:settings` event (or change the consumer to listen for `navigate-to:settings` and deprecate `settings-click`). Recommended: keep `settings-click` as a semantic alias, add `navigate-to:settings` as the canonical event for the router.

#### 3b. Back buttons

Wrap each `.back-btn` behavior in a small non-component helper if inline, or (preferred later) promote to `<back-button>` web component. For now, keep the markup, remove the `initNavigationRouter` listener, and replace it with inline `onclick`-style dispatch:

```html
<button class="back-btn" onclick="navigateTo('settings')" data-target="settings">
```

or more cleanly, a one-time `querySelectorAll` registration in `main.js` that only attaches the dispatcher:

```js
document.querySelectorAll('.back-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        btn.dispatchEvent(new CustomEvent('navigate-to', {
            detail: { target: btn.dataset.target },
            bubbles: true
        }));
    });
});
```

**Important:** This registration stays in `main.js` (or a new `src/utils/router.js`), not in a component that reaches into light DOM arbitrarily.

#### 3c. Settings list items (`.settings-item`)

Replace the `data-navigate` listener similarly:

```js
document.querySelectorAll('.settings-item').forEach(item => {
    item.addEventListener('click', () => {
        item.dispatchEvent(new CustomEvent('navigate-to', {
            detail: { destination: item.dataset.navigate },
            bubbles: true
        }));
    });
});
```

These wrappers are safe because `.settings-item` and `.back-btn` live in the light DOM.

#### 3d. (Future) Promote settings-list items to components

When a list item gains its own internal state, icon rendering, or selection feedback, extract it to `<settings-nav-item>` with a `destination` attribute and emit `navigate-to:<dest>` internally. Not required now; mark as follow-up.

### 4. Centralize router consumption

In `main.js` (or a new `src/utils/router.js` added by the agent), register a single listener:

```js
window.addEventListener('navigate-to', (e) => {
    const { destination, target } = e.detail;
    const screenId = destination || target;
    if (screenId) transitionToScreen(screenId);
});
```

Replace the per-element listener setup from step 3 with this one router listener. Optionally listen for the semantic aliases (`settings-click`, `back-click`) to maintain backward compatibility during a migration window.

### 5. Update tests

- Remove any tests that assert `navigation.js` behavior.
- Add tests for the new event contract:
  - Event schema validation (`CustomEvent` with expected `detail` shape).
  - Router consumer calls `transitionToScreen` with correct argument for each event variant.
  - `transitionToScreen` itself unchanged (existing assertions pass).

### 6. Update documentation

- `DESIGN_SYSTEM.md` — add a "Navigation Events" subsection describing the `navigate-to:*` contract.
- `README.md` — update developer setup or architecture description if it references `navigation.js` or `initNavigationRouter`.

## Validation Plan

- `npm test` passes (existing + new tests).
- `npm run build` succeeds with no new warnings.
- Manual QA: click every settings-item, every back-btn, and the header-actions gear icon; confirm each transitions to the expected screen.
- Shadow DOM encapsulation spot-check: no new `document.getElementById` or `querySelector` calls that target element IDs inside a component shadow root.

## Risks

- Forgetting to add `bubbles: true` on CustomEvents could break the window-level listener if events are attached to elements that are not shadow roots. Mitigate by always dispatching on `window` explicitly from components, or ensure `bubbles: true` on the event.
- Semantic alias drift: if one component emits `settings-click` and another emits `navigate-to:settings`, the router must listen to both during migration. Remove aliases once all producers are updated.
