import { motion } from "framer-motion";
import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { BrandMark, BrandWordmark } from "./BrandLogo";
import { api } from "@/lib/api";
import { useAppDispatch } from "@/store/hooks";
import { googleLogin, login, signup } from "@/store/slices/authSlice";
import GoogleSignInButton from "./GoogleSignInButton";
import { toast } from "sonner";
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
  X,
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
  action: "#35a7a0",
  actionText: "#FFFFFF",
  actionSoft: "#E7F5F4",
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
            stroke={C.action}
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
              stroke={C.action}
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
            <stop offset="0" stopColor={C.action} stopOpacity="0.22" />
            <stop offset="1" stopColor={C.action} stopOpacity="0" />
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
        <Bar label="Schengen visa" score={82} delay={0.1} color={C.action} />
        <Bar label="Home loan" score={95} delay={0.25} color={C.emerald} />
        <Bar label="Job switch" score={90} delay={0.4} color={C.emerald} />
        <Bar label="Hospital visit" score={67} delay={0.55} color={C.action} />
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
    { n: "Finance", d: 4, c: C.action },
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
                background: C.action + "1c",
              }}
            >
              <Wallet size={14} color={C.action} />
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
          <CalendarClock size={12} color={C.action} /> visit pack
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
          border: `1px solid ${C.action}66`,
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

/* ── life-moment scene cards — illustrated by default; pass img (Lovable asset or any URL) to swap in a photo ── */
function Shadow({ cx, cy, rx }: { cx: number; cy: number; rx: number }) {
  // layered ellipses fake a soft contact shadow without SVG filters
  return (
    <>
      <ellipse cx={cx} cy={cy} rx={rx} ry={rx * 0.22} fill="#3A2F1C" opacity=".05" />
      <ellipse cx={cx} cy={cy} rx={rx * 0.78} ry={rx * 0.17} fill="#3A2F1C" opacity=".06" />
      <ellipse cx={cx} cy={cy} rx={rx * 0.5} ry={rx * 0.11} fill="#3A2F1C" opacity=".07" />
    </>
  );
}

function BrandKey({ x, y, r, color, carve }: { x: number; y: number; r: number; color: string; carve: string }) {
  return (
    <g transform={`translate(${x},${y}) rotate(${r})`}>
      <circle cx="0" cy="0" r="11" fill="none" stroke={color} strokeWidth="6" />
      <path d="M9 4 L42 24" stroke={color} strokeWidth="7" strokeLinecap="round" />
      <path d="M30 17 l4 -7 M38 22 l4 -7" stroke={color} strokeWidth="5" strokeLinecap="round" />
      <circle cx="0" cy="0" r="4" fill={carve} />
    </g>
  );
}

function MomentScene({ kind }: { kind: "visa" | "hospital" | "home" | "legacy" }) {
  const scenes: Record<string, { sky: string; label: string; draw: ReactNode }> = {
    visa: {
      label: "A passport and travel papers laid out on a desk beside a cup of coffee",
      sky: "linear-gradient(165deg,#F2EBDA,#EDE3CE)",
      draw: (
        <>
          <Shadow cx={96} cy={146} rx={70} />
          <g transform="rotate(-4 90 112)">
            <rect x="44" y="78" width="96" height="66" rx="3" fill="#FBF7EC" stroke="#E4DAC4" />
          </g>
          <g transform="rotate(2 96 116)">
            <rect x="52" y="84" width="96" height="66" rx="3" fill="#FFFFFF" stroke="#E4DAC4" />
            <path d="M148 84 l-14 0 14 14 z" fill="#F0E9D8" />
            <rect x="63" y="98" width="58" height="4" rx="2" fill="#E2D8C2" />
            <rect x="63" y="108" width="70" height="4" rx="2" fill="#E9E0CC" />
            <rect x="63" y="118" width="46" height="4" rx="2" fill="#35a7a0" opacity=".55" />
            <rect x="63" y="128" width="63" height="4" rx="2" fill="#E9E0CC" />
          </g>
          <g transform="rotate(-7 84 96)">
            <rect x="56" y="52" width="58" height="80" rx="6" fill="#242B34" />
            <rect x="56" y="52" width="58" height="80" rx="6" fill="url(#pp-sheen)" opacity=".25" />
            <circle cx="85" cy="83" r="12" fill="none" stroke="#35a7a0" strokeWidth="1.8" />
            <circle cx="85" cy="83" r="6.5" fill="none" stroke="#35a7a0" strokeWidth="1.4" />
            <rect x="72" y="106" width="26" height="3" rx="1.5" fill="#35a7a0" opacity=".85" />
          </g>
          <g transform="rotate(5 196 120)">
            <rect x="160" y="92" width="76" height="52" rx="4" fill="#FFFDF6" stroke="#E4DAC4" />
            <line x1="212" y1="92" x2="212" y2="144" stroke="#E0D5BC" strokeDasharray="3 4" />
            {[168, 172, 177, 180, 185, 190, 194, 199, 203].map((x, i) => (
              <rect key={x} x={x} y="104" width={i % 3 === 0 ? 2.6 : 1.4} height="26" fill="#2A2F38" opacity=".85" />
            ))}
          </g>
          <Shadow cx={236} cy={70} rx={26} />
          <circle cx="238" cy="56" r="25" fill="#EFE7D4" stroke="#E0D5BC" />
          <circle cx="238" cy="56" r="18" fill="#B98A55" />
          <circle cx="238" cy="56" r="14" fill="#6B4A2E" />
          <path d="M228 48 a14 14 0 0 1 12 -4" stroke="#8A6440" strokeWidth="2" fill="none" opacity=".6" />
          <defs>
            <linearGradient id="pp-sheen" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#fff" stopOpacity=".5" />
              <stop offset=".4" stopColor="#fff" stopOpacity="0" />
            </linearGradient>
          </defs>
        </>
      ),
    },
    hospital: {
      label: "A phone showing a ready document pack beside paperwork, late at night",
      sky: "linear-gradient(160deg,#2A3140,#1F252E)",
      draw: (
        <>
          <ellipse cx="60" cy="24" rx="150" ry="90" fill="#E8C98A" opacity=".10" />
          <ellipse cx="60" cy="20" rx="90" ry="56" fill="#E8C98A" opacity=".08" />
          <g transform="rotate(4 176 120)">
            <rect x="140" y="76" width="86" height="74" rx="3" fill="#F3EDDD" />
            <path d="M226 76 l-13 0 13 13 z" fill="#E4DCC6" />
            <rect x="150" y="88" width="40" height="5" rx="2.5" fill="#9FB4C8" opacity=".8" />
            <rect x="150" y="101" width="62" height="3.5" rx="1.75" fill="#D8CFB8" />
            <rect x="150" y="110" width="55" height="3.5" rx="1.75" fill="#D8CFB8" />
            <rect x="150" y="119" width="60" height="3.5" rx="1.75" fill="#D8CFB8" />
            <rect x="150" y="128" width="42" height="3.5" rx="1.75" fill="#D8CFB8" />
          </g>
          <Shadow cx={92} cy={152} rx={44} />
          <g transform="rotate(-5 92 104)">
            <rect x="60" y="42" width="64" height="118" rx="13" fill="#0E1319" />
            <rect x="65" y="50" width="54" height="102" rx="8" fill="#F7F3E8" />
            <rect x="65" y="50" width="54" height="16" rx="8" fill="#242B34" />
            <rect x="72" y="74" width="40" height="4" rx="2" fill="#D8CFB8" />
            <rect x="72" y="84" width="32" height="4" rx="2" fill="#E4DCC6" />
            <rect x="72" y="94" width="37" height="4" rx="2" fill="#E4DCC6" />
            <circle cx="92" cy="124" r="12" fill="#35a7a0" />
            <path d="M86 124 l4 5 8 -10" stroke="#1E242B" strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        </>
      ),
    },
    home: {
      label: "Two keys resting on a home-loan checklist",
      sky: "linear-gradient(165deg,#F3EFE3,#EEE8D6)",
      draw: (
        <>
          <path d="M196 150 v-74 a34 34 0 0 1 68 0 v74" fill="none" stroke="#E3D9C2" strokeWidth="2" />
          <Shadow cx={116} cy={150} rx={72} />
          <g transform="rotate(-3 116 112)">
            <rect x="52" y="66" width="128" height="88" rx="4" fill="#FFFFFF" stroke="#E4DAC4" />
            <rect x="64" y="78" width="56" height="5" rx="2.5" fill="#35a7a0" opacity=".6" />
            {[0, 1, 2].map((r) =>
              [0, 1, 2].map((c) => {
                const i = r * 3 + c;
                const filled = i < 6;
                return (
                  <g key={i} transform={`translate(${64 + c * 38},${94 + r * 18})`}>
                    <rect width="10" height="10" rx="2.5" fill={filled ? "#35a7a0" : "#fff"} stroke={filled ? "#2f9690" : "#D8CDB4"} />
                    {filled && <path d="M2.5 5 l2.2 2.6 3.4 -5" stroke="#fff" strokeWidth="1.6" fill="none" strokeLinecap="round" />}
                    <rect x="15" y="3" width="17" height="3.5" rx="1.75" fill="#E4DAC4" />
                  </g>
                );
              })
            )}
          </g>
          <Shadow cx={140} cy={132} rx={40} />
          <BrandKey x={120} y={116} r={18} color="#2A2F38" carve="#fff" />
          <BrandKey x={136} y={104} r={-8} color="#35a7a0" carve="#fff" />
          <circle cx="121" cy="109" r="14" fill="none" stroke="#B7B0A2" strokeWidth="3.5" opacity=".9" />
        </>
      ),
    },
    legacy: {
      label: "A family photo on a shelf beside a prepared folder of documents",
      sky: "linear-gradient(165deg,#F0E7D8,#EADFCE)",
      draw: (
        <>
          <ellipse cx="52" cy="26" rx="120" ry="70" fill="#E8C98A" opacity=".12" />
          <rect x="26" y="126" width="208" height="9" rx="2" fill="#C6A87E" />
          <rect x="26" y="135" width="208" height="4" rx="1" fill="#A98B62" opacity=".55" />
          <Shadow cx={130} cy={152} rx={86} />
          <g transform="rotate(-2 84 96)">
            <rect x="54" y="62" width="62" height="64" rx="3" fill="#8A6B4A" />
            <rect x="60" y="68" width="50" height="52" rx="2" fill="#F5EFE0" />
            <circle cx="78" cy="88" r="7" fill="#2E353F" opacity=".85" />
            <path d="M68 112 q10 -16 20 0 z" fill="#2E353F" opacity=".85" />
            <circle cx="94" cy="92" r="5.5" fill="#2E353F" opacity=".65" />
            <path d="M86 112 q8 -12 16 0 z" fill="#2E353F" opacity=".65" />
          </g>
          <g transform="rotate(2 176 104)">
            <rect x="140" y="80" width="74" height="46" rx="4" fill="#E4C687" />
            <rect x="146" y="72" width="60" height="14" rx="3" fill="#FFFDF4" stroke="#E4DAC4" />
            <path d="M140 92 h74" stroke="#C9A45B" strokeWidth="1.6" opacity=".7" />
            <rect x="140" y="80" width="30" height="8" rx="3" fill="#D9B463" />
            <circle cx="204" cy="112" r="6" fill="#B4483A" opacity=".85" />
            <circle cx="204" cy="112" r="2.4" fill="#F5EFE0" />
          </g>
          <g transform="rotate(8 220 116)">
            <rect x="204" y="96" width="34" height="24" rx="2" fill="#FFFDF4" stroke="#E0D5BC" />
            <path d="M204 96 l17 12 17 -12" fill="none" stroke="#E0D5BC" />
          </g>
        </>
      ),
    },
  };
  const sc = scenes[kind];
  return (
    <div role="img" aria-label={sc.label} style={{ width: "100%", height: "100%", background: sc.sky }}>
      <svg
        viewBox="0 0 260 170"
        preserveAspectRatio="xMidYMid slice"
        style={{ width: "100%", height: "100%", display: "block" }}
        aria-hidden
      >
        {sc.draw}
      </svg>
    </div>
  );
}

const MOMENTS: {
  kind: "visa" | "hospital" | "home" | "legacy";
  img?: string;
  title: string;
  body: string;
  chip: string;
  state: "ready" | "progress" | "configured";
  progress?: [number, number];
}[] = [
  {
    kind: "visa",
    title: "Visa interview on Monday",
    body: "Passport, bank statements, ITR, insurance: assembled and export-ready before you finish your coffee.",
    chip: "Schengen pack",
    state: "ready",
  },
  {
    kind: "hospital",
    title: "Hospital at 2 a.m.",
    body: "Policy, ID, prescriptions, and reports in one cashless pack, when nobody can think straight.",
    chip: "Admission pack",
    state: "ready",
  },
  {
    kind: "home",
    title: "Keys to a new home",
    body: "The full salaried home-loan checklist, matched against what you already have on file.",
    chip: "Home loan",
    state: "progress",
    progress: [6, 9],
  },
  {
    kind: "legacy",
    title: "For the day you're not there",
    body: "Every policy, nominee, and access instruction, reaching the right people in one tap.",
    chip: "SOS handoff",
    state: "configured",
  },
];

function MomentCard({ m, i }: { m: (typeof MOMENTS)[number]; i: number }) {
  return (
    <motion.div {...fade(0.08 * i)} className="lp-moment">
      <div className="lp-momentimg">
        {m.img ? (
          <img
            src={m.img}
            alt=""
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            onError={(e) => (e.currentTarget.style.display = "none")}
          />
        ) : (
          <MomentScene kind={m.kind} />
        )}
      </div>
      <div style={{ padding: "13px 16px 16px" }}>
        <span className="lp-momentchip">
          {m.state === "configured" ? <ShieldCheck size={11} color={C.action} /> : <Check size={11} color={C.action} />}
          {m.chip}
          {m.state === "progress" && m.progress ? (
            <>
              <span style={{ color: C.muted, fontWeight: 700 }}>{m.progress[0]} of {m.progress[1]}</span>
              <span aria-hidden style={{ width: 44, height: 4, borderRadius: 4, background: "#E8DFCA", overflow: "hidden", display: "inline-block" }}>
                <span style={{ display: "block", width: `${(m.progress[0] / m.progress[1]) * 100}%`, height: "100%", background: C.action }} />
              </span>
            </>
          ) : (
            <span style={{ color: C.muted, fontWeight: 700 }}>{m.state === "configured" ? "configured" : "ready"}</span>
          )}
        </span>
        <div style={{ fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: 16.5, color: C.ink, marginTop: 9 }}>{m.title}</div>
        <p style={{ margin: "6px 0 0", fontSize: 13.5, lineHeight: 1.6, color: C.body }}>{m.body}</p>
      </div>
    </motion.div>
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

function LandingGoogleButton({
  disabled,
  onCredential,
  onError,
}: {
  disabled: boolean;
  onCredential: (credential: string) => void;
  onError: (message: string) => void;
}) {
  return (
    <div style={{ position: "relative" }}>
      <button
        type="button"
        disabled={disabled}
        tabIndex={-1}
        aria-hidden="true"
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
          background: "#fff",
          border: `1px solid ${C.border}`,
          borderRadius: 12,
          padding: "13px",
          fontSize: 14.5,
          fontWeight: 700,
          color: C.ink,
          cursor: disabled ? "not-allowed" : "pointer",
          fontFamily: "inherit",
          opacity: disabled ? 0.6 : 1,
        }}
      >
        <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
        </svg>
        Continue with Google
      </button>
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0,
          overflow: "hidden",
        }}
      >
        <GoogleSignInButton disabled={disabled} onCredential={onCredential} onError={onError} />
      </div>
    </div>
  );
}

function AuthModal({
  mode: initMode,
  onClose,
  onAuthed,
}: {
  mode: "signin" | "signup";
  onClose: () => void;
  onAuthed: (isNew: boolean, name: string) => void;
}) {
  const dispatch = useAppDispatch();
  const [mode, setMode] = useState<"signin" | "signup">(initMode);
  const [screen, setScreen] = useState<"start" | "creds" | "forgot-email" | "forgot-code" | "forgot-password">("start");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [err, setErr] = useState("");
  const [otp, setOtp] = useState("");
  const [resetPw, setResetPw] = useState("");
  const [resetPw2, setResetPw2] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const auth = {
    bg: "var(--lp-navy)",
    panel: "var(--lp-panel)",
    raised: "var(--lp-raised)",
    border: "var(--lp-border)",
    text: "var(--lp-text)",
    heading: "var(--lp-heading)",
    muted: "var(--lp-muted)",
    faint: "var(--lp-faint)",
    action: "var(--lp-action)",
    actionText: "var(--lp-action-text)",
    actionSoft: "color-mix(in srgb, var(--lp-action) 13%, transparent)",
    danger: "var(--lp-coral)",
    scrim: "var(--lpv-scrim)",
    shadow: "0 30px 80px color-mix(in srgb, var(--lp-navy) 35%, transparent)",
  };
  const inp: CSSProperties = {
    width: "100%",
    background: auth.raised,
    border: `1px solid ${auth.border}`,
    borderRadius: 11,
    padding: "12px 14px",
    color: auth.heading,
    fontSize: 15,
    outline: "none",
    marginTop: 10,
    fontFamily: "inherit",
  };
  const passwordRule = (value: string) => {
    if (value.length < 8) return "Password must be at least 8 characters.";
    if (!/[a-z]/.test(value)) return "Password must include a lowercase letter.";
    if (!/[A-Z]/.test(value)) return "Password must include an uppercase letter.";
    if (!/\d/.test(value)) return "Password must include a number.";
    if (!/[^A-Za-z0-9]/.test(value)) return "Password must include a symbol.";
    return "";
  };
  const submit = async () => {
    setErr("");
    if (submitting) return;
    if (!email.trim() || !pw) return setErr("Enter your email and password.");
    setSubmitting(true);
    try {
      if (mode === "signup") {
        if (!name.trim()) return setErr("Enter your name.");
        if (pw !== pw2) return setErr("Passwords do not match.");
        const result = await dispatch(signup({ name: name.trim(), email: email.trim(), password: pw })).unwrap();
        onAuthed(true, result.user.name);
      } else {
        const result = await dispatch(login({ email: email.trim(), password: pw })).unwrap();
        onAuthed(false, result.user.name);
      }
    } catch (error) {
      setErr(error instanceof Error ? error.message : mode === "signup" ? "Unable to create account." : "Unable to sign in.");
    } finally {
      setSubmitting(false);
    }
  };
  const handleGoogleCredential = async (credential: string) => {
    if (submitting) return;
    setErr("");
    setSubmitting(true);
    try {
      const result = await dispatch(googleLogin({ credential })).unwrap();
      onAuthed(mode === "signup", result.user.name);
    } catch {
      setErr(navigator.onLine ? "We could not authenticate that Google account." : "Check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };
  const requestResetOtp = async () => {
    setErr("");
    if (submitting) return;
    if (!email.trim()) return setErr("Enter your account email.");
    setSubmitting(true);
    try {
      await api.auth.forgotPasswordOtp({ email: email.trim() });
      setOtp("");
      setScreen("forgot-code");
    } catch (error) {
      setErr(error instanceof Error ? error.message : "Email not valid.");
    } finally {
      setSubmitting(false);
    }
  };
  const continueWithOtp = () => {
    setErr("");
    if (!otp.match(/^\d{6}$/)) {
      setErr("Enter the 6-digit code from your email.");
      return;
    }
    setScreen("forgot-password");
  };
  const resetPassword = async () => {
    setErr("");
    if (submitting) return;
    const passwordError = passwordRule(resetPw);
    if (passwordError) return setErr(passwordError);
    if (resetPw !== resetPw2) return setErr("Passwords do not match.");
    setSubmitting(true);
    try {
      await api.auth.resetPasswordOtp({ email: email.trim(), otp, password: resetPw });
      toast.success("Password updated. Please sign in again.");
      setMode("signin");
      setScreen("creds");
      setPw("");
      setPw2("");
      setResetPw("");
      setResetPw2("");
      setOtp("");
    } catch (error) {
      setErr(error instanceof Error ? error.message : "Unable to update password.");
    } finally {
      setSubmitting(false);
    }
  };
  const SEC = [
    ["Encrypted storage", "Documents are stored encrypted and protected in transit"],
    ["Consent-led AI analysis", "Document content is analyzed only when you choose that option"],
    ["Secure account sessions", "Refresh-cookie sessions keep access scoped to your account"],
    ["App lock and biometrics", "Face or fingerprint on mobile, PIN on shared screens"],
    ["Emergency SOS handoff", "The right people get access only when you release it"],
    ["Free export, forever", "Your documents are never held hostage"],
  ];
  const ghostBtn: CSSProperties = {
    background: "none",
    border: "none",
    color: auth.muted,
    fontSize: 13,
    cursor: "pointer",
    fontFamily: "inherit",
    marginTop: 12,
  };
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        background: auth.scrim,
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 18,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: auth.panel,
          border: `1px solid ${auth.border}`,
          borderRadius: 20,
          width: screen === "start" ? "min(780px,100%)" : "min(440px,100%)",
          display: "flex",
          overflow: "hidden",
          boxShadow: auth.shadow,
        }}
      >
        <div style={{ flex: 1, padding: 26, minWidth: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <b style={{ fontFamily: "'Space Grotesk'", fontSize: 20, color: auth.heading }}>
              {screen === "forgot-email"
                ? "Reset your password"
                : screen === "forgot-code"
                  ? "Check your email"
                  : screen === "forgot-password"
                      ? "Create a new password"
                  : mode === "signin"
                    ? "Welcome back"
                    : "Create your account"}
            </b>
            <button
              onClick={onClose}
              style={{ background: "none", border: "none", cursor: "pointer", color: auth.muted, display: "flex" }}
            >
              <X size={18} />
            </button>
          </div>

          {screen === "start" && (
            <>
              <div
                style={{
                  display: "flex",
                  border: `1px solid ${auth.border}`,
                  borderRadius: 11,
                  overflow: "hidden",
                  background: auth.raised,
                  marginBottom: 14,
                }}
              >
                {(["signin", "signup"] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => {
                      setMode(m);
                      setErr("");
                    }}
                    style={{
                      flex: 1,
                      padding: "10px 0",
                      fontSize: 13.5,
                      fontWeight: 700,
                      cursor: "pointer",
                      border: "none",
                      fontFamily: "inherit",
                      background: mode === m ? auth.actionSoft : "transparent",
                      color: mode === m ? auth.heading : auth.muted,
                    }}
                  >
                    {m === "signin" ? "Sign in" : "Create account"}
                  </button>
                ))}
              </div>
              <LandingGoogleButton
                disabled={submitting}
                onCredential={handleGoogleCredential}
                onError={setErr}
              />
              <button
                onClick={() => setScreen("creds")}
                style={{
                  width: "100%",
                  background: auth.raised,
                  border: "none",
                  borderRadius: 12,
                  padding: "13px",
                  fontSize: 14.5,
                  fontWeight: 700,
                  color: auth.heading,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  marginTop: 10,
                }}
              >
                Continue with email
              </button>
              {mode === "signin" && (
                <button
                  onClick={() => {
                    setErr("");
                    setScreen("forgot-email");
                  }}
                  style={{ ...ghostBtn, display: "block", margin: "12px auto 0" }}
                >
                  Forgot password?
                </button>
              )}
              {err && <div style={{ color: auth.danger, fontSize: 13, marginTop: 10 }}>{err}</div>}
              <p style={{ fontSize: 11.5, color: auth.muted, textAlign: "center", marginTop: 16, lineHeight: 1.5 }}>
                By continuing you agree to our Terms and Privacy Policy.
                <br />
                Your account is created in Readiness and protected by the app's normal sign-in flow.
              </p>
            </>
          )}

          {screen === "creds" && (
            <>
              {mode === "signup" && (
                <input style={inp} placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
              )}
              <input style={inp} type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
              <input
                style={inp}
                type="password"
                placeholder="Password"
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && mode === "signin" && submit()}
              />
              {mode === "signup" && (
                <input
                  style={inp}
                  type="password"
                  placeholder="Repeat password"
                  value={pw2}
                  onChange={(e) => setPw2(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && submit()}
                />
              )}
              {err && <div style={{ color: auth.danger, fontSize: 13, marginTop: 10 }}>{err}</div>}
              <button onClick={submit} className="lp-cta" style={{ width: "100%", justifyContent: "center", marginTop: 14 }}>
                {submitting ? "Working..." : mode === "signin" ? "Sign in" : "Create my Readiness"} <ArrowRight size={15} />
              </button>
              <button onClick={() => { setScreen("start"); setErr(""); }} style={ghostBtn}>
                ← Other sign-in options
              </button>
            </>
          )}

          {screen === "forgot-email" && (
            <>
              <p style={{ fontSize: 13.5, color: auth.muted, lineHeight: 1.6, margin: "0 0 6px" }}>
                Enter your account email. If it exists, we will send a 6-digit reset code.
              </p>
              <input
                style={inp}
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && requestResetOtp()}
              />
              {err && <div style={{ color: auth.danger, fontSize: 13, marginTop: 10 }}>{err}</div>}
              <button
                onClick={requestResetOtp}
                disabled={submitting}
                className="lp-cta"
                style={{ width: "100%", justifyContent: "center", marginTop: 14, opacity: submitting ? 0.6 : 1 }}
              >
                {submitting ? "Sending..." : "Send OTP"} <ArrowRight size={15} />
              </button>
              <button onClick={() => { setScreen("start"); setErr(""); }} style={ghostBtn}>
                ← Back to sign in
              </button>
            </>
          )}

          {screen === "forgot-code" && (
            <>
              <p style={{ fontSize: 13.5, color: auth.muted, lineHeight: 1.6, margin: "0 0 6px" }}>
                Check your email for the 6-digit OTP. It expires in 30 minutes.
              </p>
              <div style={{ ...inp, display: "flex", justifyContent: "space-between", alignItems: "center", background: auth.raised, cursor: "default" }}>
                <span style={{ fontSize: 14.5, color: auth.heading, fontWeight: 600 }}>{email}</span>
                <button onClick={() => setScreen("forgot-email")} style={{ background: "none", border: "none", color: auth.action, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                  Edit
                </button>
              </div>
              <input
                style={{ ...inp, textAlign: "center", letterSpacing: 8, fontFamily: "ui-monospace, monospace", fontSize: 18 }}
                inputMode="numeric"
                placeholder="000000"
                value={otp}
                autoFocus
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                onKeyDown={(e) => e.key === "Enter" && otp.length === 6 && continueWithOtp()}
              />
              {err && <div style={{ color: auth.danger, fontSize: 13, marginTop: 10 }}>{err}</div>}
              <button
                onClick={continueWithOtp}
                disabled={otp.length !== 6}
                className="lp-cta"
                style={{ width: "100%", justifyContent: "center", marginTop: 14, opacity: otp.length === 6 ? 1 : 0.45 }}
              >
                Continue <ArrowRight size={15} />
              </button>
              <div style={{ display: "grid", justifyItems: "center", gap: 4, marginTop: 12, fontSize: 13, color: auth.muted }}>
                <button
                  onClick={requestResetOtp}
                  style={{ background: "none", border: "none", color: auth.action, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", fontSize: 13, padding: 0 }}
                >
                  Resend OTP
                </button>
              </div>
            </>
          )}

          {screen === "forgot-password" && (
            <>
              <p style={{ fontSize: 13.5, color: auth.muted, lineHeight: 1.6, margin: "0 0 6px" }}>
                Use at least 8 characters with lowercase, uppercase, number, and symbol.
              </p>
              <input
                style={inp}
                type="password"
                placeholder="New password"
                value={resetPw}
                onChange={(e) => setResetPw(e.target.value)}
              />
              <input
                style={inp}
                type="password"
                placeholder="Confirm new password"
                value={resetPw2}
                onChange={(e) => setResetPw2(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && resetPassword()}
              />
              {err && <div style={{ color: auth.danger, fontSize: 13, marginTop: 10 }}>{err}</div>}
              <button
                onClick={resetPassword}
                disabled={submitting}
                className="lp-cta"
                style={{ width: "100%", justifyContent: "center", marginTop: 14, opacity: submitting ? 0.6 : 1 }}
              >
                {submitting ? "Updating..." : "Update password"} <ArrowRight size={15} />
              </button>
              <button
                onClick={() => {
                  setErr("");
                  setScreen("forgot-code");
                }}
                style={ghostBtn}
              >
                ← Back
              </button>
            </>
          )}
        </div>

        {screen === "start" && (
          <div
            className="rn-authside"
            style={{
              width: 300,
              background: auth.bg,
              padding: "26px 22px",
              display: "flex",
              flexDirection: "column",
              gap: 14,
              flexShrink: 0,
            }}
          >
            <b style={{ color: auth.heading, fontSize: 17, fontFamily: "'Space Grotesk'", lineHeight: 1.35 }}>
              Security you can verify. Privacy you don't have to trust us for.
            </b>
            <div style={{ display: "grid", gap: 10 }}>
              {SEC.map(([t, sub]) => (
                <div key={t} style={{ display: "flex", gap: 9, alignItems: "flex-start" }}>
                  <span style={{ width: 20, height: 20, borderRadius: 99, background: auth.action, display: "grid", placeItems: "center", flexShrink: 0, marginTop: 1 }}>
                    <Check size={12} color={auth.actionText} strokeWidth={3} />
                  </span>
                  <span>
                    <span style={{ display: "block", color: auth.heading, fontSize: 13, fontWeight: 700 }}>{t}</span>
                    <span style={{ display: "block", color: auth.muted, fontSize: 11.5, lineHeight: 1.45 }}>{sub}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Landing({
  initialAuthMode = null,
  onAuthed,
}: {
  initialAuthMode?: "signin" | "signup" | null;
  onAuthed: (isNew: boolean) => void;
}) {
  const [auth, setAuth] = useState<null | "signin" | "signup">(initialAuthMode);
  const [billing, setBilling] = useState<"annual" | "monthly">("annual");
  const [founder, setFounder] = useState(false);

  useEffect(() => {
    if (initialAuthMode) setAuth(initialAuthMode);
  }, [initialAuthMode]);

  return (
    <div className="lp-root">
      <style>{CSS}</style>

      <nav className="lp-nav">
        <div className="lp-navinner">
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <BrandMark size={32} carve={C.paper} />
            <BrandWordmark size={19} color={C.ink} />
          </div>
          <div className="lp-navlinks">
            <a href="#features">Features</a>
            <a href="#how">How it works</a>
            <a href="#privacy">Privacy</a>
            <a href="#pricing">Pricing</a>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button
              onClick={() => setAuth("signin")}
              style={{
                background: "none",
                border: `1px solid ${C.border}`,
                borderRadius: 10,
                padding: "9px 16px",
                fontSize: 14,
                fontWeight: 600,
                color: C.ink,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Sign in
            </button>
            <button
              onClick={() => {
                sessionStorage.setItem("lp-fresh", "1");
                setAuth("signup");
              }}
              className="lp-navcta"
            >
              Get started <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </nav>

      <header className="lp-hero">
        <div className="lp-herobg" aria-hidden>
          <Radar />
        </div>
        <div className="lp-heroinner">
          <motion.div {...fade()}>
            <span className="lp-badge">
              <Sparkles size={13} /> Be ready for life's important moments
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
              Readiness quietly gathers, classifies, and assembles every passport, policy, payslip, and prescription, so
              any visa, loan, job switch, or hospital visit is only a few taps away.
            </p>
            <div className="lp-herocta">
              <button
                onClick={() => {
                  sessionStorage.setItem("lp-fresh", "1");
                  setAuth("signup");
                }}
                className="lp-cta"
              >
                Get started <ArrowRight size={17} />
              </button>
              <span className="lp-trust">
                <Lock size={12} /> private by design · encrypted · you control what is stored
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

      <section className="lp-band" style={{ paddingTop: 54 }}>
        <div className="lp-wrap">
          <motion.div {...fade()} style={{ textAlign: "center", maxWidth: 760, margin: "0 auto 26px" }}>
            <div className="lp-eyebrow" style={{ display: "flex", justifyContent: "center" }}>
              Life happens on paper
            </div>
            <h2 className="lp-h2" style={{ margin: 0 }}>
              You know these moments. Readiness makes sure the papers are never the hard part.
            </h2>
          </motion.div>
          <div className="lp-moments">
            {MOMENTS.map((m, i) => (
              <MomentCard key={m.kind} m={m} i={i} />
            ))}
          </div>
        </div>
      </section>

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
            You simply open Readiness, and everything is ready to go. Calm, in order, and entirely yours.
          </p>
        </motion.div>
      </section>

      <section id="features" className="lp-features lp-wrap">
        <Feature
          eyebrow="Life packs"
          title="Assemble any pack in a tap."
          body="Choose a life event. Readiness gathers the right documents from your archive, shows exactly what is ready, and gently points out anything still to add."
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
          body="Link Email, Drive, or DigiLocker, or simply add a photo. Readiness reads each document, files it in the right place, and builds a living graph of your family's papers."
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
          body="Readiness reads your financial and insurance papers for what actually matters: total documented value, and the holdings that still have no nominee named."
          points={["Documented value at a glance", "Nominee gaps surfaced, not buried", "Ready for a clean handoff"]}
          mock={<WealthMock />}
        />
        <Feature
          flip
          eyebrow="Visit companion"
          title="Walk into every appointment ready."
          body="Medications, recent reports, allergies, and trends for the whole family, assembled into a one-tap doctor visit pack. Readiness organizes and surfaces. It never diagnoses."
          points={["One-tap doctor visit pack", "Trends shown against standard ranges", "An emergency card for anyone"]}
          mock={<HealthMock />}
        />
        <Feature
          eyebrow="Search"
          title="You remember the keyword. We find the paper."
          body="No folders to memorize. Type what you recall, a test, a doctor, a month, and Readiness surfaces the prescription, the report, the medication, and everything related."
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
                      background: C.actionSoft,
                      border: `1px solid ${C.action}33`,
                    }}
                  >
                    <s.icon size={20} color={C.action} />
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
              background: C.actionSoft,
              border: `1px solid ${C.action}44`,
              margin: "0 auto 20px",
            }}
          >
            <Lock size={26} color={C.action} />
          </span>
          <h2 className="lp-h2" style={{ maxWidth: 640, margin: "0 auto" }}>
            Private by design. Yours alone.
          </h2>
          <p className="lp-body" style={{ marginTop: 14, maxWidth: 620, margin: "14px auto 0", fontSize: 16 }}>
            Your cloud documents are stored encrypted, sharing is controlled through Trust Center, and document
            analysis uses file content only when you choose that option. You choose who in the family sees what,
            and you can pass it on cleanly when it matters most.
          </p>
          <div className="lp-trust" style={{ justifyContent: "center", marginTop: 22, color: C.muted }}>
            <ShieldCheck size={13} color={C.action} /> encrypted storage · consent-led analysis · no ads, ever
          </div>
        </motion.div>
      </section>

      <section id="pricing" className="lp-wrap">
        <motion.div {...fade()} style={{ textAlign: "center" }}>
          <div className="lp-eyebrow" style={{ display: "flex", justifyContent: "center" }}>Pricing</div>
          <h2 className="lp-h2">Start free. One plan when you're ready.</h2>
          <p className="lp-sub" style={{ marginTop: 10, marginLeft: "auto", marginRight: "auto" }}>
            No silver-gold-platinum ladder to decode. A free vault to begin, and a single full plan with everything included.
          </p>
        </motion.div>
        <motion.div
          {...fade(0.1)}
          style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(290px,1fr))", gap: 18, maxWidth: 900, margin: "30px auto 0", alignItems: "start" }}
        >
          <div style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 22, overflow: "hidden" }}>
            <div style={{ background: C.paper, color: C.muted, fontSize: 11.5, fontWeight: 800, letterSpacing: 1.8, textAlign: "center", padding: "9px 0", borderBottom: `1px solid ${C.border}` }}>
              FREE
            </div>
            <div style={{ padding: "22px 26px 26px" }}>
              <div style={{ textAlign: "center", marginBottom: 6, paddingTop: 47 }}>
                <span style={{ fontFamily: "'Space Grotesk'", fontSize: 44, fontWeight: 700, color: C.ink }}>₹0</span>
                <div style={{ fontSize: 12.5, color: C.muted, marginTop: 4 }}>Everything you need to try the idea</div>
              </div>
              <div style={{ display: "grid", gap: 8, margin: "18px 0 20px" }}>
                {[
                  "Encrypted vault with 50 MB of storage",
                  "AI reads and files 3 documents a month",
                  "1 curated pack to experience readiness",
                  "Every module open: browse and add manually",
                  "Export everything, free, always",
                ].map((f) => (
                  <div key={f} style={{ display: "flex", alignItems: "flex-start", gap: 9, fontSize: 13.5, color: C.body }}>
                    <span style={{ width: 18, height: 18, borderRadius: 99, background: C.actionSoft, display: "grid", placeItems: "center", flexShrink: 0, marginTop: 1 }}><Check size={11} color={C.action} strokeWidth={3} /></span>
                    {f}
                  </div>
                ))}
              </div>
              <button
                onClick={() => {
                  sessionStorage.setItem("lp-fresh", "1");
                  setAuth("signup");
                }}
                style={{ width: "100%", background: "none", border: `1.5px solid ${C.ink}`, borderRadius: 12, padding: "13px", fontSize: 14.5, fontWeight: 700, color: C.ink, cursor: "pointer", fontFamily: "inherit", display: "flex", justifyContent: "center", alignItems: "center", gap: 8 }}
              >
                Start free <ArrowRight size={15} />
              </button>
            </div>
          </div>

          <div style={{ background: "#fff", border: `1.5px solid ${C.action}`, borderRadius: 22, overflow: "hidden", boxShadow: "0 24px 60px rgba(34,30,23,.10)" }}>
            <div style={{ background: C.ink, color: "#E6EBF5", fontSize: 11.5, fontWeight: 800, letterSpacing: 1.8, textAlign: "center", padding: "9px 0" }}>
              READY FOR EVERYTHING
            </div>
            <div style={{ padding: "22px 26px 26px" }}>
              <div style={{ display: "flex", border: `1px solid ${C.border}`, borderRadius: 11, overflow: "hidden", background: C.paper, marginBottom: 18 }}>
                {(["annual", "monthly"] as const).map((b) => (
                  <button
                    key={b}
                    onClick={() => setBilling(b)}
                    style={{ flex: 1, padding: "9px 0", fontSize: 13.5, fontWeight: 700, cursor: "pointer", border: "none", fontFamily: "inherit", background: billing === b ? C.actionSoft : "transparent", color: billing === b ? C.ink : C.muted }}
                  >
                    {b === "annual" ? "Annual" : "Monthly"}
                  </button>
                ))}
              </div>
              {billing === "annual" ? (
                <div style={{ textAlign: "center", marginBottom: 6 }}>
                  {founder ? (
                    <>
                      <span style={{ fontFamily: "'Space Grotesk'", fontSize: 44, fontWeight: 700, color: C.ink }}>₹1,499</span>
                      <span style={{ fontSize: 15, color: C.muted }}> /year</span>
                      <div style={{ fontSize: 12.5, color: C.muted, marginTop: 4 }}>
                        Early member price · standard <s style={{ opacity: 0.7 }}>₹1,999</s>
                      </div>
                    </>
                  ) : (
                    <>
                      <span style={{ fontFamily: "'Space Grotesk'", fontSize: 44, fontWeight: 700, color: C.ink }}>₹1,999</span>
                      <span style={{ fontSize: 15, color: C.muted }}> /year</span>
                      <div style={{ fontSize: 12.5, color: C.muted, marginTop: 4 }}>About ₹167 a month, billed yearly</div>
                    </>
                  )}
                  <button
                    onClick={() => setFounder((v) => !v)}
                    style={{ marginTop: 8, background: founder ? C.actionSoft : "none", border: `1px solid ${founder ? C.action : C.border}`, borderRadius: 99, padding: "5px 12px", fontSize: 12, fontWeight: 700, color: C.ink, cursor: "pointer", fontFamily: "inherit" }}
                  >
                    {founder ? "Early member offer applied ✓" : "Early member offer · ₹1,499/year"}
                  </button>
                </div>
              ) : (
                <div style={{ textAlign: "center", marginBottom: 6 }}>
                  <span style={{ fontFamily: "'Space Grotesk'", fontSize: 44, fontWeight: 700, color: C.ink }}>₹249</span>
                  <span style={{ fontSize: 15, color: C.muted }}> /month</span>
                  <div style={{ fontSize: 12.5, color: C.muted, marginTop: 4 }}>Cancel anytime · annual saves ₹989 a year</div>
                </div>
              )}
              <p style={{ fontSize: 13, color: C.muted, textAlign: "center", margin: "14px 0 0" }}>
                One plan that keeps the whole family ready:
              </p>
              <div style={{ display: "grid", gap: 8, margin: "10px 0 20px" }}>
                {[
                  "All 100+ life-event packs, prepared before you need them",
                  "AI reads, files and scores every document, without limits",
                  "Family access levels with SOS handoff",
                  "Gmail, Drive and DigiLocker feed the vault automatically",
                  "Encrypted storage for your whole family",
                  "And everything in Free, without limits",
                ].map((f) => (
                  <div key={f} style={{ display: "flex", alignItems: "flex-start", gap: 9, fontSize: 13.5, color: C.body }}>
                    <span style={{ width: 18, height: 18, borderRadius: 99, background: C.actionSoft, display: "grid", placeItems: "center", flexShrink: 0, marginTop: 1 }}><Check size={11} color={C.action} strokeWidth={3} /></span>
                    {f}
                  </div>
                ))}
              </div>
              <button
                onClick={() => {
                  sessionStorage.setItem("lp-fresh", "1");
                  setAuth("signup");
                }}
                className="lp-cta"
                style={{ width: "100%", justifyContent: "center" }}
              >
                Get started <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </motion.div>

        <motion.div {...fade(0.15)} style={{ maxWidth: 900, margin: "28px auto 0", background: "#fff", border: `1px solid ${C.border}`, borderRadius: 18, overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1.7fr 1fr 1fr", background: C.paper, borderBottom: `1px solid ${C.border}`, padding: "12px 18px", fontSize: 12.5, fontWeight: 800, color: C.ink, letterSpacing: 0.4 }}>
            <span>What you get</span>
            <span style={{ textAlign: "center" }}>Free</span>
            <span style={{ textAlign: "center" }}>Full plan</span>
          </div>
          {[
            ["Encrypted storage", "50 MB", "For your whole family"],
            ["Documents the AI reads and files", "3 a month", "Unlimited"],
            ["Curated life-event packs", "1 sample pack", "All 100+"],
            ["Readiness scores", "On your sample pack", "Across every pack"],
            ["Modules: Documents, Health, Wealth, Trust", "Browse and add manually", "Full AI automation"],
            ["Family access levels + SOS handoff", "—", "Included"],
            ["Gmail, Drive and DigiLocker connections", "—", "Included"],
            ["Export your documents", "Free, always", "Free, always"],
            ["Your files if you stop paying", "Yours, always", "Yours, always"],
          ].map(([a, b, c], i) => (
            <div key={a} style={{ display: "grid", gridTemplateColumns: "1.7fr 1fr 1fr", padding: "11px 18px", fontSize: 13, color: C.body, borderBottom: i < 8 ? `1px solid ${C.border}` : "none", alignItems: "center" }}>
              <span style={{ fontWeight: 600, color: C.ink }}>{a}</span>
              <span style={{ textAlign: "center", color: b === "—" ? C.muted : C.body }}>{b}</span>
              <span style={{ textAlign: "center", fontWeight: 600 }}>{c}</span>
            </div>
          ))}
        </motion.div>
        <p style={{ fontSize: 12.5, color: C.muted, textAlign: "center", lineHeight: 1.6, margin: "16px auto 0", maxWidth: 460 }}>
          Your documents are never locked behind a paywall. If you ever stop paying, you keep every file and every
          export — the AI simply stops doing new work. No ads, no selling your data, ever.
        </p>
      </section>

      <section className="lp-wrap">
        <motion.div {...fade()} className="lp-finalcta">
          <div className="lp-herobg" aria-hidden style={{ opacity: 0.8 }}>
            <Radar />
          </div>
          <div style={{ position: "relative" }}>
            <h2 className="lp-h1" style={{ fontSize: 40 }}>
              Be ready for life's <span style={{ color: C.clay }}>important moments.</span>
            </h2>
            <p className="lp-sub" style={{ marginTop: 12, marginLeft: "auto", marginRight: "auto" }}>
              Set it up once, and let the next big moment be the easy one.
            </p>
            <button
              onClick={() => {
                sessionStorage.setItem("lp-fresh", "1");
                setAuth("signup");
              }}
              className="lp-cta"
              style={{ marginTop: 26 }}
            >
              Get started <ArrowRight size={17} />
            </button>
          </div>
        </motion.div>
      </section>

      <footer className="lp-footer">
        <div className="lp-wrap lp-footinner">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <BrandMark size={26} carve={C.paper} />
            <BrandWordmark size={15} color={C.ink} />
          </div>
          <span style={{ fontSize: 13, color: C.muted }}>A private, ready archive for your whole family.</span>
          <span
            style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11.5, letterSpacing: 1.5, color: C.muted }}
          >
            PRIVATE BY DESIGN · ENCRYPTED · NO ADS, EVER
          </span>
        </div>
      </footer>
      {auth && (
        <AuthModal
          mode={auth}
          onClose={() => setAuth(null)}
          onAuthed={(isNew) => {
            if (isNew) sessionStorage.setItem("lp-new-account", "1");
            onAuthed(isNew);
          }}
        />
      )}
    </div>
  );
}

const CSS = `
@media(max-width:819px){.rn-authside{display:none!important}}

@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');
.lp-root{background:${C.paper};color:${C.ink};font-family:'Inter',system-ui,sans-serif;overflow-x:hidden}
.lp-root *{box-sizing:border-box}
.lp-root a{text-decoration:none;color:inherit}
.lp-wrap{max-width:1120px;margin:0 auto;padding:0 24px}
.lp-eyebrow{font-family:'JetBrains Mono',monospace;font-size:12px;font-weight:600;letter-spacing:.18em;text-transform:uppercase;color:${C.action}}
.lp-h1{font-family:'Space Grotesk';font-weight:700;font-size:56px;line-height:1.04;letter-spacing:-1.6px;color:${C.ink};margin:20px 0 0}
.lp-h2{font-family:'Space Grotesk';font-weight:700;font-size:29px;line-height:1.24;letter-spacing:-.5px;color:${C.ink};margin:10px 0 0}
.lp-h3{font-family:'Space Grotesk';font-weight:700;font-size:27px;line-height:1.15;letter-spacing:-.5px;color:${C.ink};margin:8px 0 0}
.lp-body{color:${C.body};font-size:15.5px;line-height:1.66}
.lp-tag{display:inline-flex;align-items:center;gap:5px;font-size:11.5px;color:${C.body};background:${C.panel2};border:1px solid ${C.border};border-radius:8px;padding:5px 9px}
.lp-nav{position:sticky;top:0;z-index:50;background:${C.paper}d9;backdrop-filter:blur(12px);border-bottom:1px solid ${C.border}}
.lp-navinner{max-width:1120px;margin:0 auto;padding:14px 24px;display:flex;align-items:center;justify-content:space-between;gap:20px}
.lp-navlinks{display:flex;gap:28px;font-size:14.5px;color:${C.body}}
.lp-navlinks a:hover{color:${C.ink}}
.lp-navcta{display:inline-flex;align-items:center;gap:7px;background:${C.action};color:${C.actionText};font-weight:700;font-size:14px;border:0;border-radius:10px;padding:9px 16px;cursor:pointer;font-family:inherit}
.lp-navcta:hover{filter:brightness(1.04)}
.lp-hero{position:relative;padding:60px 0 40px;overflow:hidden}
.lp-herobg{position:absolute;inset:0;pointer-events:none}
.lp-heroinner{position:relative;max-width:1120px;margin:0 auto;padding:0 24px;display:grid;grid-template-columns:1.05fr .95fr;gap:52px;align-items:center}
.lp-badge{display:inline-flex;align-items:center;gap:7px;font-family:'JetBrains Mono',monospace;font-size:11.5px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;color:${C.action};background:${C.actionSoft};border:1px solid ${C.action}44;border-radius:20px;padding:6px 13px}
.lp-sub{color:${C.body};font-size:17.5px;line-height:1.6;margin-top:22px;max-width:540px}
.lp-herocta{display:flex;gap:18px;align-items:center;margin-top:30px;flex-wrap:wrap}
.lp-cta{display:inline-flex;align-items:center;gap:9px;background:${C.action};color:${C.actionText};font-weight:700;font-size:15.5px;border:0;border-radius:12px;padding:14px 24px;cursor:pointer;font-family:inherit;box-shadow:0 14px 36px ${C.action}66}
.lp-cta:hover{filter:brightness(1.04);transform:translateY(-1px)}
.lp-trust{display:inline-flex;align-items:center;gap:7px;font-family:'JetBrains Mono',monospace;font-size:12px;letter-spacing:.4px;color:${C.muted}}
.lp-heromock{position:relative}
.lp-mock{background:${C.panel};border:1px solid ${C.border};border-radius:18px;box-shadow:0 30px 70px rgba(80,60,30,.16)}
.lp-heromock:before{content:"";position:absolute;inset:-30px;background:radial-gradient(circle at 60% 45%,${C.action}44,transparent 66%);filter:blur(30px);z-index:-1}
.lp-connectors{max-width:1120px;margin:48px auto 0;padding:0 24px;display:flex;align-items:center;gap:14px;flex-wrap:wrap;justify-content:center;color:${C.muted};font-size:13px}
.lp-conn{display:inline-flex;align-items:center;gap:7px;color:${C.body};background:${C.panel};border:1px solid ${C.border};border-radius:20px;padding:7px 14px;font-size:13px}
.lp-moments{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:16px}
.lp-moment{background:#fff;border:1px solid #E3D8C2;border-radius:16px;overflow:hidden;box-shadow:0 14px 34px rgba(60,48,20,.08);transition:transform .18s ease}
.lp-moment:hover{transform:translateY(-4px);box-shadow:0 20px 44px rgba(60,48,20,.12)}
.lp-momentimg{position:relative;height:172px;overflow:hidden}
.lp-momentimg>div{transition:transform .35s ease}
.lp-moment:hover .lp-momentimg>div{transform:scale(1.028)}
@media(max-width:640px){.lp-momentimg{height:150px}}
.lp-momentchip{display:inline-flex;align-items:center;gap:7px;background:#FBF7EC;border:1px solid #E4DAC4;border-radius:99px;padding:4px 11px;font-size:11px;font-weight:800;color:#221E17;font-family:'JetBrains Mono',monospace}
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
.lp-caret{width:2px;height:15px;background:${C.action};display:inline-block;animation:lpblink 1s steps(2) infinite}
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
