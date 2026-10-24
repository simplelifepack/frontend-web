import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { Text, Heading, Stack, Row, LinearProgress, typography } from "@/design-system";
import { landingBrand as C } from "@/design-system/variables/brand";
import { BrandMark } from "../BrandLogo";
import { ShieldCheck, HeartPulse, Search, Lock, Wallet, Mail, HardDrive, Check, CalendarClock, Pill, FlaskConical, UploadCloud, Sparkles, FileText, Plane, Briefcase, Stamp, Landmark, X } from "lucide-react";

export function WealthMock() {
  const rows = [
    { n: "Investment statement", v: "$4.2M", ok: true },
    { n: "Life insurance", v: "$10.0M", ok: false },
    { n: "Property deed", v: "$18.5M", ok: true },
  ];
  return (
    <div className="lp-mock" style={{ padding: 18 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          marginBottom: 14,
        }}
      >
        <div>
          <Text as="div" size="sm" tone="muted" style={{ color: C.muted }}>
            Documented value
          </Text>
          <Text as="div" size="lg" weight="semibold" style={{ color: C.ink }}>
            $32.7M
          </Text>
        </div>
        <Text
          size="sm"
          weight="semibold"
          style={{
            color: C.clay,
            background: C.clay + "16",
            border: `1px solid ${C.clay}33`,
            borderRadius: 20,
            padding: "4px 10px",
          }}
        >
          1 nominee gap
        </Text>
      </div>
      <div style={{ display: "grid", gap: 7 }}>
        {rows.map((r) => (
          <div
            key={r.n}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 11,
              background: C.panel2,
              border: `1px solid ${C.border}`,
              borderRadius: 10,
              padding: "10px 12px",
            }}
          >
            <span
              style={{
                display: "grid",
                placeItems: "center",
                width: 28,
                height: 28,
                borderRadius: 8,
                background: C.action + "1c",
              }}
            >
              <Wallet
                aria-hidden="true"
                focusable="false"
                size={14}
                color={C.action}
              />
            </span>
            <Text size="md" weight="semibold" style={{ flex: 1, color: C.ink }}>
              {r.n}
            </Text>
            <Text size="md" style={{ color: C.body }}>
              {r.v}
            </Text>
            <Text
              size="sm"
              weight="semibold"
              style={{ color: r.ok ? C.emerald : C.clay }}
            >
              {r.ok ? "nominee" : "add"}
            </Text>
          </div>
        ))}
      </div>
    </div>
  );
}