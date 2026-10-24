import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Text, Heading, Stack, Row, LinearProgress, typography } from "@/design-system";
import { landingBrand as C } from "@/design-system/variables/brand";
import { BrandMark } from "../BrandLogo";
import { ShieldCheck, HeartPulse, Search, Lock, Wallet, Mail, HardDrive, Check, CalendarClock, Pill, FlaskConical, UploadCloud, Sparkles, FileText, Plane, Briefcase, Stamp, Landmark, X } from "lucide-react";

export function Radar({ animated = true }: { animated?: boolean }) {
  const reduced = useReducedMotion();
  return (
    <svg
      viewBox="0 0 900 720"
      preserveAspectRatio="xMidYMid slice"
      style={{ width: "100%", height: "100%" }}
      aria-hidden
    >
      <motion.g
        style={{ transformOrigin: "620px 340px" }}
        animate={animated && !reduced ? { rotate: 360 } : undefined}
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
        animate={animated && !reduced ? { rotate: 360 } : undefined}
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