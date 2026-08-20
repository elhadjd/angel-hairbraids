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
          background: "#14110E",
          color: "#F3ECE1",
          padding: 72,
        }}
      >
        <div
          style={{
            display: "flex",
            letterSpacing: "0.4em",
            fontSize: 18,
            color: "#C4A574",
            textTransform: "uppercase",
          }}
        >
          Atlanta · Est. 2014
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
              color: "#D8C09A",
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
