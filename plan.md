# Plan: SVG Icons, Animations, Design System & Polish

**TL;DR — Replace all emoji icons with Lucide-style SVG icon functions, add star animation, fix chevron in settings, hide scrollbar on main screen, add journey duration with clock icon to each journey card, and create a DESIGN_SYSTEM.md. No external dependencies, pure vanilla JS/CSS.**

---

## Phases

### Phase A — Design System Doc (no dependencies, parallel-safe)

**Step 1** — Create `DESIGN_SYSTEM.md` at project root
- Document all **design tokens** extracted from current `style.css`:
  - Colors: `--bg-color`, `--card-color`, `--text-main`, `--text-muted`, `--accent`, `--border-color`, `--accent-gradient`, `--star-active` (`#ffd700`), `--status-error` (`#ff5252`), `--btn-pin` (`#47a7f5`), `--btn-delete` (`#ff5252`)
  - Both dark and light theme variants
  - Typography: font stack, size scale (0.7rem–1.8rem), weight scale (500–800), `letter-spacing` values
  - Spacing: 4px grid increments (4, 8, 10, 12, 14, 16, 20, 24, 40px)
  - Border radius scale: 5px, 8px, 10px, 12px, 14px
  - Shadows: dropdown shadow `0 10px 25px rgba(0,0,0,0.2)`
  - Transitions/animations: `0.2s ease` (switches), `0.3s cubic-bezier(0.16, 1, 0.3, 1)` (screen transitions)
  - Layout: max-width 420px centered, full viewport height
- Document **component patterns**:
  - Settings list items (`.settings-item`): icon + label + accessory, selectable
  - Journey cards (`.journey-card`): time-area + details with badges
  - Toggle switches: `.switch` + `.slider` pattern
  - Cards: border + border-radius + card-color background
  - Buttons: `.icon-btn`, `.action-btn`, `.action-btn-accent`, `.back-btn`
  - Screen transitions: slide via `transform: translateX(100%) → 0`
- Document **naming conventions**: BEM-inspired, kebab-case classes, consistent patterns
- Document **accessibility**: `-webkit-tap-highlight-color: transparent`, `aria-label` usage, touch targets ≥44px

---

### Phase B — Icon System (`src/icons/*.js`)

**Step 2** — Create `src/icons/` directory with one file per icon

**Pattern for each icon function:**
```js
// src/icons/icon-star.js
export function iconStar({ size = 24, className = '' } = {}) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="${className}"><path d="..."/></svg>`;
}
```

All icons use `currentColor` for stroke, `size` prop, and optional `className`. Free from any dependency.

**Icons to create (all Lucide-style SVG paths):**

| File | Export | Replaces |
|---|---|---|
| `src/icons/icon-star.js` | `iconStar(filled)` | ☆, ★, ⭐ |
| `src/icons/icon-cog.js` | `iconCog()` | ⚙️ |
| `src/icons/icon-map-pin.js` | `iconMapPin()` | 📍 |
| `src/icons/icon-arrow-left.js` | `iconArrowLeft()` | ◀ |
| `src/icons/icon-arrow-right.js` | `iconArrowRight()` | ➔ |
| `src/icons/icon-chevron-right.js` | `iconChevronRight()` | `chevron` text |
| `src/icons/icon-bus.js` | `iconBus()` | 🚌 |
| `src/icons/icon-train.js` | `iconTrain()` | 🚄 |
| `src/icons/icon-sun.js` | `iconSun()` | 🌓 (light mode) |
| `src/icons/icon-moon.js` | `iconMoon()` | 🌓 (dark mode) |
| `src/icons/icon-pin.js` | `iconPin()` | 📌 |
| `src/icons/icon-crown.js` | `iconCrown()` | 👑 |
| `src/icons/icon-x.js` | `iconX()` | × |
| `src/icons/icon-clock.js` | `iconClock()` | New (journey duration) |
| `src/icons/icon-refresh.js` | `iconRefresh()` | "Actualiser" button |
| `src/icons/icon-search.js` | `iconSearch()` | "OK" button / search |

**Step 3** — Create `src/icons/index.js` that re-exports all icons:
```js
export { iconStar } from './icon-star.js';
export { iconCog } from './icon-cog.js';
// ... etc
```

---

### Phase C — Icon Integration in Static HTML & main.js

**Step 4** — Update `index.html` — Replace all emoji characters with empty icon placeholders:
- `☆` on quick-fav-btn → leave empty, set in JS via icon function
- `⚙️` on settings button → `<span class="icon-placeholder" data-icon="cog"></span>`
- `📍` on locate button → `<span class="icon-placeholder" data-icon="map-pin"></span>`
- `◀` on back buttons → `<span class="icon-placeholder" data-icon="arrow-left"></span>`
- `⭐` on favorites item → `<span class="icon-placeholder" data-icon="star"></span>`  (filled)
- `⚙️` on filters item → `<span class="icon-placeholder" data-icon="cog"></span>`
- `🌓` on theme item → `<span class="icon-placeholder" data-icon="sun-moon"></span>`
- `chevron` text in `.item-accessory` → empty `<span class="icon-placeholder" data-icon="chevron-right"></span>`
- Remove `◀ Retour` text pattern — back buttons get icon + text

**Step 5** — Create a generic icon injection helper in `main.js`:
```js
function injectIcons() {
  document.querySelectorAll('.icon-placeholder').forEach(el => {
    const name = el.dataset.icon;
    const filled = el.dataset.filled === 'true';
    const size = parseInt(el.dataset.size, 10) || 20;
    const iconFn = iconMap[name]; // lookup
    if (iconFn) el.innerHTML = iconFn({ size, filled });
  });
}
```

Call `injectIcons()` in `DOMContentLoaded` init block.

**Step 6** — Update `updateQuickFavBadge()` in `main.js` to use `iconStar({ filled: true/false })` instead of `★/☆` textContent.

**Step 7** — Update `displayJourneysBoard()` in `main.js`:
- Replace 🚌 and 🚄 badge emojis with `iconBus()` / `iconTrain()`
- **Restructure each journey card** to display departure time, arrival time, and journey duration — with the clock icon next to duration only:
  - Add a `computeDuration(departureRawDate, arrivalRawDate)` function that parses the SNCF datetime format (`YYYYMMDDTHHMMSS`) and returns a human-readable string like `"1h 22min"`
  - The clock SVG icon is placed next to the duration, not departure time
  - Journey card time section becomes: **departure time** (big, bold) → **arrival time** (smaller, muted) → **duration with clock icon** (inline flex, muted)
  - Example: `<div class="time-area"> <div class="time">${clockDep}</div> <div class="arrival-time">→ ${clockArr}</div> <div class="duration-row"><span class="duration-icon">${iconClock({ size: 14 })}</span>${duration}</div> </div>`

---

### Phase D — Component Icon Updates (Shadow DOM)

**Step 8** — Update `src/components/search-settings/search-settings.html`:
- Replace `🚌` in "Autoriser les Autocars 🚌" with an inline SVG or `<span class="icon-placeholder">` (but since it's in shadow DOM, need to handle differently)
- Best approach: import icon functions in the component JS and inject during render

**Step 9** — Update `src/components/search-settings/search-settings.js`:
- Import icon functions at top
- In `connectedCallback()`, after rendering, inject icons into shadow DOM

**Step 10** — Update `src/components/favorites-manager/favorites-manager.js`:
- Replace `👑` and `📌` and `×` emojis with icon function calls in the template string
- Import icon functions, use them in `renderList()` `innerHTML` templates

**Step 11** — No changes needed to `src/components/favorites-manager/favorites-manager.html` (it's just a container div)

---

### Phase E — Star Button Micro-Animation

**Step 12** — Add CSS keyframe animation to `src/style.css`:
```css
@keyframes star-pop {
  0% { transform: scale(1); }
  30% { transform: scale(1.4); }
  60% { transform: scale(0.9); }
  100% { transform: scale(1); }
}

.icon-btn.animate-star {
  animation: star-pop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
```

**Step 13** — In `main.js`, add a `triggerStarAnimation()` function that adds the CSS class to quick-fav-btn and removes it after animation ends (`animationend` event). Call it inside the `quickFavBtn` click handler.

---

### Phase F — Settings Chevron Icon

**Step 14** — In `index.html`, replace the text `chevron` in `.item-accessory` with the icon placeholder. In the settings list `.settings-item`, ensure the accessory has proper flex alignment: `margin-left: auto; display: flex; align-items: center;`

**Step 15** — In `src/style.css`, update `.item-accessory` styles:
- Ensure `display: flex; align-items: center;` so the SVG is vertically centered
- Add `margin-left: auto;` if not already pushing to the end

---

### Phase G — Main Screen Scroll & Journey Card Clock Icon

**Step 16** — Add scrollbar hiding CSS to `src/style.css`:
```css
.board-section {
  scrollbar-width: none;       /* Firefox */
  -ms-overflow-style: none;    /* IE/Edge */
}
.board-section::-webkit-scrollbar {
  display: none;               /* Chrome/Safari */
}
```

Add `overscroll-behavior: contain;` for smooth touch scrolling.

**Step 17** — Update journey card template in `displayJourneysBoard()` to show departure, arrival, and duration with clock icon:
```html
<div class="time-area">
  <div class="time">${clockDep}</div>
  <div class="arrival-time">→ ${clockArr}</div>
  <div class="duration-row">
    <span class="duration-icon">${iconClock({ size: 14 })}</span>
    <span>${duration}</span>
  </div>
</div>
```

**Step 18** — Add CSS for `.duration-row` in `src/style.css`:
```css
.journey-card .duration-row {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  color: var(--text-muted);
  margin-top: 4px;
}
.journey-card .duration-icon {
  display: inline-flex;
  align-items: center;
}
```

---

### Phase H — Responsive & Polish

**Step 19** — Review responsive breakpoints in `src/style.css`:
- `@media (min-width: 768px)` — for tablet, maybe increase `max-width: 600px` on `.app-layout`
- `@media (min-width: 1024px)` — for desktop, keep centered but comfortable
- Ensure touch targets are ≥44px (already mostly done)
- Add `input:focus` styles for accessibility
- Add `:focus-visible` outlines

**Step 20** — Update `manifest.json` if needed to reference new icon assets.

---

## Relevant Files

### Files to CREATE:
- `DESIGN_SYSTEM.md` — full design guidelines and token reference
- `src/icons/icon-star.js` — star SVG (filled + outline via prop)
- `src/icons/icon-cog.js` — cog/gear SVG
- `src/icons/icon-map-pin.js` — map pin SVG
- `src/icons/icon-arrow-left.js` — back arrow SVG
- `src/icons/icon-arrow-right.js` — forward arrow SVG
- `src/icons/icon-chevron-right.js` — chevron right SVG
- `src/icons/icon-bus.js` — bus SVG
- `src/icons/icon-train.js` — train SVG
- `src/icons/icon-sun.js` — sun SVG (light theme icon)
- `src/icons/icon-moon.js` — moon SVG (dark theme icon)
- `src/icons/icon-pin.js` — pin SVG
- `src/icons/icon-crown.js` — crown SVG
- `src/icons/icon-x.js` — close/delete SVG
- `src/icons/icon-clock.js` — clock SVG
- `src/icons/icon-refresh.js` — refresh SVG
- `src/icons/icon-search.js` — search/magnifying glass SVG
- `src/icons/index.js` — barrel export of all icons

### Files to MODIFY:
| File | Changes |
|---|---|
| `index.html` | Replace emoji + `chevron` text with `.icon-placeholder` spans; update back button HTML |
| `src/style.css` | Add scrollbar hiding (Phase G), star animation keyframes (Phase E), clock icon styles, `.item-accessory` flex alignment, responsive breakpoints, `.icon-placeholder` inline-flex |
| `src/main.js` | Add `injectIcons()`, update `updateQuickFavBadge()` to use SVG, update `displayJourneysBoard()` with clock icon + SVG badges, add `triggerStarAnimation()`, update `initBoardControls()` |
| `src/components/search-settings/search-settings.js` | Import icons, inject in shadow DOM after render |
| `src/components/search-settings/search-settings.html` | Replace 🚌 with icon placeholder |
| `src/components/favorites-manager/favorites-manager.js` | Import icons, use in `renderList()` templates |
| `manifest.json` | Update icon references if needed |

### Files NOT modified (no changes needed):
- `src/constants.js`
- `src/state.js`
- `src/components/favorites-manager/favorites-manager.html` (just a container)
- `src/components/search-settings/search-settings.css`
- `src/components/favorites-manager/favorites-manager.css`
- `vite.config.js`
- `package.json`
- `sw.js`

---

## Verification

1. Open app, confirm **all emojis replaced** with SVG icons — inspect each screen (board, settings, favorites, filters)
2. Click favorite (star) button — verify **pop animation** plays
3. Navigate to Settings — verify **chevron icon** appears instead of "chevron" text, aligned right
4. Scroll journey list — verify **scrollbar is invisible** but scrolling works (trackpad, touch, wheel)
5. Verify each journey card shows **departure time, arrival time, and duration** — clock icon appears next to **duration** (not departure)
6. Toggle dark/light theme — icons should inherit color via `currentColor`
7. Verify `DESIGN_SYSTEM.md` is comprehensive and accurate
8. Test at mobile (375px), tablet (768px), desktop (1280px) widths
9. `npm run build` — verify Vite build succeeds with no errors

---

## Decisions

- **Icons**: Lucide-style inline SVGs as exported functions from `src/icons/*.js`. Each function returns an SVG string with `size`, `className`, and optional `filled` params. Zero dependencies.
- **Design system doc**: `DESIGN_SYSTEM.md` at project root, updated alongside code changes.
- **Star icon**: Single `iconStar({ filled })` function — returns outline or filled path based on boolean.
- **Theme icon**: Separate `iconSun()` and `iconMoon()` functions, swapped dynamically based on theme state.
- **Back buttons**: Icon + label text retained (accessibility), using `.icon-placeholder` pattern.
- **No new npm dependencies** — everything is vanilla JS/CSS.

---

## Excluded from scope

- Service worker logic (`sw.js`) — unrelated
- API/data layer changes — no functional changes
- PWA manifest icons — no new PNG assets needed
- Unit tests — no testing framework installed

---

## Execution Order

```
Phase A (Step 1)     — DESIGN_SYSTEM.md          [parallel with Phase B]
Phase B (Steps 2-3)  — Icon files                [parallel with Phase A]
Phase C (Steps 4-7)  — Index HTML + main.js       [depends on Phase B]
Phase D (Steps 8-11) — Components                [depends on Phase B]
Phase E (Steps 12-13)— Star animation             [depends on Phase C]
Phase F (Steps 14-15)— Chevron in settings        [depends on Phase C]
Phase G (Steps 16-18)— Scrollbar + clock icon     [depends on Phase C]
Phase H (Steps 19-20)— Responsive polish          [after Phase C]
```
