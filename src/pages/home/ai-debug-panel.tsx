import Card from "@/components/Card";
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
    <Card style={{ marginBottom: 22, borderStyle: "dashed" }}>
      <div style={{ color: T.gold, fontSize: 12, fontWeight: 800, marginBottom: 10 }}>AI DEBUG · DEVELOPMENT</div>
      <div style={{ display: "grid", gridTemplateColumns: "150px minmax(0, 1fr)", gap: "7px 12px" }}>
        {rows.map(([label, value]) => (
          <div key={label} style={{ display: "contents" }}>
            <span style={{ color: T.muted, fontSize: 12 }}>{label}</span>
            <span style={{ color: T.white, fontSize: 12, fontFamily: "ui-monospace, monospace" }}>{value}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
