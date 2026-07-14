# Next Departures — Design System

> Design tokens, component patterns, naming conventions, and accessibility guidelines for the Next Departures PWA.

---

## Design Tokens

### Colors

#### Dark Theme (default)
```css
--bg-color: #0d0e12;
--card-color: #161822;
--text-main: #ffffff;
--text-muted: #8a8f9f;
--accent: #47a7f5;
--border-color: rgba(255, 255, 255, 0.08);
--accent-gradient: linear-gradient(135deg, #47a7f5, #2670e8);
--star-active: #ffd700;
--status-error: #ff5252;
--btn-pin: #47a7f5;
--btn-delete: #ff5252;
--focus-ring: rgba(71, 167, 245, 0.6);
```

#### Light Theme
```css
--bg-color: #f4f5f7;
--card-color: #ffffff;
--text-main: #1c1e21;
--text-muted: #606770;
--accent: #007aff;
--border-color: rgba(0, 0, 0, 0.1);
--accent-gradient: linear-gradient(135deg, #007aff, #0056b3);
--star-active: #ffd700;
--status-error: #ff5252;
--btn-pin: #007aff;
--btn-delete: #ff5252;
--focus-ring: rgba(0, 122, 255, 0.6);
```

### Typography

| Property | Value |
|---|---|
| Font stack | `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif` |
| Size scale | `0.7rem`, `0.8rem`, `0.9rem`, `0.95rem`, `1rem`, `1.2rem`, `1.3rem`, `1.4rem`, `1.5rem`, `1.8rem` |
| Weight scale | `400`, `500`, `600`, `700`, `800` |
| Letter spacing | `-0.5px` (headings), `0.5px` (date labels), `0` (body) |
| Line height | Default (inherited) |

### Spacing

Based on a 4px grid increment:

| Value | Rem |
|---|---|
| 4px | 0.25rem |
| 8px | 0.5rem |
| 10px | 0.625rem |
| 12px | 0.75rem |
| 14px | 0.875rem |
| 16px | 1rem |
| 20px | 1.25rem |
| 24px | 1.5rem |
| 40px | 2.5rem |

### Border Radius

| Value | Usage |
|---|---|
| 5px | Badges, small elements |
| 8px | Buttons, inputs |
| 10px | Suggestions dropdown, action buttons |
| 12px | Fav items, cards (small) |
| 14px | Cards, setting groups, refresh button |

### Shadows

| Name | Value |
|---|---|
| Dropdown shadow | `0 10px 25px rgba(0,0,0,0.2)` |
| Card border | `1px solid var(--border-color)` |

### Transitions & Animations

| Name | Value | Usage |
|---|---|---|
| Default ease | `0.2s ease` | Toggle switches, hover effects |
| Screen transition | `0.3s cubic-bezier(0.16, 1, 0.3, 1)` | View screen slides |
| Theme transition | `background-color 0.3s ease, color 0.3s ease` | Dark/light mode |
| Star pop | `0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)` | Favorite button animation |
| Slider switch | `.2s` | Toggle knob |

### Layout

| Property | Value |
|---|---|
| Max width | 420px (mobile), 600px (tablet) |
| Centering | `display: flex; justify-content: center` on body |
| Full height | `100vh` on `.app-layout` |
| Navigation | Absolute positioning with slide transitions |

---

## Component Patterns

### Settings List Items (`.settings-item`)
```
[icon] [label] .......... [accessory]
```
- Icon: 24px area, flex-aligned
- Label: flex: 1, font-size: 1rem
- Accessory: margin-left: auto, display: flex, muted color
- Selectable: cursor: pointer, border-bottom separator
- Last child: no border

### Journey Cards (`.journey-card`)
```
[time-area] ................. [details]
  departure (1.8rem bold)      badge (mode + number)
  → arrival (0.8rem muted)     badge (terminus)
  ⏱ duration (0.8rem muted)    [status-delayed]
```
- Background: `var(--card-color)`
- Border: `1px solid var(--border-color)`
- Border-radius: 14px
- Padding: 16px
- Flexbox, space-between layout

### Toggle Switches (`.switch` + `.slider`)
- Width: 44–46px, height: 24–26px
- Slider: pill shape, rounded full
- Thumb: 18–20px circle, white
- Checked: accent gradient background
- Transition: 0.2s ease

### Cards (Generic)
- Background: `var(--card-color)`
- Border: `1px solid var(--border-color)`
- Border-radius: 12–14px

### Buttons
| Class | Style |
|---|---|
| `.icon-btn` | No background, text-muted color, 1.4rem, no border |
| `.action-btn` | Card-color background, border, 44px height, rounded 10px |
| `.action-btn-accent` | Accent gradient background, white text, 44px height |
| `.back-btn` | No background, accent color, 1rem, 500 weight |
| `.refresh-main-btn` | Accent gradient, white, full width, 14px radius, 14px padding |
| `.btn-pin` | Accent tint background, round 8px |
| `.btn-delete` | Red tint background, round 8px |

### Screen Transitions
- All screens start at `transform: translateX(100%)`
- Active screen transitions to `translateX(0)`
- Duration: `0.3s cubic-bezier(0.16, 1, 0.3, 1)`

---

## Naming Conventions

- **BEM-inspired**: Block__element--modifier (kebab-case)
- **Classes**: kebab-case throughout (`.settings-item`, `.item-icon`, `.item-label`, `.view-screen`)
- **IDs**: kebab-case, specific to single elements (`#view-board`, `#quick-fav-btn`, `#dest-input`)
- **Data attributes**: camelCase for values (`data-navigate`, `data-action`, `data-index`, `data-target`)
- **CSS variables**: `--property-name` with `var()` access
- **Icon files**: `icon-name.js` with `iconName()` export
- **Components**: Multi-word, kebab-case HTML tags (`<search-settings>`, `<favorites-manager>`). **Strict Requirement:** Every custom tag *must* include a hyphen (`-`) to guarantee absolute compliance with the W3C Custom Elements specification and prevent native element namespace collisions.

---

## Accessibility

- `-webkit-tap-highlight-color: transparent` on body to remove mobile tap flash
- Touch targets must be ≥44px (applied to all interactive elements)
- `aria-label` usage on icon-only buttons (title attribute as fallback)
- **Keyboard Navigation:** Focusable elements must utilize custom styling bound to `:focus-visible`, referencing `outline: 2px solid var(--focus-ring); outline-offset: 2px;`. Never suppress the default focus outline without applying this token.
- **Reduced Motion:** Always wrap complex or spatial animations (such as `.view-screen` slide transitions or star pop sequences) in a `@media (prefers-reduced-motion: reduce)` block to instantly substitute them with immediate transitions or simple opacity changes.
- Color contrast ratios maintained between text and backgrounds in both themes
- Semantic HTML structure with proper heading hierarchy (h1 per screen)
- Back buttons retain visible text labels alongside icons

---

## Icon System

- **Format**: Single-purpose SVG functions returning template strings
- **Library**: Lucide-style, using `currentColor` for theming
- **File**: One icon per file in `src/icons/`
- **Signature**: `iconName({ size = 24, className = '', filled = false } = {})`
- **Imports**: Barrel export from `src/icons/index.js`
- **Usage**: Called in JS to generate SVG markup, injected via `innerHTML`

---

## File Structure

```
/
├── DESIGN_SYSTEM.md
├── index.html
├── package.json
├── vite.config.js
├── sw.js
├── manifest.json
├── src/
│   ├── main.js             # App bootstrap, journey display
│   ├── style.css            # Global styles + tokens
│   ├── constants.js         # API URLs, default stations
│   ├── state.js             # Reactive state with Proxy
│   ├── icons/               # SVG icon functions
│   │   ├── index.js
│   │   ├── icon-star.js
│   │   ├── icon-cog.js
│   │   ├── icon-map-pin.js
│   │   ├── icon-arrow-left.js
│   │   ├── icon-arrow-right.js
│   │   ├── icon-chevron-right.js
│   │   ├── icon-bus.js
│   │   ├── icon-train.js
│   │   ├── icon-sun.js
│   │   ├── icon-moon.js
│   │   ├── icon-pin.js
│   │   ├── icon-crown.js
│   │   ├── icon-x.js
│   │   ├── icon-clock.js
│   │   ├── icon-refresh.js
│   │   └── icon-search.js
│   ├── utils/               # Shared utilities
│   │   └── icon-injector.js
│   ├── components/
│   │   ├── clear-button/
│   │   │   ├── clear-button.js
│   │   │   ├── clear-button.html
│   │   │   └── clear-button.css
│   │   ├── journey-card/
│   │   │   ├── journey-card.js
│   │   │   ├── journey-card.html
│   │   │   └── journey-card.css
│   │   ├── auto-complete/
│   │   │   ├── auto-complete.js
│   │   │   ├── auto-complete.html
│   │   │   └── auto-complete.css
│   │   ├── header-actions/
│   │   │   ├── header-actions.js
│   │   │   ├── header-actions.html
│   │   │   └── header-actions.css
│   │   ├── refresh-button/
│   │   │   ├── refresh-button.js
│   │   │   ├── refresh-button.html
│   │   │   └── refresh-button.css
│   │   ├── search-settings/
│   │   │   ├── search-settings.js
│   │   │   ├── search-settings.html
│   │   │   └── search-settings.css
│   │   ├── favorites-manager/
│   │   │   ├── favorites-manager.js
│   │   │   ├── favorites-manager.html
│   │   │   └── favorites-manager.css
│   │   ├── settings-panel/
│   │   │   ├── settings-panel.js
│   │   │   ├── settings-panel.html
│   │   │   └── settings-panel.css
│   │   └── screen-manager/
│   │       ├── screen-manager.js
│   │       ├── screen-manager.html
│   │       └── screen-manager.css
│   └── assets/
│       └── (icon PNGs for PWA)
├── tests/
│   └── unit/
│       ├── state.test.js
│       ├── constants.test.js
│       ├── main-utils.test.js
│       ├── main-autocomplete.test.js
│       ├── main-launch.test.js
│       ├── screen-manager.test.js
│       ├── clear-button.test.js
│       ├── journey-card.test.js
│       ├── auto-complete.test.js
│       ├── header-actions.test.js
│       ├── refresh-button.test.js
│       ├── search-settings.test.js
│       ├── favorites-manager.test.js
│       └── settings-panel.test.js
```

_Last updated: 2026-07-03_