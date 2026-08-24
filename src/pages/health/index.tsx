import {
  Activity,
  CalendarClock,
  ChevronDown,
  HeartPulse,
  Plus,
  ShieldAlert,
  Stethoscope,
  Users,
} from "lucide-react";

import Card from "@/components/Card";
import Pill from "@/components/Pill";
import SectionHead from "@/components/SectionHead";
import { btnGhost, btnGold, T, type Tone } from "@/constants/theme";

type Reading = {
  label: string;
  value: string;
  unit: string;
  status: Tone;
};

const MEMBERS = [
  ["A", "Alex", "Up to date", "ready"],
  ["J", "Jordan", "Up to date", "ready"],
  ["R", "Richard", "Appointment in 12d", "warn"],
  ["D", "Diane", "1 due soon", "wax"],
  ["E", "Ethan", "1 due soon", "warn"],
] as const;

export default function HealthPage() {
  const readings: Reading[] = [
    { label: "LDL", value: "118", unit: "mg/dL", status: "warn" },
    { label: "Blood Pressure · systolic trend", value: "122/80", unit: "mmHg", status: "ready" },
    { label: "HbA1c", value: "5.5", unit: "%", status: "ready" },
  ];

  return (
    <div className="lp-route lp-health-route">
      <SectionHead
        title="Health"
        sub="Keep the whole family visit-ready. Readiness organizes and surfaces your records. It never diagnoses."
        action={<div className="lp-health-attention"><Users size={15} /> 7 things need attention</div>}
      />

      <div className="lp-health-members">
        {MEMBERS.map(([initial, name, status, tone], index) => (
          <button className={index === 0 ? "active" : ""} key={name} type="button">
            <span className={`tone-${tone}`}>{initial}</span>
            <span><b>{name}</b><small>{status}</small></span>
          </button>
        ))}
        <button type="button" className="add"><Users size={16} /><b>Add</b></button>
      </div>

      <div className="lp-health-profile">
        <span>A</span>
        <div>
          <h2>Alex Morgan</h2>
          <p>Self · 41 · O+ · Dr. Reyes, Family Medicine</p>
        </div>
        <button type="button" style={btnGhost}><ShieldAlert size={15} /> Emergency card</button>
        <button type="button" style={btnGhost}><Plus size={15} /> Log reading</button>
      </div>

      <div className="lp-health-tabs">
        {["Overview", "Timeline", "Medications", "Records"].map((tab, index) => (
          <button className={index === 0 ? "active" : ""} key={tab} type="button">{tab}</button>
        ))}
      </div>

      <Card style={{ marginBottom: 16, padding: "13px 16px" }}>
        <div className="lp-health-event">
          <CalendarClock size={18} color={T.gold} />
          <div>
            <b>Annual health checkup · in 70 days · Oct 04, 2026</b>
            <small>Bring 0 medications, 0 recent reports, insurance card · Readings holding in range</small>
          </div>
          <button type="button" style={btnGold}><Stethoscope size={15} /> Prepare for visit</button>
        </div>
      </Card>

      <button type="button" className="lp-health-insight">
        <span><Activity size={15} color={T.gold} /> LDL to review · Blood Pressure, HbA1c in range</span>
        <ChevronDown size={15} />
      </button>

      <div className="lp-health-vitals">
        {readings.map((reading) => (
          <Card key={reading.label}>
            <div className="lp-health-vital-head">
              <span>{reading.label}</span>
              <Pill tone={reading.status}>{reading.status === "ready" ? "in range" : "watch"}</Pill>
            </div>
            <div className="lp-health-vital-value">{reading.value} <small>{reading.unit}</small></div>
            <div className="lp-health-chart"><i /></div>
            <div className="lp-health-log">♙ Manually logged · May 02, 2026</div>
          </Card>
        ))}
      </div>

      <div className="lp-two-col lp-health-bottom">
        <Card>
          <div className="lp-health-card-title"><CalendarClock size={17} /> Reminders <button type="button">+ Add</button></div>
          <div className="lp-health-reminder"><CalendarClock size={17} /><span><b>Annual health checkup</b><small>in 70 days</small></span></div>
        </Card>
        <Card>
          <div className="lp-health-card-title"><HeartPulse size={17} /> Medical readiness <button type="button">Edit</button></div>
          <strong className="lp-health-ready">83%</strong>
          <span className="lp-health-ready-copy">document completeness, not a health score</span>
        </Card>
      </div>
    </div>
  );
}
