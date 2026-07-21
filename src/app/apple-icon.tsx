import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/**
 * iOS "Add to Home Screen" icon. Built from plain positioned `div`s rather
 * than the raw `<svg>` in `app/icon.svg` — Satori (the renderer behind
 * `ImageResponse`) only partially supports SVG gradients/defs, while plain
 * CSS `linear-gradient` + `border-radius` divs are its well-trodden path
 * for OG-image-style icons. Two more Satori-specific adjustments beyond
 * that: `oklch()` isn't recognized (falls back to black), so the gradient
 * below uses hex approximations of the same brand hue instead of the
 * `--brand` token's actual oklch value; and `inset: 0` is silently
 * ignored (the ring collapsed to a stray dot until this was explicit
 * `top`/`left`/`width`/`height`, with `borderStyle`/`borderWidth`/
 * `borderColor` as longhand rather than the `border` shorthand).
 */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #6D5EF5 0%, #4C3FD1 100%)",
        }}
      >
        <div style={{ position: "relative", width: 90, height: 90, display: "flex" }}>
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: 90,
              height: 90,
              borderRadius: 9999,
              borderStyle: "solid",
              borderWidth: 10,
              borderColor: "rgba(255,255,255,0.55)",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 25,
              left: 25,
              width: 40,
              height: 40,
              borderRadius: 9999,
              background: "white",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: -1,
              left: 68,
              width: 23,
              height: 23,
              borderRadius: 9999,
              background: "white",
            }}
          />
        </div>
      </div>
    ),
    { ...size },
  );
}
