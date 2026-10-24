import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { Text, Heading, Stack, Row, LinearProgress, typography } from "@/design-system";
import { landingBrand as C } from "@/design-system/variables/brand";
import { BrandMark } from "../BrandLogo";
import { ShieldCheck, HeartPulse, Search, Lock, Wallet, Mail, HardDrive, Check, CalendarClock, Pill, FlaskConical, UploadCloud, Sparkles, FileText, Plane, Briefcase, Stamp, Landmark, X } from "lucide-react";

function Bar({
  label,
  score,
  color,
}: {
  label: string;
  score: number;
  delay: number;
  color: string;
}) {
  return (
    <Stack $gap="s6">
      <Row $justify="space-between">
        <Text weight="semibold" tone="heading">
          {label}
        </Text>
        <Text tone="muted">{score}%</Text>
      </Row>
      <LinearProgress
        aria-label={label}
        max={100}
        value={score}
        $tone={score >= 90 ? "success" : "action"}
      />
    </Stack>
  );
}
export function ReadinessMock() {
  return (
    <div className="lp-mock" style={{ padding: 20 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 18,
        }}
      >
        <Text
          size="sm"
          tone="muted"
          style={{
            letterSpacing: 2,
            color: C.muted,
            textTransform: "uppercase",
          }}
        >
          Readines
        </Text>
      </div>
      <div style={{ display: "grid", gap: 16 }}>
        <Bar
          label="Travel paperwork"
          score={100}
          delay={0.1}
          color={C.emerald}
        />
        <Bar
          label="Financial checklist"
          score={95}
          delay={0.25}
          color={C.emerald}
        />
        <Bar label="Work transition" score={90} delay={0.4} color={C.emerald} />
        <Bar label="Care visit" score={67} delay={0.55} color={C.action} />
      </div>
    </div>
  );
}