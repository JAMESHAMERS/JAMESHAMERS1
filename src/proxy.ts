import createIntlProxy from "next-intl/middleware";
import { routing } from "@/shared/i18n/routing";

// Next.js 16 renamed the `middleware` file convention to `proxy`; the
// underlying request-interception behavior next-intl relies on is
// unchanged, so its middleware factory is simply re-exported as the
// default `proxy` export.
export default createIntlProxy(routing);

export const config = {
  // Run on every path except static assets, Next internals, and API routes.
  // `apple-icon` is listed explicitly alongside the dotted-file exclusion:
  // Next serves code-generated icons (`app/apple-icon.tsx`) at the exact
  // path `/apple-icon`, with no file extension, so the `.*\\..*` pattern
  // below doesn't catch it — without this it gets redirected under a
  // locale prefix like any other page and 404s.
  matcher: ["/((?!api|_next|_vercel|apple-icon|.*\\..*).*)"],
};
