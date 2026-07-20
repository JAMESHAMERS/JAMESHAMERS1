# settings module

Shell-level preferences (appearance, language). Currently client-side only
via `next-themes` and next-intl's locale routing — nothing is persisted to
`profiles.theme` / `profiles.locale` yet. Wiring persistence through a
`SettingsRepository` (infrastructure) and a use-case (application) is
tracked in `docs/ROADMAP.md`, at which point this module gains the other
three layers.
