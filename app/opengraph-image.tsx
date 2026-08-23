import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #1A1024 0%, #6A2B91 55%, #B84592 100%)",
          color: "#F7F3EC",
          padding: 72,
        }}
      >
        <div
          style={{
            display: "flex",
            letterSpacing: "0.4em",
            fontSize: 18,
            color: "#F7F3EC",
            textTransform: "uppercase",
          }}
        >
          Columbus, Ohio · Est. 2014
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 74, lineHeight: 1.05 }}>
            Angel African Hair Braiding
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 24,
              fontSize: 28,
              color: "#F7F3EC",
            }}
          >
            Where African Beauty Meets Modern Style.
          </div>
        </div>
      </div>
    ),
    size,
  );
}
