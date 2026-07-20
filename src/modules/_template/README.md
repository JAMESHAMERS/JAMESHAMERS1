# Module template

Copy this folder to `src/modules/<name>` when starting a new life domain
(tasks, habits, finance, journal, goals...). Delete this README from the
copy and replace the four sub-READMEs with real code as you go — they only
exist here to document the convention.

## Dependency rule

```
presentation  →  application  →  domain
infrastructure → (implements ports declared in domain/application)
```

Arrows mean "is allowed to import from". Nothing in `domain` may import from
`application`, `infrastructure`, or `presentation`. Nothing in `application`
may import from `infrastructure` or `presentation` directly — it depends on
*interfaces* that `infrastructure` implements, and receives the concrete
implementation via dependency injection (a function/constructor argument),
never a direct import of a Supabase client.

## Wiring a module into the app

1. Add routes under `src/app/[locale]/(dashboard)/<name>/` that import only
   from this module's `presentation` layer.
2. Add an entry to `src/shared/config/nav.ts` so it shows up in the sidebar.
3. Add message namespaces under `src/shared/i18n/messages/{en,vi}/` and
   register them in `src/shared/i18n/request.ts`.
4. If the module needs new tables, add a migration under
   `supabase/migrations/`.

## What does *not* belong in `src/modules`

Anything used by more than one module (UI primitives, the Supabase client
factory, the nav config, i18n plumbing) belongs in `src/shared` instead.
When in doubt: if a second module would need to import it from a sibling
module, it's shared, not module-owned.
