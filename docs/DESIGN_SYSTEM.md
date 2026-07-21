# Design System

## Stack

- **Tailwind CSS v4** — tokens are defined in CSS (`@theme`), not
  `tailwind.config.ts`. There is no Tailwind config file in this project;
  `src/app/globals.css` is the single source of truth for tokens.
- **shadcn/ui (New York style, Radix primitives)** — components are
  generated source, not an npm dependency: they live in
  `src/shared/components/ui` and are meant to be edited directly.
  `components.json` records the conventions (aliases, style, base color) so
  the `shadcn` CLI can still add new components consistently later.

## Brand

- **Mark** — `src/shared/components/composed/logo.tsx` (`<Logo />`): a
  gradient squircle with a core-and-orbit glyph (a center dot inside a
  ring, with one dot riding the ring). Reads as "everything tracked
  around one center point" without leaning on a literal task-list/
  calendar icon that would bias toward one module over the others.
  Replaces the plain "L"-in-a-box placeholder used through the Analytics
  phase. Used in `Sidebar`/`MobileNav`; the Topbar's user avatar and
  primary buttons pick up the same hue automatically via `--primary`.
- **App icons** — `src/app/icon.svg` (browser tab, reuses the exact mark)
  and `src/app/apple-icon.tsx` (iOS home screen, code-generated via
  `next/og`'s `ImageResponse`/Satori). The two aren't pixel-identical:
  Satori doesn't reliably parse `oklch()` colors or the `inset` CSS
  shorthand, so `apple-icon.tsx` redraws the same shapes with explicit
  `top`/`left`/`width`/`height`, longhand `border*` properties, and hex
  approximations of the brand hue — see the comment in that file before
  copying its pattern elsewhere.
- **`--brand`** (`globals.css`) — one indigo/violet hue (OKLCH hue 275),
  the single source every brand-colored token below derives from.
- Adding `apple-icon`/`icon` as code-generated (extension-less) routes
  under `app/` requires listing them in `src/proxy.ts`'s middleware
  matcher exclusion — next-intl's default matcher only skips paths with
  a dot (`favicon.ico`, `icon.svg`), not extension-less generated routes,
  so without the exclusion they get redirected under a locale prefix and
  404. `apple-icon` is already excluded; add any future one the same way.

## Color tokens

All colors are OKLCH, defined once per mode in `globals.css`:

| Token | Purpose |
|---|---|
| `background` / `foreground` | Page base |
| `card` / `card-foreground` | Surfaces raised above the page |
| `popover` / `popover-foreground` | Floating layers (dropdowns, dialogs) |
| `primary` / `primary-foreground` | Primary actions — the brand hue (`--brand`), not a neutral, since Analytics/Assistant |
| `secondary` / `secondary-foreground` | Secondary actions |
| `muted` / `muted-foreground` | De-emphasized text/surfaces |
| `accent` / `accent-foreground` | Hover/active states |
| `destructive` / `destructive-foreground` | Dangerous actions |
| `success` / `warning` (+ `-foreground`) | Status colors — added beyond the shadcn default set since a life-management app needs "done"/"at risk" states from day one |
| `border` / `input` / `ring` | Structural lines and focus rings — `ring` is brand-tinted (low chroma) rather than plain gray |
| `sidebar*` | Sidebar has its own token set so it can read as a distinct surface from the main canvas in both themes; `sidebar-primary`/`sidebar-accent-foreground` pick up the brand hue for the active nav item |
| `chart-1..5` | Multi-series data visualization (e.g. a legend of categories). Deliberately different hues per mode, like the rest of the shadcn chart palette — good for series variety, not for a single metric that needs to look the same in both themes. |
| `chart-accent` | Same value as `--primary`/`--brand` — this token predates the rebrand (it's what `--brand` was extracted from) and is kept as a distinct name for chart call sites that want "the brand color" without implying "primary action". |

Never hardcode a hex/oklch value in a component — reference the semantic
Tailwind class (`bg-primary`, `text-muted-foreground`, `border-border`).
The one deliberate exception is `logo.tsx`/`icon.svg`/`apple-icon.tsx`
(see "Brand" above), which can't reach the CSS variable cascade.

## Typography

- Sans: **Inter** (`--font-sans`). Mono: **JetBrains Mono** (`--font-mono`).
  Both are loaded with the `vietnamese` Google Fonts subset in
  `[locale]/layout.tsx` — the create-next-app default (Geist) does not ship
  a Vietnamese subset, so it was swapped out given this app is bilingual
  vi/en from day one.
- Scale: Tailwind's default type scale (`text-sm`, `text-base`, `text-2xl`,
  ...) — no custom scale defined. Page titles use `text-2xl font-semibold`
  (see `PageHeader`), body copy defaults to `text-sm` in muted contexts.

## Spacing & radius

- Spacing: Tailwind's default 4px-based scale — no overrides.
- Radius: one variable, `--radius: 0.625rem`, with `--radius-sm/md/lg/xl`
  derived from it in `@theme inline`. Changing the whole app's corner
  roundness is a one-line edit.

## Component library

`src/shared/components/`:

- **`ui/`** — shadcn primitives: `button`, `card`, `input`, `textarea`,
  `label`, `separator`, `avatar`, `badge`, `dialog`, `sheet`,
  `dropdown-menu`, `popover`, `tabs`, `tooltip`, `scroll-area`, `skeleton`,
  `select`, `switch`, `checkbox`, `progress`, `chart` (recharts wrapper),
  `sonner` (toasts). Installed via the standard shadcn source pattern
  (Radix + `class-variance-authority` + `cn()`), not generated code
  no one has read.
- **`composed/`** — app-specific compositions built from `ui/` primitives:
  - `PageHeader` — title/description/actions row, used at the top of every
    module page.
  - `EmptyState` — icon/title/description/action block; used by every
    module's placeholder page today, and will keep being used for real
    "no items yet" states once modules have data.
  - `StatCard` — metric tile, ready for module dashboards (not wired to
    data yet).
  - `WidgetCard` — icon/title/"view all" shell every dashboard widget is
    built on.
  - `MiniCalendar`, `DatePicker` — share the month-grid math in
    `shared/lib/date-grid.ts`; the former is read-only display, the latter
    adds click-to-select in a `Popover`.
  - `ThemeToggle`, `LocaleSwitcher` — dropdown controls combining `ui/`
    components with `next-themes` / next-intl state.
  - `PageTransition` — wraps route content in a small fade/slide
    (Framer Motion) on navigation.
- **`providers/`** — `ThemeProvider` (wraps `next-themes`).

Module-specific composed components (e.g. `modules/tasks/presentation/components/`)
follow the same rule — built from `ui/`, never one-off markup — but live in
their module, not `shared`, since nothing outside Tasks needs a
`PriorityIcon` or `SubtaskProgress`.

## Motion

Framer Motion is used sparingly and only for polish that shouldn't be
noticed as "an animation": the ~150ms fade/slide in `PageTransition` on
route change. No entrance choreography, no scroll-triggered effects — add
those deliberately per-module if a feature calls for it, not by default.

## Responsiveness

- Sidebar (`Sidebar`) is fixed and visible at `lg:` and up; below that, the
  same nav renders inside a `Sheet` via `MobileNav`, triggered from the
  topbar. There is exactly one source of nav items (`shared/config/nav.ts`)
  feeding both.
- Layout containers use Tailwind's flex/grid utilities with responsive
  prefixes (`sm:`, `lg:`) rather than component-level breakpoint props —
  consistent with Tailwind-first, utility-driven styling throughout.
