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

## Color tokens

All colors are OKLCH, defined once per mode in `globals.css`:

| Token | Purpose |
|---|---|
| `background` / `foreground` | Page base |
| `card` / `card-foreground` | Surfaces raised above the page |
| `popover` / `popover-foreground` | Floating layers (dropdowns, dialogs) |
| `primary` / `primary-foreground` | Primary actions |
| `secondary` / `secondary-foreground` | Secondary actions |
| `muted` / `muted-foreground` | De-emphasized text/surfaces |
| `accent` / `accent-foreground` | Hover/active states |
| `destructive` / `destructive-foreground` | Dangerous actions |
| `success` / `warning` (+ `-foreground`) | Status colors — added beyond the shadcn default set since a life-management app needs "done"/"at risk" states from day one |
| `border` / `input` / `ring` | Structural lines and focus rings |
| `sidebar*` | Sidebar has its own token set so it can read as a distinct surface from the main canvas in both themes |
| `chart-1..5` | Reserved for future data visualization (finance charts, habit graphs) |

Never hardcode a hex/oklch value in a component — reference the semantic
Tailwind class (`bg-primary`, `text-muted-foreground`, `border-border`).

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

- **`ui/`** — shadcn primitives: `button`, `card`, `input`, `label`,
  `separator`, `avatar`, `badge`, `dialog`, `sheet`, `dropdown-menu`,
  `tabs`, `tooltip`, `scroll-area`, `skeleton`, `select`, `switch`,
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
  - `ThemeToggle`, `LocaleSwitcher` — dropdown controls combining `ui/`
    components with `next-themes` / next-intl state.
  - `PageTransition` — wraps route content in a small fade/slide
    (Framer Motion) on navigation.
- **`providers/`** — `ThemeProvider` (wraps `next-themes`).

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
