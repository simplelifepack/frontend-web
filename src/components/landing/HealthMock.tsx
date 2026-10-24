import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { Text, Heading, Stack, Row, LinearProgress, typography } from "@/design-system";
import { landingBrand as C } from "@/design-system/variables/brand";
import { BrandMark } from "../BrandLogo";
import { ShieldCheck, HeartPulse, Search, Lock, Wallet, Mail, HardDrive, Check, CalendarClock, Pill, FlaskConical, UploadCloud, Sparkles, FileText, Plane, Briefcase, Stamp, Landmark, X } from "lucide-react";

export function HealthMock() {
  const pts = [
    [0, 30],
    [50, 24],
    [100, 40],
    [150, 20],
    [200, 34],
    [250, 12],
    [300, 26],
  ];
  return (
    <div className="lp-mock" style={{ padding: 18 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <Text size="md" tone="muted" style={{ color: C.muted }}>
          HbA1c · recent trend
        </Text>
        <Text
          size="sm"
          weight="semibold"
          style={{
            color: C.red,
            background: C.red + "16",
            border: `1px solid ${C.red}40`,
            padding: "2px 8px",
            borderRadius: 20,
          }}
        >
          above range
        </Text>
      </div>
      <Text as="div" size="lg" weight="semibold" style={{ color: C.ink }}>
        7.2
        <span
          style={{
            fontSize: "var(--text-md)",
            color: C.muted,
            fontWeight: "var(--weight-medium)",
          }}
        >
          {" "}
          %
        </span>
      </Text>
      <svg
        viewBox="0 0 300 60"
        style={{ width: "100%", height: 60, marginTop: 6 }}
      >
        <rect
          x={0}
          y={38}
          width={300}
          height={20}
          fill={C.emerald}
          opacity={0.14}
        />
        <line
          x1={0}
          x2={300}
          y1={38}
          y2={38}
          stroke={C.emerald}
          strokeWidth={1}
          strokeDasharray="3 3"
          opacity={0.6}
        />
        <motion.polyline
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2 }}
          points={pts.map((p) => `${p[0]},${p[1]}`).join(" ")}
          fill="none"
          stroke={C.red}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx={300} cy={26} r={3.5} fill={C.red} />
        <text
          x={298}
          y={34}
          textAnchor="end"
          fontSize={typography.chartLabel}
          fill={C.emerald}
        >
          normal ≤ 5.7
        </text>
      </svg>
      <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
        <Text size="md" className="lp-tag">
          <Pill
            aria-hidden="true"
            focusable="false"
            size={12}
            color={C.purple}
          />{" "}
          3 meds
        </Text>
        <Text size="md" className="lp-tag">
          <FlaskConical
            aria-hidden="true"
            focusable="false"
            size={12}
            color={C.pink}
          />{" "}
          last 3 labs
        </Text>
        <Text size="md" className="lp-tag">
          <CalendarClock
            aria-hidden="true"
            focusable="false"
            size={12}
            color={C.action}
          />{" "}
          visit pack
        </Text>
      </div>
    </div>
  );
}