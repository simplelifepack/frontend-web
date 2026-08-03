import { T } from "@/constants/theme";

export default function Stamp() {
  return (
    <div
      style={{
        transform: "rotate(-9deg)",
        border: `2px solid ${T.mint}`,
        color: T.mint,
        borderRadius: 7,
        padding: "3px 10px",
        fontSize: 12,
        fontWeight: 800,
        letterSpacing: 2,
        fontFamily: "ui-monospace, monospace",
      }}
    >
      READY
    </div>
  );
}
