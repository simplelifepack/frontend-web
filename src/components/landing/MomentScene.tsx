import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { Text, Heading, Stack, Row, LinearProgress, typography } from "@/design-system";
import { landingBrand as C } from "@/design-system/variables/brand";
import { BrandMark } from "../BrandLogo";
import { ShieldCheck, HeartPulse, Search, Lock, Wallet, Mail, HardDrive, Check, CalendarClock, Pill, FlaskConical, UploadCloud, Sparkles, FileText, Plane, Briefcase, Stamp, Landmark, X } from "lucide-react";
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

function MomentScene({ kind }: { kind: "travel" | "care" | "home" | "legacy" }) {
  const scenes: Record<string, { sky: string; label: string; draw: ReactNode }> = {
    travel: {
      label: "Travel papers laid out on a desk beside a cup of coffee",
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
    care: {
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
      label: "Two keys resting on a checklist",
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


export { MomentScene };
