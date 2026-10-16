import { Text, Button, Card, Ring } from "@/design-system";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Bell,
  CheckCircle2,
  ChevronRight,
  Clock,
  FolderOpen,
  HeartPulse,
  Plane,
  ShieldCheck,
  Users,
  Wallet,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import SectionHead from "@/components/SectionHead";
import { A, T } from "@/constants/theme";
import { api, type DocumentRecord, type WealthRecord } from "@/lib/api";
import type { HealthHomeAttention } from "@/lib/api.types";
import { expiryValue } from "@/pages/documents/document-utils";
import { useAppSelector } from "@/store/hooks";
import { documentAttention, healthAttention, daysUntil, medicationAttention, wealthAttention, type HealthMedicationAttention } from "./attention";

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default function HomePage() {
  const navigate = useNavigate();
  const { items: documents, documentCount } = useAppSelector((state) => state.documents);
  const user = useAppSelector((state) => state.auth.user);
  const [healthAttentionData, setHealthAttentionData] = useState<HealthHomeAttention>({ reminders: [], medications: [] });
  const [healthMedications, setHealthMedications] = useState<HealthMedicationAttention[]>([]);
  const [wealthRecords, setWealthRecords] = useState<WealthRecord[]>([]);

  useEffect(() => {
    let active = true;
    void api.health.homeAttention().then((attention) => {
      if (!active) return;
      setHealthAttentionData(attention);
      setHealthMedications(attention.medications);
    }).catch(() => {
      if (!active) return;
      setHealthAttentionData({ reminders: [], medications: [] });
      setHealthMedications([]);
    });
    void api.wealth.records().then((records) => { if (active) setWealthRecords(records); }).catch(() => { if (active) setWealthRecords([]); });
    return () => { active = false; };
  }, []);

  const firstName = user?.name.trim().split(/\s+/)[0] || "there";
  const expiring = useMemo(
    () =>
      documents
        .map((document) => {
          const expiry = expiryValue(document);
          return expiry ? { document, days: daysUntil(expiry) } : null;
        })
        .filter((item): item is { document: DocumentRecord; days: number } => Boolean(item))
        .filter(({ days }) => days < 60)
        .sort((left, right) => left.days - right.days),
    [documents],
  );
  const unknown = useMemo(
    () => documents.filter((document) => document.documentType === "Unknown"),
    [documents],
  );
  const attentionItems = useMemo(() => [
    ...documentAttention(documents),
    ...healthAttention(healthAttentionData.reminders),
    ...medicationAttention(healthMedications),
    ...wealthAttention(wealthRecords),
  ], [documents, healthAttentionData.reminders, healthMedications, wealthRecords]);
  const readiness = documentCount
    ? Math.round(((documentCount - unknown.length) / documentCount) * 100)
    : 0;
  const stats = [
    { label: "Documents", value: documentCount, icon: FolderOpen, color: A.blue, route: "/documents" },
    { label: "Overall readiness", value: `${readiness}%`, icon: ShieldCheck, color: A.green, route: "/packages" },
    { label: "Expiring < 60d", value: expiring.length, icon: Clock, color: T.warning, route: "/documents" },
    { label: "Needs attention", value: attentionItems.length, icon: Bell, color: A.pink, route: attentionItems[0]?.route ?? "/documents" },
  ];
  const insights = [
    {
      icons: [FolderOpen, Plane],
      text: `${documentCount} records are available across your document vault and readiness packages.`,
      route: "/packages",
      tone: A.green,
    },
    {
      icons: [Wallet, ShieldCheck],
      text: expiring.length
        ? `${expiring.length} record${expiring.length === 1 ? "" : "s"} need renewal attention before they affect a package.`
        : "No saved documents currently expire within the next 60 days.",
      route: "/wealth",
      tone: expiring.length ? T.warning : T.mint,
    },
    {
      icons: [Users, HeartPulse],
      text: "Family access, emergency health details, and the wealth handoff stay connected in one protected archive.",
      route: "/trust",
      tone: A.blue,
    },
  ];

  return (
    <div>
      <Text as="div" size="sm" weight="semibold" className="lp-eyebrow">Ready when you need them . private . encrypted storage</Text>
      <SectionHead
        title={`${greeting()}, ${firstName}`}
        sub="Your archive at a glance, and what needs attention today."
        action={null}
      />

      <div   className="lp-home-stats">
        {stats.map(({ label, value, icon: Icon, color, route }) => (
          <button key={label} type="button" className="lp-home-stat" onClick={() => navigate(route)}>
            <span className="lp-home-stat-icon" style={{ background: `color-mix(in srgb, ${color} 13.33%, transparent)` }}>
              <Icon aria-hidden="true" focusable="false" size={17} color={color} />
            </span>
            <strong>{value}</strong>
            <span>{label}</span>
          </button>
        ))}
      </div>

      <div className="lp-cols2">
        <Card flush style={{ overflow: "hidden" }}>
          <div className="lp-action-title">
            <AlertTriangle aria-hidden="true" focusable="false" size="var(--icon-small)" color={attentionItems.length ? T.warning : T.mint} />
            <Text as="b" size="md" weight="semibold">Action center</Text>
            <Text size="md">{attentionItems.length || "all clear"}</Text>
          </div>
          {attentionItems.length ? (
            attentionItems.slice(0, 10).map((action) => (
              <button
                type="button"
                className="lp-action-row"
                key={action.id}
                onClick={() => navigate(action.route)}
              >
                <i style={{ background: action.tone }} />
                <em>{action.module}</em>
                <span>{action.label}</span>
                <time style={{ color: action.tone }}>{action.detail}</time>
                <ChevronRight aria-hidden="true" focusable="false" size="var(--icon-small)" color={T.faint} />
              </button>
            ))
          ) : (
            <div className="lp-action-empty">
              <CheckCircle2 aria-hidden="true" focusable="false" size="var(--icon-regular)" color={T.mint} />
              <Text size="md">Nothing pressing across your documents. Nicely handled.</Text>
            </div>
          )}
          {attentionItems.length > 10 ? (
            <Button variant="tertiary" type="button" onClick={() => navigate("/documents")}>
              +{attentionItems.length - 10} more across Readiness
            </Button>
          ) : null}
        </Card>

        <Card>
          <div className="lp-insight-title">
            <ShieldCheck aria-hidden="true" focusable="false" size="var(--icon-small)" color={T.readiness} />
            <Text as="b" size="md" weight="semibold">Connected across Readiness</Text>
          </div>
          <Text as="p" size="sm" className="lp-insight-copy">What your modules mean together, not what they already show apart.</Text>
          {insights.map((insight, index) => (
            <button
              key={insight.text}
              type="button"
              className="lp-insight-row"
              onClick={() => navigate(insight.route)}
              style={{ borderTop: index ? `1px solid ${T.border}` : "none" }}
            >
              <span className="lp-insight-icons">
                {insight.icons.map((Icon) => (
                  <i key={Icon.displayName || Icon.name} style={{ background: `color-mix(in srgb, ${insight.tone} 12.16%, transparent)` }}>
                    <Icon aria-hidden="true" focusable="false" size={12} color={insight.tone} />
                  </i>
                ))}
              </span>
              <span>{insight.text}</span>
              <ChevronRight aria-hidden="true" focusable="false" size={14} color={T.faint} />
            </button>
          ))}
          <div className="lp-most-ready">
            <Ring score={readiness} size={40} />
            <Text size="md">Most ready: <b>{readiness === 100 ? "Your document archive" : "Review your packages"}</b></Text>
          </div>
          <Button variant="secondary" type="button" style={{ width: "100%", marginTop: "var(--space-s12)" }} onClick={() => navigate("/packages")}>
            See all packages <ArrowRight aria-hidden="true" focusable="false" size={14} />
          </Button>
        </Card>
      </div>
    </div>
  );
}
