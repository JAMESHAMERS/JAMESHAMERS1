# application

Use-cases that orchestrate `domain` logic through the ports it defines
(e.g. `createTask(input, deps: { tasks: TaskRepository })`). This is where
"what the app does" lives, independent of "how it's stored" or "how it's
displayed".

Depends on: `domain` (types, ports).
Must not depend on: `infrastructure` (a concrete Supabase repository) or
`presentation` (React). The concrete repository is passed in by the caller
(a Server Action or Route Handler in `presentation`/`app`), not imported
here — that's what makes the use-case testable without a database.
