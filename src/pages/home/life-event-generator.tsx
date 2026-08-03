import type { ComponentProps } from "react";
import { Sparkles } from "lucide-react";

import { T } from "@/constants/theme";
import ReadinessSearch from "./readiness-search";

type LifeEventGeneratorProps = ComponentProps<typeof ReadinessSearch>;

export default function LifeEventGenerator(props: LifeEventGeneratorProps) {
  return (
    <section
      style={{
        position: "relative",
        overflow: "hidden",
        borderRadius: 16,
        padding: 24,
        marginBottom: 28,
        background: "#0B0E24",
        border: `1px solid ${T.border}`,
      }}
    >
      <div
        aria-hidden
        style={{
          position: "absolute",
          right: -40,
          top: -55,
          width: 240,
          height: 240,
          background:
            "radial-gradient(circle,rgba(138,107,244,.45),transparent 70%)",
        }}
      />
      <div style={{ position: "relative" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            color: "#C9CEF0",
            fontSize: 13,
            fontWeight: 700,
            marginBottom: 10,
          }}
        >
          <Sparkles size={15} /> Life Event Generator
        </div>
        <h2
          style={{
            color: T.white,
            fontSize: 21,
            fontWeight: 800,
            margin: "0 0 16px",
          }}
        >
          What would you like to prepare for?
        </h2>
        <ReadinessSearch {...props} />
      </div>
    </section>
  );
}
