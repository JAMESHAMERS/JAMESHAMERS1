# infrastructure

Concrete implementations of the ports declared in `domain`/`application` —
typically a Supabase-backed repository (`SupabaseTaskRepository implements
TaskRepository`), built on `@/shared/lib/supabase/{client,server}`.

This is the only layer allowed to import `@supabase/*` directly. Swapping
storage providers later means rewriting this folder, not the rest of the
module.
