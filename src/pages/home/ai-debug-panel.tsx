import { Card } from "@/design-system";
import { T } from "@/constants/theme";
import type { SearchDebugInfo } from "@/search";

export default function AIDebugPanel({ debug }: { debug: SearchDebugInfo }) {
  const rows = [
    ["Keyword Match", String(debug.keywordMatch)],
    ["AI Called", String(debug.aiCalled)],
    ["Backend Lookup", String(debug.backendLookup)],
    ["Execution Time", `${debug.executionTimeMs} ms`],
  ];
  return (
    <Card style={{ marginBottom: "var(--space-s22)", borderStyle: "dashed" }}>
      <div style={{ color: T.warning, fontSize: "var(--text-sm)", fontWeight: "var(--weight-bold)", marginBottom: "var(--space-s10)" }}>AI DEBUG · DEVELOPMENT</div>
      <div style={{ display: "grid", gridTemplateColumns: "150px minmax(0, 1fr)", gap: "7px var(--space-s12)" }}>
        {rows.map(([label, value]) => (
          <div key={label} style={{ display: "contents" }}>
            <span style={{ color: T.muted, fontSize: "var(--text-sm)" }}>{label}</span>
            <span style={{ color: T.white, fontSize: "var(--text-sm)" }}>{value}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
