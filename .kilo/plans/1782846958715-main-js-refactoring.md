# Refactoring Plan for src/main.js

## Overview

The `src/main.js` file handles multiple concerns that should be extracted into reusable Web Components following the existing patterns in `search-settings.js` and `favorites-manager.js`.

---

## Completed Components

### 1. ClearButton Component (`<clear-button>`) ✅

- Created `src/components/clear-button/clear-button.js`
- Created `tests/unit/clear-button.test.js`
- Updated `index.html` to use `<clear-button>`
- Updated `main.js` to use attribute `input-has-content` instead of inline style

### 2. JourneyCard Component (`<journey-card>`) ✅

- Created `src/components/journey-card/journey-card.js`
- Created `tests/unit/journey-card.test.js`
- Updated `main.js` `displayJourneysBoard()` to use `<journey-card>`

---

## Remaining Refactoring Opportunities

### 3. AutoComplete Component (`<auto-complete>`)

**Current Location:** `main.js` lines 279-340 (`initAutocomplete` function)  
**HTML Reference:** `index.html` lines 57-64 (`.autocomplete-container`)

**Rationale:** A generic autocomplete component provides reusable dropdown UI that accepts items via property/attribute assignment or custom events, remaining decoupled from data-fetching logic. This enables reuse across contexts (stations, cities, saved searches) without duplicating fetching code.

**Implementation:**
- Create `src/components/auto-complete/auto-complete.js`
- Shadow DOM with internal input, clear button slot, dropdown container
- Attributes/Properties: `placeholder`, `value`, `items` (array of {id, label})
- Events: `item-selected` (detail: { id, label }), `clear`
- CSS: Uses `InjectIcon` pattern from existing components

**Test File:** `src/components/auto-complete/auto-complete.test.js`

**Note:** Station API integration remains in main.js, passing results to the component via the `items` property.

---

### 4. IconInjector Utility (Not a Component)

**Current Location:** `main.js` lines 28-53 (`injectIcons`)  

**Rationale:** Icon injection is a utility that runs on page load. Keep as utility but consider making it more generic to handle dynamic icon updates.

**Implementation:**
- Extract to `src/utils/icon-injector.js`
- Export `injectIcons()` and potentially `updateIcon(element, name, options)`

---

### 5. Navigation Utility (Not a Component)

**Current Location:** `main.js` lines 407-435 (`initNavigationRouter` and `transitionToScreen`)  

**Rationale:** Screen transition logic is generic but tied to specific DOM structure. Consider extracting to `src/utils/navigation.js` for cleaner imports, but keep as utility since it's app-structure-specific.

**Implementation:**
- Extract to `src/utils/navigation.js`
- Export `initNavigationRouter()` and `transitionToScreen()`
- Import in main.js for cleaner separation

---

### 6. HeaderActions Component (`<header-actions>`)

**Current Location:** `index.html` lines 38-53 (header with route display, quick-fav button, settings button)  

**Rationale:** The header with route display and action buttons is a consistent pattern across views. Could be componentized for consistency.

**Implementation:**
- Create `src/components/header-actions/header-actions.js`
- Shadow DOM including: route display, favorite toggle button
- Events: `settings-click`, `favorite-click`

---

### 7. RefreshButton Component (`<refresh-button>`)

**Current Location:** `index.html` lines 77-81 (`#manual-refresh-btn`)  

**Rationale:** Simple but follows a consistent button pattern. Could be extracted for reuse or dynamic styling.

---

## Validation Steps

- Run existing tests after each component extraction
- Verify `npm run build` produces expected output
- Check bundle size impact in Vite build output
- Manual QA on mobile viewports