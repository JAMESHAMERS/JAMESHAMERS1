import { useId } from "react";

import { cn } from "@/shared/lib/utils";

interface LogoProps {
  className?: string;
}

/**
 * The LifeOS mark: a gradient squircle with a core-and-orbit glyph — a
 * center point (you) held inside an orbit of everything the app tracks
 * around it (tasks, finance, meals, journal, travel...), with one dot
 * riding the ring to keep it from reading as a static bullseye. Same
 * brand hue as `--primary`/`--chart-accent` (see `globals.css`), hardcoded
 * here rather than referencing the CSS variables because this also backs
 * `app/icon.svg` — a static file with no access to the app's token
 * cascade. `useId()` scopes the gradient so multiple instances (sidebar +
 * mobile nav) never collide if both are ever mounted at once.
 */
export function Logo({ className }: LogoProps) {
  const gradientId = useId();

  return (
    <svg
      viewBox="0 0 24 24"
      className={cn("size-6", className)}
      role="img"
      aria-label="LifeOS"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="oklch(0.62 0.19 275)" />
          <stop offset="100%" stopColor="oklch(0.42 0.2 285)" />
        </linearGradient>
      </defs>
      <rect width="24" height="24" rx="7" fill={`url(#${gradientId})`} />
      <circle cx="12" cy="12" r="6" fill="none" stroke="white" strokeOpacity="0.55" strokeWidth="1.4" />
      <circle cx="12" cy="12" r="2.6" fill="white" />
      <circle cx="17.1" cy="8.2" r="1.5" fill="white" />
    </svg>
  );
}
