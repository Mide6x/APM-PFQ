import { ImageResponse } from "next/og";
export const alt =
  "APM PFQ Study Hub — independent lessons, roadmap and practice questions";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "84px",
        background: "#f7f9f7",
        color: "#1e2923",
        borderLeft: "24px solid #246747",
      }}
    >
      <div style={{ fontSize: 28, color: "#246747", marginBottom: 28 }}>
        Independent study companion
      </div>
      <div
        style={{
          fontSize: 72,
          fontWeight: 700,
          lineHeight: 1.1,
          marginBottom: 32,
        }}
      >
        APM PFQ Study Hub
      </div>
      <div style={{ fontSize: 32, lineHeight: 1.4 }}>
        Follow the roadmap. Learn the ideas. Practise with confidence.
      </div>
      <div style={{ fontSize: 24, color: "#56625b", marginTop: 42 }}>
        apmprep.netlify.app
      </div>
    </div>,
    size,
  );
}
