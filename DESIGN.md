# MHK HR Portal · DESIGN.md

> **Enterprise Design System & UI Specification**
> Synthesized from UI/UX Pro Max, Vercel Web Interface Guidelines, Taste Skill (App Screens Chapter), and Awesome DESIGN.md.

---

## 1. Design Philosophy: High-Signal, Low-Slop Enterprise UX

Modern workplace platforms should not look like generic template dashboards splashed with rainbow charts, decorative glows, and noisy ornaments. Instead:

1. **Color goes on data, not chrome.**
   The median enterprise screen contains ≤ 5% colored pixels. Chrome (headers, sidebars, mega menus, container cards) stays calm and neutral. Full saturation is reserved for urgent decision points, status deltas, and actionable states.
2. **KPIs are type, not tiles.**
   Key performance indicators are rendered as clean, high-contrast numerical typography with tabular figures (`font-variant-numeric: tabular-nums`). Avoid embedding tiny icons in colored circles on every stat card.
3. **Flat, high-precision surfaces.**
   Separation between cards, tables, and panels relies on crisp 1px borders (`border-border`), not muddy drop shadows. Elevation is reserved for floating dropdowns, popovers, and command palettes.
4. **Navigation recedes.**
   Navigation elements are quiet and functional. Active navigation is indicated with subtle text contrast or a restrained neutral/accent indicator, letting the worker focus on their primary tasks.
5. **Honest data states.**
   Zeros print as `0`, empty values print as a muted em-dash (`—`), and empty lists keep their structured frame with a helpful next action.

---

## 2. Design Tokens

### 2.1 Color Tokens

```css
:root {
  color-scheme: light;

  /* Surfaces & Canvas */
  --bg: #F8F9FB;              /* Light canvas */
  --surface: #FFFFFF;         /* Primary container card */
  --surface-muted: #F1F4F9;   /* Input backgrounds, sub-panels */

  /* Typography */
  --text: #0F172A;            /* Slate-900: High-contrast primary text */
  --text-secondary: #475569;  /* Slate-600: Secondary text */
  --text-tertiary: #64748B;   /* Slate-500: Micro-labels, hints, borders */

  /* Borders */
  --border: #E2E8F0;          /* 1px structural dividing lines */
  --border-strong: #CBD5E1;   /* Hover and active borders */

  /* Brand & Accents */
  --primary: #2563EB;         /* Modern enterprise blue */
  --primary-hover: #1D4ED8;
  --primary-pressed: #1E40AF;
  --primary-50: #EFF6FF;
  --primary-100: #DBEAFE;
  --primary-300: #93C5FD;

  --magenta: #582467;         /* Zia / Admin accent */
  --magenta-50: #F7F0FD;
  --spark: #EE0014;           /* Alert & notification red */
  --spark-50: #FDF1F2;
}

html.dark,
.dark {
  color-scheme: dark;

  /* Deep Canvas & Surfaces */
  --bg: #0B0F19;              /* Deep slate/navy ground */
  --surface: #111827;         /* Elevated surface card */
  --surface-muted: #1A2234;   /* Recessed surface / input bg */

  /* Typography */
  --text: #F8FAFC;            /* Slate-50: High-contrast light text */
  --text-secondary: #94A3B8;  /* Slate-400: Secondary text */
  --text-tertiary: #64748B;   /* Slate-500: Hints, icons */

  /* Borders */
  --border: #1E293B;          /* 1px dark structural border */
  --border-strong: #334155;   /* Active dark border */

  /* Accents */
  --primary: #38BDF8;         /* High-contrast sky blue */
  --primary-hover: #0EA5E9;
  --primary-pressed: #0284C7;
  --primary-50: rgba(56, 189, 248, 0.12);
  --primary-100: rgba(56, 189, 248, 0.22);

  --magenta: #C084FC;         /* High-contrast violet */
  --magenta-50: rgba(192, 132, 252, 0.14);
  --spark: #F87171;           /* Accessible warning red */
  --spark-50: rgba(248, 113, 113, 0.15);
}
```

### 2.2 Typography Scale

- **Display / Page Title**: 24px–28px, Bold (`font-heading font-bold tracking-tight text-wrap: balance`)
- **Section Heading**: 18px–20px, Bold (`font-heading font-bold`)
- **Card Title / Subhead**: 14px–15px, Semibold
- **Body Text**: 13px–14px, Regular (`line-height: 1.5`, `color: var(--text)`)
- **Micro-label**: 11px, Semibold, Uppercase (`letter-spacing: 0.05em`, `color: var(--text-secondary)`)
- **KPI Metrics**: 28px–32px, Bold, `font-variant-numeric: tabular-nums`

---

## 3. Vercel Web Interface Guidelines Compliance

### 3.1 Accessibility (A11y)
- **Visible Focus States**: Every interactive element must exhibit a visible focus ring (`focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 focus-visible:outline-none`). Never strip focus rings with `outline-none` alone.
- **Icon Buttons**: Icon-only buttons (such as notifications, dismissals, modal close triggers) must include an explicit `aria-label`.
- **Keyboard Navigation**: Modals and dropdowns must close on `Escape`. Command palette opens on `⌘K` / `Ctrl+K`.

### 3.2 Forms & Inputs
- **Autocompletion & Names**: Inputs require semantic `name`, `autoComplete`, and `spellCheck={false}` for codes, emails, or usernames.
- **Ellipsis**: All search bars, placeholders, and loading text use the typographic horizontal ellipsis (`…`), never three raw periods (`...`).
- **Clickable Labels**: Every label wraps its target control or specifies `htmlFor`.

### 3.3 Typography & Content
- **Non-breaking spaces**: Kept between symbols and shortcuts (`⌘&nbsp;K`, `10&nbsp;MB`).
- **Balanced Headings**: Major page headers use `text-wrap: balance` to eliminate typographic widows.
- **Data Truncation**: Flex containers include `min-w-0` to allow `truncate` to execute properly without overflowing tables or lists.

### 3.4 Animation & Motion
- **Reduced Motion**: All animations and transitions respect `prefers-reduced-motion: reduce`.
- **Snappy Durations**: Micro-interactions range from 150ms to 200ms using `easeOut` curves.

---

## 4. UI/UX Pro Max Pre-Delivery Checklist

- [x] Minimum 4.5:1 contrast ratio across body text and status indicators in both Light and Dark themes.
- [x] No raw emojis used as system icons; SVG vector icons (Lucide) applied across all notifications, birthdays, and badges.
- [x] Tabular numbers applied to dates, timestamps, currencies, and counts.
- [x] Touch targets measure at least 44×44px or provide sufficient padding.
- [x] Keyboard focus visible across all interactive cards, dropdown items, tabs, and buttons.
- [x] Seamless Light and Dark mode synchronization honoring system settings and local preference.
