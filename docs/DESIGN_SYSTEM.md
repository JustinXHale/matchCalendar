# Match Calendar — Design System

**Status:** Draft v0.1  
**Visual lineage:** MatchReadyTX / Rabbit Hole Apps monochrome system  
**UI framework:** PatternFly React v6

Match Calendar should feel related to MatchReadyTX without copying its scheduling/admin density.

---

## 1. Design intent

Keywords:

- direct
- practical
- high contrast
- calm
- field-ready
- mobile-first
- low distraction

The app should feel like a useful personal tool, not an enterprise operations dashboard.

---

## 2. Foundations inherited from MatchReadyTX

Keep:

- PatternFly React v6
- semantic CSS token approach
- monochrome brand
- light/dark support
- borders in place of decorative shadows
- high-contrast focus
- generous tap targets
- mobile-first cards and stacked pages
- red reserved for urgency/destructive meaning

Do not import MatchReadyTX-specific role colors, scheduler density, confirmation chips, or admin layouts unless Match Calendar has the same need.

---

## 3. CSS architecture

Recommended:

```text
src/styles/
  tokens.css
  theme-high-contrast.css
  shell/
    base.css
    masthead.css
    bottom-nav.css
    layout.css
    forms.css

src/features/
  agenda/agenda.css
  calendar/calendar.css
  matches/matches.css
  history/history.css
  tournaments/tournaments.css
```

Global styles import once from the app entry. Feature CSS should live beside the feature when practical.

Do not introduce Tailwind.

---

## 4. Token rules

Use three layers:

1. literal palette values only in `tokens.css`
2. semantic `--rs-color-*`, `--rs-space-*`, `--rs-radius-*` tokens
3. PatternFly global token overrides where appropriate

Do not use raw hex values in feature/component CSS.

Suggested semantic token set:

```css
--rs-color-bg
--rs-color-surface
--rs-color-surface-muted
--rs-color-ink
--rs-color-muted
--rs-color-border

--rs-color-primary
--rs-color-on-primary

--rs-color-danger
--rs-color-on-danger
--rs-color-success
--rs-color-warning

--rs-space-xs
--rs-space-sm
--rs-space-md
--rs-space-lg
--rs-space-xl

--rs-radius-sm
--rs-radius-md
--rs-radius-lg

--rs-page-pad
--rs-tap-min
--rs-bottom-clearance
```

Reuse existing MatchReadyTX token names where they already mean the same thing.

---

## 5. Color behavior

### Default

Monochrome carries hierarchy:

- canvas: near-white / near-black by scheme
- surface: white / dark surface
- primary text: black / white
- muted text: grey
- borders: visible neutral grey

### Accent

Use red only for:

- destructive actions
- cancelled/critical status
- errors requiring attention

Do not use red merely to decorate selected navigation.

Use success/warning colors sparingly and always pair with text/icon semantics.

---

## 6. Elevation

Default: no decorative box shadows.

Use:

- border
- spacing
- surface contrast
- section separation

Cards should feel crisp rather than floating.

---

## 7. Typography

Use the existing MatchReadyTX / PatternFly-compatible type foundation unless branding changes.

Hierarchy:

- large date/time only when it answers the user's immediate question
- strong match/title line
- body text readable at mobile sizes
- muted metadata visually secondary
- all-caps section labels used sparingly

Avoid tiny metadata.

---

## 8. Spacing and tap targets

- page padding based on token, approximately the existing MatchReadyTX `0.75rem` approach
- use tokenized spacing, not ad hoc pixel values
- minimum touch target about 48px
- allow enough bottom clearance above fixed nav

Forms should not feel compressed just because MatchReadyTX screens can be dense.

---

## 9. Cards

### Agenda hero

More prominent than ordinary match rows.

Should emphasize:

- when
- what
- where
- position

Optional pay is secondary.

### Standard match row/card

Dense enough to scan, but avoid reproducing MatchReadyTX crew/admin columns.

Recommended structure:

- date marker
- core content
- optional trailing metadata/action

### Cancelled

Use clear label + reduced visual priority. Do not rely only on greyed text.

---

## 10. Pills and badges

Use only for information that benefits from compact labeling:

- position
- source
- paid/unpaid
- cancelled

Avoid turning every metadata value into a pill.

---

## 11. Forms

Prefer PatternFly form controls.

Guidelines:

- visible labels
- optional text where useful
- sections for long forms
- helper text only when it prevents confusion
- do not hide required validation until submit
- money inputs include currency context
- expandable optional sections should reopen automatically when data exists

Quick Match should look intentionally lighter than Full Match.

---

## 12. Bottom navigation

Persistent mobile bottom nav:

- Schedule
- Money
- Insights
- About

Profile avatar in the masthead links to `/profile`. Demo toggle sits in the masthead beside the avatar.

Use icon + label.

Selected state must be visible without depending solely on color.

The Add action may float above or sit prominently near the nav, but should not obscure content.

---

## 13. Dark mode

Support the MatchReadyTX pattern:

- dark color scheme class on `<html>`
- semantic tokens invert
- high contrast remains usable
- no red-on-black combinations that fail contrast

Do not create separate component-specific dark palettes when semantic tokens can solve it.

---

## 14. Accessibility

Target strong contrast and PatternFly's accessible defaults.

Requirements:

- focus rings remain visible
- status text accompanies status color
- icon buttons have accessible labels
- form errors bind to fields
- headings are hierarchical
- tap targets meet minimum size
- bottom nav works with keyboard/focus where applicable

---

## 15. Match Calendar vs MatchReadyTX

### Reuse

- visual DNA
- CSS/token architecture
- PatternFly conventions
- high-contrast treatment
- PWA shell patterns

### Simplify

- fewer pills
- fewer columns
- fewer status states
- less operational density
- no role switcher
- no scheduler/team workflow
- no admin dashboard feel

Match Calendar should look like the personal companion product from the same maker, not a reskinned MatchReadyTX screen.
