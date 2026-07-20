# presentation

React components, hooks, and Server Actions specific to this module. Reads
UI primitives from `@/shared/components/ui` and composed components from
`@/shared/components/composed`, calls into `application` for behavior, and
is the only layer `src/app/**/page.tsx` route files should import from.

Route files under `src/app/[locale]/(dashboard)/<name>/` should stay thin —
essentially `export default function Page() { return <ModuleView />; }` —
with the real component tree living here.
