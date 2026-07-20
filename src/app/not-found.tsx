import Link from "next/link";

// Fallback for requests that don't reach the `[locale]` segment at all
// (e.g. a completely malformed path). `[locale]/not-found.tsx` handles the
// normal "unknown route inside a valid locale" case and is what users will
// see almost all the time; this file must render its own <html>/<body>
// since no root layout wraps it. Plain `next/link` (not the locale-aware
// wrapper) since there's no locale context this deep in the fallback.
export default function GlobalNotFound() {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif" }}>
        <div
          style={{
            display: "flex",
            minHeight: "100svh",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "1rem",
            textAlign: "center",
            padding: "1.5rem",
          }}
        >
          <h1 style={{ fontSize: "1.5rem", fontWeight: 600 }}>
            Page not found
          </h1>
          <Link href="/">Back to home</Link>
        </div>
      </body>
    </html>
  );
}
