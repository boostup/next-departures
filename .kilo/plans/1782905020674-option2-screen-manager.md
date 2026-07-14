# Option 2: Central `<screen-manager>` Component

## Goal

Replace `navigation.js` with a single `<screen-manager>` web component that owns all `.view-screen` visibility toggling and event-driven navigation. Light-DOM navigation listeners are eliminated; only the component and its direct consumers touch view screens.

This is the recommended path for the current app scale (6 screens, 2 trigger types).

## Constraints

- No external npm dependencies.
- Single source of truth for view transitions: `<screen-manager>` owns the `.active` class logic.
- Preserve backward compatibility for `<header-actions>` custom events (`settings-click`, `favorite-click`) — the component subscribes internally rather than forcing `main.js` to wire both concerns.
- Follow existing component conventions (Shadow DOM, separate `.html` + `.css`, barrel export from component directory).

## Affected Boundaries

- `src/utils/navigation.js` — remove after migration.
- `index.html` — wrap `.view-screen` children with `<screen-manager>` (or swap the parent container).
- `src/main.js` — remove `initNavigationRouter()` and some per-element listeners; rely on `<screen-manager>` events instead.
- New files:
  - `src/components/screen-manager/screen-manager.html`
  - `src/components/screen-manager/screen-manager.css`
  - `src/components/screen-manager/screen-manager.js`
  - `tests/unit/screen-manager.test.js`

## Implementation Steps (ordered)

### 1. Create `<screen-manager>` component

**API surface:**

```js
// Slots accept the view-screen children.
// Events:
//   navigate-to:settings, navigate-to:board, navigate-to:settings-api-key, etc.
// Properties:
//   activeView: string (read/write, reflects current view id like "board", "settings")
```

**Behavior:**

- On `navigate-to:<dest>` (or a generic `navigate` event with detail), the component removes `.active` from all children, then sets `.active` on the matching `#view-<dest>` child.
- It also reads an initial `activeView` attribute/property on connection to set the default view.
- It listens for `settings-click` (emitted by `<header-actions>`) and maps that to `navigate-to:settings` internally, so `main.js` no longer needs to listen for `settings-click` separately.

**File structure:**

```
src/components/screen-manager/
  screen-manager.html
  screen-manager.css
  screen-manager.js
```

Follow the exact template/code-splitting conventions seen in `search-settings` and `favorites-manager`.

### 2. Wrap `.view-screen` children inside `<screen-manager>` in `index.html`

Replace the outer `<div id="app" class="app-layout">` layout in `index.html` so that all `#view-*` divs are slotted inside `<screen-manager>`. Minimal change; the outer `.app-layout` class can either stay on `<screen-manager>` or on a wrapper div above it.

Example transition:

```html
<div class="app-layout">
    <screen-manager>
        <div id="view-api-key" class="view-screen active">...</div>
        <div id="view-board" class="view-screen">...</div>
        ...
    </screen-manager>
</div>
```

`<screen-manager>` grants the CSS transition scope it needs without leaking styles outward.

### 3. Remove `navigation.js` and its import

Delete `src/utils/navigation.js`. Remove the `initNavigationRouter()` call and the import from `main.js`.

### 4. Wire remaining nav triggers to dispatch events on `<screen-manager>`

Because `<screen-manager>` is in the light DOM, any element in the document can dispatch `navigate-to:*` events that the component listens for (event delegation).

Add a small helper in `main.js`:

```js
function dispatchNavigate(destination) {
    const manager = document.querySelector('screen-manager');
    if (manager) {
        manager.dispatchEvent(new CustomEvent('navigate-to', {
            detail: { destination },
            bubbles: true
        }));
    }
}
```

Replace the per-element loop bodies in the old `navigation.js` with thin dispatchers:

```js
document.querySelectorAll('.settings-item').forEach(item => {
    item.addEventListener('click', () => dispatchNavigate(item.dataset.navigate));
});

document.querySelectorAll('.back-btn').forEach(btn => {
    btn.addEventListener('click', () => dispatchNavigate(btn.dataset.target));
});
```

**Still safe:** `.settings-item` and `.back-btn` are light-DOM elements; `document.querySelectorAll` works. The manual `dispatchNavigate` calls now target the `<screen-manager>` instance rather than mutating DOM class state themselves.

### 5. Migrate `<header-actions>` listeners out of `main.js`

Since `<screen-manager>` internally listens for `settings-click` and translates it to `navigate-to:settings`, remove the redundant listener from `main.js` lines 82–83. Keep the `favorite-click` listener on `main.js` (that concern is not navigation).

### 6. Add tests for `<screen-manager>`

Test cases:

- Constructor and shadow-root render.
- `.active` class is set on the child whose id matches `#view-<activeView>`.
- `.active` class is removed from previously active child when switching.
- `navigate-to:settings` custom event transitions to the settings screen.
- `settings-click` event dispatched on the component transitions to settings (alias support).
- Missing destination is a no-op (test defensive behavior).
- Style encapsulation: component CSS does not leak; light-DOM styles do not pierce.

### 7. Cross-reference docs

- `DESIGN_SYSTEM.md` — verify `.view-screen.active` token still matches the component CSS (should, because the class name and structure remain the same).
- `README.md` — if the architecture section mentions `navigation.js` or router setup, update references to `<screen-manager>` and the `navigate-to:*` event contract.

## Validation Plan

- `npm test` passes (existing + new screen-manager tests).
- `npm run build` succeeds; inspect Vite output for bundle size impact (one more JS module, one more CSS chunk — should be negligible).
- Manual QA identical to Option 1: click settings items, back buttons, and header gear; confirm transitions. Confirm that `transitionToScreen()` function in `main.js` can also be removed because `<screen-manager>` now owns this (if `main.js` still calls `transitionToScreen('api-key')` at startup, either keep `transitionToScreen` as a public bridge or have `main.js` dispatch a `navigate-to:api-key` event after `DOMContentLoaded`). **Decision needed:** does the agent remove `transitionToScreen` from `main.js` and replace the startup calls with a dispatch, or keep `transitionToScreen` as a bridge? **Recommended:** remove `transitionToScreen` entirely; replace `transitionToScreen('api-key')` calls in `main.js` with `dispatchNavigate('api-key')`. This removes the last leak of view-management logic out of the component.

## Risks

- If other code outside `main.js` imports `transitionToScreen`, removing it breaks those imports. Mitigate with a grep audit of the codebase before deletion (confirmed: only `main.js` and `navigation.js` import it).
- `<screen-manager>` consuming `settings-click` may surprise future contributors unless documented. Document the aliased event in the component's JS header comments.
