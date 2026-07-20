# dashboard module

The authenticated app shell (sidebar, topbar, mobile nav, page-transition
wrapper) — not a life-management domain, so unlike `_template` it has no
`domain`/`application`/`infrastructure` layers, only `presentation`. It has
no business rules of its own; it composes navigation config from
`@/shared/config/nav` and renders whatever module page is routed into it.
