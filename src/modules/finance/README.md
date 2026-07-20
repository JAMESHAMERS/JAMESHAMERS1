# finance module

Second full 4-layer module, built the same way as `modules/tasks`
(see that module's README for the pattern this one repeats) — same
`domain/repository.ts` port + two implementations, same Zustand-as-
application-layer shape, same "runs on local storage until auth exists"
reasoning.

- `domain/types.ts` — `Transaction` (income/expense/saving/investment),
  `Category` (user-defined, scoped to a transaction type), `Budget`
  (a monthly limit per expense category).
- `domain/rules.ts` — pure functions: monthly breakdown (for the cash-flow
  trend and monthly report), category breakdown (for the donut charts),
  budget progress, search/filter matching. No framework imports.
- `domain/repository.ts` — `FinanceRepository` port.
- `infrastructure/local-finance-repository.ts` — **active today.**
  `localStorage`-backed, seeded with ~4 months of realistic transactions
  (see `seed-data.ts`) so the charts have something to show on first visit.
- `infrastructure/supabase-finance-repository.ts` — production adapter
  against `supabase/migrations/0007_finance.sql` +
  `0009_finance_extended.sql`. Written and ready, not wired in — see
  `docs/ROADMAP.md` Phase 1.
- `application/finance-store.ts` — Zustand store; actions are thin calls
  into the injected `FinanceRepository` followed by a state patch.
- `presentation/` — `FinanceView` (tab switcher: Overview, Transactions,
  Budgets, Reports) plus one file per tab in `tabs/`, and shared editors
  (`TransactionDialog`, `CategoryPicker`, `BudgetDialog`) in `components/`.

Money is always whole currency units (matching the DB's `bigint` amount
column — VND has no minor unit) — never floats, never cents math.
