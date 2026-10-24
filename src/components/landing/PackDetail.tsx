import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { Text, Heading, Stack, Row, LinearProgress, typography } from "@/design-system";
import { landingBrand as C } from "@/design-system/variables/brand";
import { BrandMark } from "../BrandLogo";
import { ShieldCheck, HeartPulse, Search, Lock, Wallet, Mail, HardDrive, Check, CalendarClock, Pill, FlaskConical, UploadCloud, Sparkles, FileText, Plane, Briefcase, Stamp, Landmark, X } from "lucide-react";

export function PackDetail() {
  const inc = [
    "Identity proof",
    "Financial record",
    "Income record",
    "Supporting form",
  ];
  const add = ["Confirmation document"];
  return (
    <div className="lp-mock" style={{ padding: 18 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 14,
        }}
      >
        <span
          style={{
            display: "grid",
            placeItems: "center",
            width: 40,
            height: 40,
            borderRadius: 11,
            background: C.blue + "1c",
          }}
        >
          <Plane
            aria-hidden="true"
            focusable="false"
            size={19}
            color={C.blue}
          />
        </span>
        <div>
          <Text as="div" size="md" weight="semibold" style={{ color: C.ink }}>
            Travel pack
          </Text>
          <Text as="div" size="sm" tone="muted" style={{ color: C.muted }}>
            4 of 5 ready
          </Text>
        </div>
      </div>
      <div style={{ display: "grid", gap: 6 }}>
        {inc.map((x) => (
          <div
            key={x}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              background: C.panel2,
              border: `1px solid ${C.border}`,
              borderRadius: 9,
              padding: "8px 11px",
            }}
          >
            <span
              style={{
                display: "grid",
                placeItems: "center",
                width: 18,
                height: 18,
                borderRadius: 6,
                background: C.emerald + "22",
              }}
            >
              <Check
                aria-hidden="true"
                focusable="false"
                size={11}
                color={C.emerald}
              />
            </span>
            <Text size="md" style={{ color: C.ink }}>
              {x}
            </Text>
          </div>
        ))}
        {add.map((x) => (
          <div
            key={x}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              background: C.clay + "10",
              border: `1px solid ${C.clay}33`,
              borderRadius: 9,
              padding: "8px 11px",
            }}
          >
            <Text
              size="sm"
              weight="semibold"
              style={{
                display: "grid",
                placeItems: "center",
                width: 18,
                height: 18,
                borderRadius: 6,
                background: C.clay + "22",
                color: C.clay,
              }}
            >
              +
            </Text>
            <Text size="md" style={{ color: C.ink }}>
              {x}
            </Text>
          </div>
        ))}
      </div>
    </div>
  );
}