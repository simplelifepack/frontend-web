import { motion } from "framer-motion";
import {
  ShieldCheck,
  ArrowRight,
  Landmark,
  HeartPulse,
  Search,
  Lock,
  Wallet,
  Mail,
  HardDrive,
  Fingerprint,
  Check,
  CalendarClock,
  Pill,
  FlaskConical,
  UploadCloud,
  Sparkles,
  FileText,
  Plane,
  Briefcase,
  Stamp,
} from "lucide-react";

const C = {
  paper: "#F3EBDA",
  paperDeep: "#EDE3CF",
  panel: "#FFFFFF",
  panel2: "#FAF3E7",
  border: "#E3D8C2",
  ink: "#221E17",
  body: "#4C443A",
  muted: "#897E6D",
  gold: "#A87C22",
  goldFill: "#D8B25A",
  goldSoft: "#F0E4C6",
  emerald: "#1F9D66",
  clay: "#B85C42",
  red: "#C24A34",
  blue: "#4F79C7",
  purple: "#8467C4",
  pink: "#C25A86",
  teal: "#3E9AA6",
};

const fade = (d = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-70px" },
  transition: { duration: 0.6, delay: d, ease: [0.2, 0.7, 0.2, 1] as any },
});

/* ── live radar backdrop ── */
function Radar() {
  return (
    <svg
      viewBox="0 0 900 720"
      preserveAspectRatio="xMidYMid slice"
      style={{ width: "100%", height: "100%" }}
      aria-hidden
    >
      <motion.g
        style={{ transformOrigin: "620px 340px" }}
        animate={{ rotate: 360 }}
        transition={{ duration: 200, repeat: Infinity, ease: "linear" }}
      >
        {Array.from({ length: 7 }).map((_, i) => (
          <circle
            key={i}
            cx={620}
            cy={340}
            r={80 + i * 50}
            fill="none"
            stroke={C.gold}
            strokeOpacity={0.16 - i * 0.016}
            strokeWidth={1}
          />
        ))}
        {Array.from({ length: 48 }).map((_, i) => {
          const a = (i / 48) * Math.PI * 2;
          return (
            <line
              key={i}
              x1={620 + Math.cos(a) * 400}
              y1={340 + Math.sin(a) * 400}
              x2={620 + Math.cos(a) * 416}
              y2={340 + Math.sin(a) * 416}
              stroke={C.gold}
              strokeOpacity={0.18}
              strokeWidth={1}
            />
          );
        })}
      </motion.g>
      <motion.g
        style={{ transformOrigin: "620px 340px" }}
        animate={{ rotate: 360 }}
        transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
      >
        <defs>
          <linearGradient id="sweep" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor={C.gold} stopOpacity="0.22" />
            <stop offset="1" stopColor={C.gold} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d={`M620 340 L${620 + 420} 340 A420 420 0 0 0 ${620 + 420 * Math.cos(-0.5)} ${340 + 420 * Math.sin(-0.5)} Z`}
          fill="url(#sweep)"
        />
      </motion.g>
    </svg>
  );
}

/* ── mocks ── */
function Bar({ label, score, delay, color }: { label: string; score: number; delay: number; color: string }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 7 }}>
        <span style={{ fontSize: 13.5, fontWeight: 600, color: C.ink }}>{label}</span>
        <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12.5, color: C.muted }}>{score}%</span>
      </div>
      <div style={{ height: 7, borderRadius: 6, background: C.paperDeep, overflow: "hidden" }}>
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${score}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1.1, delay, ease: [0.2, 0.7, 0.2, 1] }}
          style={{ height: "100%", borderRadius: 6, background: color }}
        />
      </div>
    </div>
  );
}
function ReadinessMock() {
  return (
    <div className="lp-mock" style={{ padding: 20 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
        <span
          style={{
            fontFamily: "'JetBrains Mono',monospace",
            fontSize: 10.5,
            letterSpacing: 2,
            color: C.muted,
            textTransform: "uppercase",
          }}
        >
          Readiness
        </span>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            transform: "rotate(-6deg)",
            border: `1.5px solid ${C.emerald}`,
            color: C.emerald,
            borderRadius: 7,
            padding: "3px 9px",
            fontSize: 10.5,
            fontWeight: 800,
            letterSpacing: 1.5,
            fontFamily: "'JetBrains Mono',monospace",
          }}
        >
          <Stamp size={12} /> READY
        </span>
      </div>
      <div style={{ display: "grid", gap: 16 }}>
        <Bar label="Schengen visa" score={82} delay={0.1} color={C.goldFill} />
        <Bar label="Home loan" score={95} delay={0.25} color={C.emerald} />
        <Bar label="Job switch" score={90} delay={0.4} color={C.emerald} />
        <Bar label="Hospital visit" score={67} delay={0.55} color={C.goldFill} />
      </div>
    </div>
  );
}
function PackDetail() {
  const inc = ["Passport", "Bank statement", "Payslip", "Tax return"];
  const add = ["DS-160 confirmation"];
  return (
    <div className="lp-mock" style={{ padding: 18 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
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
          <Plane size={19} color={C.blue} />
        </span>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.ink }}>US visa pack</div>
          <div style={{ fontSize: 12, color: C.muted, fontFamily: "'JetBrains Mono',monospace" }}>4 of 5 ready</div>
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
              <Check size={11} color={C.emerald} />
            </span>
            <span style={{ fontSize: 13, color: C.ink }}>{x}</span>
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
            <span
              style={{
                display: "grid",
                placeItems: "center",
                width: 18,
                height: 18,
                borderRadius: 6,
                background: C.clay + "22",
                color: C.clay,
                fontSize: 12,
                fontWeight: 800,
              }}
            >
              +
            </span>
            <span style={{ fontSize: 13, color: C.ink }}>{x}</span>
            <span style={{ marginLeft: "auto", fontSize: 11, color: C.clay, fontFamily: "'JetBrains Mono',monospace" }}>
              to add
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
function DocGraph() {
  const cats = [
    { n: "Identity", d: 4, c: C.blue },
    { n: "Finance", d: 4, c: C.gold },
    { n: "Insurance", d: 3, c: C.teal },
    { n: "Property", d: 3, c: C.pink },
    { n: "Medical", d: 2, c: C.emerald },
    { n: "Employment", d: 4, c: C.purple },
  ];
  return (
    <div className="lp-mock" style={{ padding: 18 }}>
      <div
        style={{
          fontFamily: "'JetBrains Mono',monospace",
          fontSize: 10.5,
          letterSpacing: 2,
          color: C.muted,
          textTransform: "uppercase",
          marginBottom: 14,
        }}
      >
        Document graph
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 9 }}>
        {cats.map((x) => (
          <div
            key={x.n}
            style={{ background: C.panel2, border: `1px solid ${C.border}`, borderRadius: 11, padding: "12px 13px" }}
          >
            <div style={{ width: 8, height: 8, borderRadius: 9, background: x.c, marginBottom: 9 }} />
            <div style={{ fontSize: 13, fontWeight: 600, color: C.ink }}>{x.n}</div>
            <div style={{ fontSize: 11.5, color: C.muted, fontFamily: "'JetBrains Mono',monospace" }}>{x.d} docs</div>
          </div>
        ))}
      </div>
    </div>
  );
}
function WealthMock() {
  const rows = [
    { n: "Investment statement", v: "$4.2M", ok: true },
    { n: "Life insurance", v: "$10.0M", ok: false },
    { n: "Property deed", v: "$18.5M", ok: true },
  ];
  return (
    <div className="lp-mock" style={{ padding: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 12, color: C.muted }}>Documented value</div>
          <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 26, fontWeight: 700, color: C.ink }}>
            $32.7M
          </div>
        </div>
        <span
          style={{
            fontSize: 11.5,
            fontWeight: 600,
            color: C.clay,
            background: C.clay + "16",
            border: `1px solid ${C.clay}33`,
            borderRadius: 20,
            padding: "4px 10px",
            fontFamily: "'JetBrains Mono',monospace",
          }}
        >
          1 nominee gap
        </span>
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
                background: C.gold + "1c",
              }}
            >
              <Wallet size={14} color={C.gold} />
            </span>
            <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: C.ink }}>{r.n}</span>
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 13, color: C.body }}>{r.v}</span>
            <span
              style={{
                fontSize: 10.5,
                fontWeight: 700,
                color: r.ok ? C.emerald : C.clay,
                fontFamily: "'JetBrains Mono',monospace",
              }}
            >
              {r.ok ? "nominee" : "add"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
function HealthMock() {
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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <span style={{ fontSize: 13, color: C.muted }}>HbA1c · recent trend</span>
        <span
          style={{
            fontFamily: "'JetBrains Mono',monospace",
            fontSize: 10.5,
            fontWeight: 600,
            color: C.red,
            background: C.red + "16",
            border: `1px solid ${C.red}40`,
            padding: "2px 8px",
            borderRadius: 20,
          }}
        >
          above range
        </span>
      </div>
      <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 26, fontWeight: 700, color: C.ink }}>
        7.2<span style={{ fontSize: 13, color: C.muted, fontWeight: 500 }}> %</span>
      </div>
      <svg viewBox="0 0 300 60" style={{ width: "100%", height: 60, marginTop: 6 }}>
        <rect x={0} y={38} width={300} height={20} fill={C.emerald} opacity={0.14} />
        <line x1={0} x2={300} y1={38} y2={38} stroke={C.emerald} strokeWidth={1} strokeDasharray="3 3" opacity={0.6} />
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
        <text x={298} y={34} textAnchor="end" fontSize="8" fill={C.emerald} fontFamily="'JetBrains Mono',monospace">
          normal ≤ 5.7
        </text>
      </svg>
      <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
        <span className="lp-tag">
          <Pill size={12} color={C.purple} /> 3 meds
        </span>
        <span className="lp-tag">
          <FlaskConical size={12} color={C.pink} /> last 3 labs
        </span>
        <span className="lp-tag">
          <CalendarClock size={12} color={C.gold} /> visit pack
        </span>
      </div>
    </div>
  );
}
function SearchMock() {
  const hits = [
    { icon: Pill, c: C.purple, t: "Levothyroxine 50mcg", s: "Medication · Diane" },
    { icon: FlaskConical, c: C.pink, t: "TSH lab report", s: "Lab · May 2026" },
    { icon: FileText, c: C.blue, t: "Thyroid prescription", s: "Document · Dr. Carter" },
  ];
  return (
    <div className="lp-mock" style={{ padding: 16 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 9,
          background: C.panel2,
          border: `1px solid ${C.gold}66`,
          borderRadius: 10,
          padding: "10px 12px",
        }}
      >
        <Search size={15} color={C.muted} />
        <span style={{ fontSize: 13.5, color: C.ink }}>thyroid</span>
        <span className="lp-caret" />
      </div>
      <div style={{ marginTop: 10, display: "grid", gap: 6 }}>
        {hits.map((h) => (
          <div
            key={h.t}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 11,
              background: C.panel2,
              border: `1px solid ${C.border}`,
              borderRadius: 10,
              padding: "9px 11px",
            }}
          >
            <span
              style={{
                display: "grid",
                placeItems: "center",
                width: 28,
                height: 28,
                borderRadius: 8,
                background: h.c + "1c",
              }}
            >
              <h.icon size={14} color={h.c} />
            </span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.ink }}>{h.t}</div>
              <div style={{ fontSize: 11.5, color: C.muted }}>{h.s}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Feature({ eyebrow, title, body, points, mock, flip }: any) {
  return (
    <motion.div {...fade()} className="lp-feature" style={{ direction: flip ? "rtl" : "ltr" }}>
      <div style={{ direction: "ltr" }}>
        <div className="lp-eyebrow">{eyebrow}</div>
        <h3 className="lp-h3">{title}</h3>
        <p className="lp-body" style={{ marginTop: 12 }}>
          {body}
        </p>
        <div style={{ marginTop: 18, display: "grid", gap: 11 }}>
          {points.map((p: string) => (
            <div key={p} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span
                style={{
                  display: "grid",
                  placeItems: "center",
                  width: 20,
                  height: 20,
                  borderRadius: 7,
                  background: C.emerald + "1e",
                  flexShrink: 0,
                }}
              >
                <Check size={12} color={C.emerald} />
              </span>
              <span style={{ fontSize: 14.5, color: C.ink }}>{p}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ direction: "ltr" }}>{mock}</div>
    </motion.div>
  );
}

export default function Landing({ onStart }: { onStart: () => void }) {
  return (
    <div className="lp-root">
      <style>{CSS}</style>

      <nav className="lp-nav">
        <div className="lp-navinner">
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <span
              style={{
                display: "grid",
                placeItems: "center",
                width: 36,
                height: 36,
                borderRadius: 10,
                background: `linear-gradient(135deg,${C.goldFill},#E9CE8E)`,
              }}
            >
              <ShieldCheck size={19} color="#3A2E12" />
            </span>
            <span style={{ fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: 17, color: C.ink }}>
              LifePack <span style={{ color: C.gold }}>AI</span>
            </span>
          </div>
          <div className="lp-navlinks">
            <a href="#features">Features</a>
            <a href="#how">How it works</a>
            <a href="#privacy">Privacy</a>
          </div>
          <button onClick={onStart} className="lp-navcta">
            Open your LifePack <ArrowRight size={15} />
          </button>
        </div>
      </nav>

      <header className="lp-hero">
        <div className="lp-herobg" aria-hidden>
          <Radar />
        </div>
        <div className="lp-heroinner">
          <motion.div {...fade()}>
            <span className="lp-badge">
              <Sparkles size={13} /> The living archive for your life
            </span>
            <h1 className="lp-h1">
              Your documents,
              <br />
              in order and{" "}
              <span style={{ color: C.clay }}>
                ready
                <br />
                when you need them.
              </span>
            </h1>
            <p className="lp-sub">
              LifePack quietly gathers, classifies, and assembles every passport, policy, payslip, and prescription, so
              any visa, loan, job switch, or hospital visit is only a few taps away.
            </p>
            <div className="lp-herocta">
              <button onClick={onStart} className="lp-cta">
                Open your LifePack <ArrowRight size={17} />
              </button>
              <span className="lp-trust">
                <Lock size={12} /> private · on-device · you hold the keys
              </span>
            </div>
          </motion.div>
          <motion.div {...fade(0.15)} className="lp-heromock">
            <motion.div animate={{ y: [0, -9, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}>
              <ReadinessMock />
            </motion.div>
          </motion.div>
        </div>
        <div className="lp-connectors">
          <span>Brings everything together from</span>
          <span className="lp-conn">
            <Mail size={14} /> Email
          </span>
          <span className="lp-conn">
            <HardDrive size={14} /> Drive
          </span>
          <span className="lp-conn">
            <Fingerprint size={14} /> DigiLocker
          </span>
          <span className="lp-conn">
            <UploadCloud size={14} /> Upload &amp; scan
          </span>
        </div>
      </header>

      <section className="lp-band">
        <motion.div {...fade()} className="lp-wrap" style={{ textAlign: "center", maxWidth: 840 }}>
          <div className="lp-eyebrow" style={{ display: "flex", justifyContent: "center" }}>
            For life's real moments
          </div>
          <h2 className="lp-h2">
            A new job. A new home. A trip abroad. A day at the hospital. Whatever comes next, the right papers are
            already gathered and waiting.
          </h2>
          <p
            className="lp-body"
            style={{ marginTop: 16, fontSize: 17, maxWidth: 640, marginLeft: "auto", marginRight: "auto" }}
          >
            You simply open LifePack, and everything is ready to go. Calm, in order, and entirely yours.
          </p>
        </motion.div>
      </section>

      <section id="features" className="lp-features lp-wrap">
        <Feature
          eyebrow="Life packs"
          title="Assemble any pack in a tap."
          body="Choose a life event. LifePack gathers the right documents from your archive, shows exactly what is ready, and gently points out anything still to add."
          points={[
            "Visa, loan, hospital, tax, job",
            "Ready and to-add, clearly shown",
            "Export a clean pack in seconds",
          ]}
          mock={<PackDetail />}
        />
        <Feature
          flip
          eyebrow="Auto-organize"
          title="Connect once. Everything files itself."
          body="Link Email, Drive, or DigiLocker, or simply add a photo. LifePack reads each document, files it in the right place, and builds a living graph of your family's papers."
          points={[
            "Sorted automatically as it arrives",
            "Identity, finance, insurance, property, health",
            "Re-tag anything in one tap",
          ]}
          mock={<DocGraph />}
        />
        <Feature
          eyebrow="Wealth"
          title="See what you own, and who inherits it."
          body="LifePack reads your financial and insurance papers for what actually matters: total documented value, and the holdings that still have no nominee named."
          points={["Documented value at a glance", "Nominee gaps surfaced, not buried", "Ready for a clean handoff"]}
          mock={<WealthMock />}
        />
        <Feature
          flip
          eyebrow="Visit companion"
          title="Walk into every appointment ready."
          body="Medications, recent reports, allergies, and trends for the whole family, assembled into a one-tap doctor visit pack. LifePack organizes and surfaces. It never diagnoses."
          points={["One-tap doctor visit pack", "Trends shown against standard ranges", "An emergency card for anyone"]}
          mock={<HealthMock />}
        />
        <Feature
          eyebrow="Search"
          title="You remember the keyword. We find the paper."
          body="No folders to memorize. Type what you recall, a test, a doctor, a month, and LifePack surfaces the prescription, the report, the medication, and everything related."
          points={["One search across everything", "Documents, health, people, dates", "Answers in a keystroke"]}
          mock={<SearchMock />}
        />
      </section>

      <section id="how" className="lp-band">
        <div className="lp-wrap">
          <motion.div {...fade()} style={{ textAlign: "center", marginBottom: 44 }}>
            <div className="lp-eyebrow" style={{ display: "flex", justifyContent: "center" }}>
              How it works
            </div>
            <h2 className="lp-h2">Three gentle steps to lasting peace of mind.</h2>
          </motion.div>
          <div className="lp-steps">
            {[
              {
                n: "01",
                icon: UploadCloud,
                t: "Add or connect",
                d: "Add a photo, drop files in, or link Email, Drive, and DigiLocker.",
              },
              {
                n: "02",
                icon: Sparkles,
                t: "It sorts and reads",
                d: "Every document is understood and placed into your private archive, automatically.",
              },
              {
                n: "03",
                icon: Briefcase,
                t: "Open a ready pack",
                d: "For any life event or doctor visit, everything is already assembled and waiting.",
              },
            ].map((s, i) => (
              <motion.div key={s.n} {...fade(i * 0.1)} className="lp-step">
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span
                    style={{
                      display: "grid",
                      placeItems: "center",
                      width: 42,
                      height: 42,
                      borderRadius: 12,
                      background: C.goldSoft,
                      border: `1px solid ${C.gold}33`,
                    }}
                  >
                    <s.icon size={20} color={C.gold} />
                  </span>
                  <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 13, color: C.muted }}>{s.n}</span>
                </div>
                <h4
                  style={{
                    fontFamily: "'Space Grotesk'",
                    fontSize: 18,
                    fontWeight: 700,
                    color: C.ink,
                    margin: "16px 0 6px",
                  }}
                >
                  {s.t}
                </h4>
                <p className="lp-body" style={{ fontSize: 14.5 }}>
                  {s.d}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="privacy" className="lp-wrap">
        <motion.div {...fade()} className="lp-privacy">
          <span
            style={{
              display: "grid",
              placeItems: "center",
              width: 56,
              height: 56,
              borderRadius: 16,
              background: C.emerald + "18",
              border: `1px solid ${C.emerald}33`,
              margin: "0 auto 20px",
            }}
          >
            <Lock size={26} color={C.emerald} />
          </span>
          <h2 className="lp-h2" style={{ maxWidth: 640, margin: "0 auto" }}>
            Private by design. Yours alone.
          </h2>
          <p className="lp-body" style={{ marginTop: 14, maxWidth: 620, margin: "14px auto 0", fontSize: 16 }}>
            Your archive is encrypted on your own device, not on our servers. You choose who in the family sees what,
            and you can pass it on cleanly when it matters most.
          </p>
          <div className="lp-trust" style={{ justifyContent: "center", marginTop: 22, color: C.muted }}>
            <ShieldCheck size={13} color={C.emerald} /> on-device encryption · family access levels · no ads, ever
          </div>
        </motion.div>
      </section>

      <section className="lp-wrap">
        <motion.div {...fade()} className="lp-finalcta">
          <div className="lp-herobg" aria-hidden style={{ opacity: 0.8 }}>
            <Radar />
          </div>
          <div style={{ position: "relative" }}>
            <h2 className="lp-h1" style={{ fontSize: 40 }}>
              Start your family's <span style={{ color: C.clay }}>living archive.</span>
            </h2>
            <p className="lp-sub" style={{ marginTop: 12, marginLeft: "auto", marginRight: "auto" }}>
              Set it up once, and let the next big moment be the easy one.
            </p>
            <button onClick={onStart} className="lp-cta" style={{ marginTop: 26 }}>
              Open your LifePack <ArrowRight size={17} />
            </button>
          </div>
        </motion.div>
      </section>

      <footer className="lp-footer">
        <div className="lp-wrap lp-footinner">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span
              style={{
                display: "grid",
                placeItems: "center",
                width: 30,
                height: 30,
                borderRadius: 9,
                background: `linear-gradient(135deg,${C.goldFill},#E9CE8E)`,
              }}
            >
              <ShieldCheck size={16} color="#3A2E12" />
            </span>
            <span style={{ fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: 15, color: C.ink }}>
              LifePack <span style={{ color: C.gold }}>AI</span>
            </span>
          </div>
          <span style={{ fontSize: 13, color: C.muted }}>A private, ready archive for your whole family.</span>
          <span
            style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11.5, letterSpacing: 1.5, color: C.muted }}
          >
            PRIVATE · ON-DEVICE · YOU HOLD THE KEYS
          </span>
        </div>
      </footer>
    </div>
  );
}

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');
.lp-root{background:${C.paper};color:${C.ink};font-family:'Inter',system-ui,sans-serif;overflow-x:hidden}
.lp-root *{box-sizing:border-box}
.lp-root a{text-decoration:none;color:inherit}
.lp-wrap{max-width:1120px;margin:0 auto;padding:0 24px}
.lp-eyebrow{font-family:'JetBrains Mono',monospace;font-size:12px;font-weight:600;letter-spacing:.18em;text-transform:uppercase;color:${C.gold}}
.lp-h1{font-family:'Space Grotesk';font-weight:700;font-size:56px;line-height:1.04;letter-spacing:-1.6px;color:${C.ink};margin:20px 0 0}
.lp-h2{font-family:'Space Grotesk';font-weight:700;font-size:29px;line-height:1.24;letter-spacing:-.5px;color:${C.ink};margin:10px 0 0}
.lp-h3{font-family:'Space Grotesk';font-weight:700;font-size:27px;line-height:1.15;letter-spacing:-.5px;color:${C.ink};margin:8px 0 0}
.lp-body{color:${C.body};font-size:15.5px;line-height:1.66}
.lp-tag{display:inline-flex;align-items:center;gap:5px;font-size:11.5px;color:${C.body};background:${C.panel2};border:1px solid ${C.border};border-radius:8px;padding:5px 9px}
.lp-nav{position:sticky;top:0;z-index:50;background:${C.paper}d9;backdrop-filter:blur(12px);border-bottom:1px solid ${C.border}}
.lp-navinner{max-width:1120px;margin:0 auto;padding:14px 24px;display:flex;align-items:center;justify-content:space-between;gap:20px}
.lp-navlinks{display:flex;gap:28px;font-size:14.5px;color:${C.body}}
.lp-navlinks a:hover{color:${C.ink}}
.lp-navcta{display:inline-flex;align-items:center;gap:7px;background:${C.goldFill};color:#3A2E12;font-weight:700;font-size:14px;border:0;border-radius:10px;padding:9px 16px;cursor:pointer;font-family:inherit}
.lp-navcta:hover{filter:brightness(1.04)}
.lp-hero{position:relative;padding:60px 0 40px;overflow:hidden}
.lp-herobg{position:absolute;inset:0;pointer-events:none}
.lp-heroinner{position:relative;max-width:1120px;margin:0 auto;padding:0 24px;display:grid;grid-template-columns:1.05fr .95fr;gap:52px;align-items:center}
.lp-badge{display:inline-flex;align-items:center;gap:7px;font-family:'JetBrains Mono',monospace;font-size:11.5px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;color:${C.gold};background:${C.goldSoft};border:1px solid ${C.gold}44;border-radius:20px;padding:6px 13px}
.lp-sub{color:${C.body};font-size:17.5px;line-height:1.6;margin-top:22px;max-width:540px}
.lp-herocta{display:flex;gap:18px;align-items:center;margin-top:30px;flex-wrap:wrap}
.lp-cta{display:inline-flex;align-items:center;gap:9px;background:${C.goldFill};color:#3A2E12;font-weight:700;font-size:15.5px;border:0;border-radius:12px;padding:14px 24px;cursor:pointer;font-family:inherit;box-shadow:0 14px 36px ${C.goldFill}66}
.lp-cta:hover{filter:brightness(1.04);transform:translateY(-1px)}
.lp-trust{display:inline-flex;align-items:center;gap:7px;font-family:'JetBrains Mono',monospace;font-size:12px;letter-spacing:.4px;color:${C.muted}}
.lp-heromock{position:relative}
.lp-mock{background:${C.panel};border:1px solid ${C.border};border-radius:18px;box-shadow:0 30px 70px rgba(80,60,30,.16)}
.lp-heromock:before{content:"";position:absolute;inset:-30px;background:radial-gradient(circle at 60% 45%,${C.goldFill}44,transparent 66%);filter:blur(30px);z-index:-1}
.lp-connectors{max-width:1120px;margin:48px auto 0;padding:0 24px;display:flex;align-items:center;gap:14px;flex-wrap:wrap;justify-content:center;color:${C.muted};font-size:13px}
.lp-conn{display:inline-flex;align-items:center;gap:7px;color:${C.body};background:${C.panel};border:1px solid ${C.border};border-radius:20px;padding:7px 14px;font-size:13px}
.lp-band{padding:84px 0}
.lp-band:nth-of-type(even){background:${C.paperDeep}}
.lp-features{padding:92px 24px;display:grid;gap:104px}
.lp-feature{display:grid;grid-template-columns:1fr 1fr;gap:60px;align-items:center}
.lp-steps{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}
.lp-step{background:${C.panel};border:1px solid ${C.border};border-radius:16px;padding:22px;box-shadow:0 12px 30px rgba(80,60,30,.07)}
.lp-privacy{text-align:center;padding:92px 0}
.lp-finalcta{position:relative;overflow:hidden;background:${C.panel};border:1px solid ${C.border};border-radius:24px;padding:64px 32px;text-align:center;margin:40px 0 92px;box-shadow:0 24px 60px rgba(80,60,30,.12)}
.lp-footer{border-top:1px solid ${C.border};padding:32px 0}
.lp-footinner{display:flex;align-items:center;justify-content:space-between;gap:20px;flex-wrap:wrap}
.lp-caret{width:2px;height:15px;background:${C.gold};display:inline-block;animation:lpblink 1s steps(2) infinite}
@keyframes lpblink{0%,50%{opacity:1}51%,100%{opacity:0}}
@media(max-width:860px){
  .lp-navlinks{display:none}
  .lp-heroinner{grid-template-columns:1fr;gap:36px}
  .lp-heromock{max-width:460px;margin:0 auto;width:100%}
  .lp-h1{font-size:40px}
  .lp-feature{grid-template-columns:1fr!important;gap:28px;direction:ltr!important}
  .lp-steps{grid-template-columns:1fr}
  .lp-features{gap:68px;padding:68px 24px}
}
@media(prefers-reduced-motion:reduce){*{animation:none!important}}
`;
