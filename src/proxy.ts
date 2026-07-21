import createIntlProxy from "next-intl/middleware";
import { routing } from "@/shared/i18n/routing";

// Next.js 16 renamed the `middleware` file convention to `proxy`; the
// underlying request-interception behavior next-intl relies on is
// unchanged, so its middleware factory is simply re-exported as the
// default `proxy` export.
export default createIntlProxy(routing);

export const config = {
  // Run on every path except static assets, Next internals, and API routes.
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
