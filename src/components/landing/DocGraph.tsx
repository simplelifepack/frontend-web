import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { Text, Heading, Stack, Row, LinearProgress, typography } from "@/design-system";
import { landingBrand as C } from "@/design-system/variables/brand";
import { BrandMark } from "../BrandLogo";
import { ShieldCheck, HeartPulse, Search, Lock, Wallet, Mail, HardDrive, Check, CalendarClock, Pill, FlaskConical, UploadCloud, Sparkles, FileText, Plane, Briefcase, Stamp, Landmark, X } from "lucide-react";

export function DocGraph() {
  const cats = [
    { n: "Identity", d: 4, c: C.blue },
    { n: "Finance", d: 4, c: C.action },
    { n: "Insurance", d: 3, c: C.teal },
    { n: "Property", d: 3, c: C.pink },
    { n: "Medical", d: 2, c: C.emerald },
    { n: "Employment", d: 4, c: C.purple },
  ];
  return (
    <div className="lp-mock" style={{ padding: 18 }}>
      <Text
        as="div"
        size="sm"
        tone="muted"
        style={{
          letterSpacing: 2,
          color: C.muted,
          textTransform: "uppercase",
          marginBottom: 14,
        }}
      >
        Document graph
      </Text>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3,1fr)",
          gap: 9,
        }}
      >
        {cats.map((x) => (
          <div
            key={x.n}
            style={{
              background: C.panel2,
              border: `1px solid ${C.border}`,
              borderRadius: 11,
              padding: "12px 13px",
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: 9,
                background: x.c,
                marginBottom: 9,
              }}
            />
            <Text as="div" size="md" weight="semibold" style={{ color: C.ink }}>
              {x.n}
            </Text>
            <Text as="div" size="sm" tone="muted" style={{ color: C.muted }}>
              {x.d} docs
            </Text>
          </div>
        ))}
      </div>
    </div>
  );
}