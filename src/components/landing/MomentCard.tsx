import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { Text, Heading, Stack, Row, LinearProgress, typography } from "@/design-system";
import { landingBrand as C } from "@/design-system/variables/brand";
import { BrandMark } from "../BrandLogo";
import { ShieldCheck, HeartPulse, Search, Lock, Wallet, Mail, HardDrive, Check, CalendarClock, Pill, FlaskConical, UploadCloud, Sparkles, FileText, Plane, Briefcase, Stamp, Landmark, X } from "lucide-react";

import { MomentScene } from "./MomentScene";
export const MOMENTS: {
  kind: "travel" | "care" | "home" | "legacy";
  img?: string;
  title: string;
  body: string;
  chip: string;
  state: "ready" | "progress" | "configured";
  progress?: [number, number];
}[] = [
  {
    kind: "travel",
    title: "Travel documents, ready",
    body: "Identity, financial, and supporting records: assembled and export-ready before you finish your coffee.",
    chip: "Travel pack",
    state: "ready",
  },
  {
    kind: "care",
    title: "Care visit at 2 a.m.",
    body: "Coverage, ID, prescriptions, and reports in one pack, when nobody can think straight.",
    chip: "Care records",
    state: "ready",
  },
  {
    kind: "home",
    title: "Keys to a new place",
    body: "The full checklist, matched against what you already have on file.",
    chip: "Document checklist",
    state: "progress",
    progress: [6, 9],
  },
  {
    kind: "legacy",
    title: "For the day you're not there",
    body: "Every policy, nominee, and access instruction, reaching the right people in one tap.",
    chip: "Family access",
    state: "configured",
  },
];
export function MomentCard({ m, i }: { m: (typeof MOMENTS)[number]; i: number }) {
  return (
    <div className="lp-moment">
      <Text as="div" size="md" className="lp-momentimg">
        {m.img ? (
          <img
            src={m.img}
            alt=""
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
            onError={(e) => (e.currentTarget.style.display = "none")}
          />
        ) : (
          <MomentScene kind={m.kind} />
        )}
      </Text>
      <div style={{ padding: "13px 16px 16px" }}>
        <Text size="md" className="lp-momentchip">
          {m.state === "configured" ? (
            <ShieldCheck
              aria-hidden="true"
              focusable="false"
              size={11}
              color={C.action}
            />
          ) : (
            <Check
              aria-hidden="true"
              focusable="false"
              size={11}
              color={C.action}
            />
          )}
          {m.chip}
          {m.state === "progress" && m.progress ? (
            <>
              <span
                style={{ color: C.muted, fontWeight: "var(--weight-bold)" }}
              >
                {m.progress[0]} of {m.progress[1]}
              </span>
              <span
                aria-hidden
                style={{
                  width: 44,
                  height: 4,
                  borderRadius: 4,
                  background: C.panel2,
                  overflow: "hidden",
                  display: "inline-block",
                }}
              >
                <span
                  style={{
                    display: "block",
                    width: `${(m.progress[0] / m.progress[1]) * 100}%`,
                    height: "100%",
                    background: C.action,
                  }}
                />
              </span>
            </>
          ) : (
            <span style={{ color: C.muted, fontWeight: "var(--weight-bold)" }}>
              {m.state === "configured" ? "configured" : "ready"}
            </span>
          )}
        </Text>
        <Text
          as="div"
          size="lg"
          weight="semibold"
          style={{ color: C.ink, marginTop: 9 }}
        >
          {m.title}
        </Text>
        <Text as="p" size="md" style={{ margin: "6px 0 0", color: C.body }}>
          {m.body}
        </Text>
      </div>
    </div>
  );
}