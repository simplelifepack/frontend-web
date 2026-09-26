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

import Card from "@/components/Card";
import Ring from "@/components/Ring";
import SectionHead from "@/components/SectionHead";
import { A, btnGhost, T } from "@/constants/theme";
import { api, type DocumentRecord, type WealthRecord } from "@/lib/api";
import type { HealthHomeReminder } from "@/lib/api.types";
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
  const [healthReminders, setHealthReminders] = useState<HealthHomeReminder[]>([]);
  const [healthMedications, setHealthMedications] = useState<HealthMedicationAttention[]>([]);
  const [wealthRecords, setWealthRecords] = useState<WealthRecord[]>([]);

  useEffect(() => {
    let active = true;
    void api.health.reminders().then((reminders) => { if (active) setHealthReminders(reminders); }).catch(() => { if (active) setHealthReminders([]); });
    void api.health.members().then(async (members) => {
      const timelines = await Promise.all(members.map(async (member) => {
        const events = await api.health.timeline(member.id);
        return events.map((event) => ({ ...event, memberId: member.id, memberName: member.name }));
      }));
      if (active) setHealthMedications(timelines.flat());
    }).catch(() => { if (active) setHealthMedications([]); });
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
    ...healthAttention(healthReminders),
    ...medicationAttention(healthMedications),
    ...wealthAttention(wealthRecords),
  ], [documents, healthMedications, healthReminders, wealthRecords]);
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
        ? `${expiring.length} record${expiring.length === 1 ? "" : "s"} need renewal attention before they affect a life-event pack.`
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
      <div className="lp-eyebrow">Ready when you need them . private . encrypted storage</div>
      <SectionHead
        title={`${greeting()}, ${firstName}`}
        sub="Your archive at a glance, and what needs attention today."
        action={null}
      />

      <div className="lp-home-stats">
        {stats.map(({ label, value, icon: Icon, color, route }) => (
          <button key={label} type="button" className="lp-home-stat" onClick={() => navigate(route)}>
            <span className="lp-home-stat-icon" style={{ background: `${color}22` }}>
              <Icon size={17} color={color} />
            </span>
            <strong>{value}</strong>
            <span>{label}</span>
          </button>
        ))}
      </div>

      <div className="lp-cols2">
        <Card style={{ padding: 0, overflow: "hidden" }}>
          <div className="lp-action-title">
            <AlertTriangle size={16} color={attentionItems.length ? T.warning : T.mint} />
            <b>Action center</b>
            <span>{attentionItems.length || "all clear"}</span>
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
                <ChevronRight size={16} color={T.faint} />
              </button>
            ))
          ) : (
            <div className="lp-action-empty">
              <CheckCircle2 size={18} color={T.mint} />
              <span>Nothing pressing across your documents. Nicely handled.</span>
            </div>
          )}
          {attentionItems.length > 10 ? (
            <button type="button" className="lp-action-more" onClick={() => navigate("/documents")}>
              +{attentionItems.length - 10} more across Readiness
            </button>
          ) : null}
        </Card>

        <Card>
          <div className="lp-insight-title">
            <ShieldCheck size={16} color={T.readiness} />
            <b>Connected across Readiness</b>
          </div>
          <p className="lp-insight-copy">What your modules mean together, not what they already show apart.</p>
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
                  <i key={Icon.displayName || Icon.name} style={{ background: `${insight.tone}1f` }}>
                    <Icon size={12} color={insight.tone} />
                  </i>
                ))}
              </span>
              <span>{insight.text}</span>
              <ChevronRight size={14} color={T.faint} />
            </button>
          ))}
          <div className="lp-most-ready">
            <Ring score={readiness} size={40} />
            <span>Most ready: <b>{readiness === 100 ? "Your document archive" : "Review your packages"}</b></span>
          </div>
          <button type="button" style={{ ...btnGhost, width: "100%", justifyContent: "center", marginTop: 12 }} onClick={() => navigate("/packages")}>
            See all packages <ArrowRight size={14} />
          </button>
        </Card>
      </div>
    </div>
  );
}
