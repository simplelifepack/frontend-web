import { useMemo } from "react";
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
import type { DocumentRecord } from "@/lib/api";
import { useAppSelector } from "@/store/hooks";

function fieldValue(document: DocumentRecord, keys: string[]) {
  if (!document.fields || typeof document.fields !== "object") return undefined;
  const fields = document.fields as Record<string, unknown>;
  for (const key of keys) {
    const value = fields[key];
    if (typeof value === "string" && value) return value;
  }
  return undefined;
}

function daysUntil(value: string) {
  return Math.ceil((new Date(value).getTime() - Date.now()) / 86_400_000);
}

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

type ActionItem = {
  id: string;
  label: string;
  when: string;
  tone: string;
};

export default function HomePage() {
  const navigate = useNavigate();
  const { items: documents, status } = useAppSelector((state) => state.documents);
  const user = useAppSelector((state) => state.auth.user);

  const firstName = user?.name.trim().split(/\s+/)[0] || "there";
  const expiring = useMemo(
    () =>
      documents
        .map((document) => {
          const expiry = fieldValue(document, [
            "dateOfExpiry",
            "validTill",
            "validUpto",
            "tripEndDate",
            "maturityDate",
            "dueDate",
          ]);
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
  const readiness = documents.length
    ? Math.round(((documents.length - unknown.length) / documents.length) * 100)
    : 0;
  const documentActions: ActionItem[] = expiring.map(({ document, days }) => ({
    id: document.id,
    label: document.displayName || document.title || document.documentType,
    when: days < 0 ? "expired" : `${days}d left`,
    tone: days < 0 ? T.coral : T.gold,
  }));
  const reviewActions: ActionItem[] = unknown.map((document) => ({
    id: document.id,
    label: `${document.displayName || document.originalName || "Document"} · needs classification`,
    when: "review",
    tone: T.gold,
  }));
  const actions = [...documentActions, ...reviewActions];
  const stats = [
    { label: "Documents", value: documents.length, icon: FolderOpen, color: A.blue, route: "/documents" },
    { label: "Overall readiness", value: `${readiness}%`, icon: ShieldCheck, color: A.green, route: "/packages" },
    { label: "Expiring < 60d", value: expiring.length, icon: Clock, color: A.gold, route: "/documents" },
    { label: "Needs attention", value: actions.length, icon: Bell, color: A.pink, route: "/documents" },
  ];
  const insights = [
    {
      icons: [FolderOpen, Plane],
      text: `${documents.length} records are available across your document vault and readiness packages.`,
      route: "/packages",
      tone: A.green,
    },
    {
      icons: [Wallet, ShieldCheck],
      text: expiring.length
        ? `${expiring.length} record${expiring.length === 1 ? "" : "s"} need renewal attention before they affect a life-event pack.`
        : "No saved documents currently expire within the next 60 days.",
      route: "/wealth",
      tone: expiring.length ? T.gold : T.mint,
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
      <div className="lp-eyebrow">Ready when you need them . private . on-device</div>
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
            <AlertTriangle size={16} color={actions.length ? T.gold : T.mint} />
            <b>Action center</b>
            <span>{actions.length || "all clear"}</span>
          </div>
          <button type="button" className="lp-action-group" onClick={() => navigate("/documents")}>
            <FolderOpen size={14} color={A.blue} />
            <strong>Documents</strong>
            <span>{actions.length}</span>
            <ChevronRight size={14} />
          </button>
          {actions.length ? (
            actions.slice(0, 8).map((action) => (
              <button
                type="button"
                className="lp-action-row"
                key={action.id}
                onClick={() => navigate(`/documents?search=${encodeURIComponent(action.label)}`)}
              >
                <i style={{ background: action.tone }} />
                <span>{action.label}</span>
                <time style={{ color: action.tone }}>{action.when}</time>
                <CheckCircle2 size={16} color={T.mint} />
              </button>
            ))
          ) : (
            <div className="lp-action-empty">
              <CheckCircle2 size={18} color={T.mint} />
              <span>Nothing pressing across your documents. Nicely handled.</span>
            </div>
          )}
          {actions.length > 8 ? (
            <button type="button" className="lp-action-more" onClick={() => navigate("/documents")}>
              +{actions.length - 8} more in Documents
            </button>
          ) : null}
        </Card>

        <Card>
          <div className="lp-insight-title">
            <ShieldCheck size={16} color={T.gold} />
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
