import { ImageResponse } from "next/og";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";
export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        background: "#246747",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <svg width="140" height="140" viewBox="0 0 64 64">
        <path
          d="M32 19c-6-5-13-5-20-3v30c7-2 14-2 20 3 6-5 13-5 20-3V16c-7-2-14-2-20 3Zm0 0v30"
          fill="none"
          stroke="#fff"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <circle cx="48" cy="48" r="7" fill="#F5CF52" />
      </svg>
    </div>,
    size,
  );
}
