import { motion } from "framer-motion";

export default function Guilloche({ color = "#D8B25A" }: { color?: string }) {
  const rings = Array.from({ length: 7 }, (_, i) => 60 + i * 34);
  const waves = Array.from({ length: 3 }, (_, k) => {
    let d = "M0 250 ";
    for (let x = 0; x <= 900; x += 12) {
      d += `L${x} ${250 + Math.sin(x / 60 + k * 1.6) * (30 + k * 8)} `;
    }
    return d;
  });

  return (
    <svg
      viewBox="0 0 900 500"
      className="absolute inset-0 w-full h-full"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      <motion.g
        style={{ transformOrigin: "680px 210px" }}
        animate={{ rotate: 360 }}
        transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
      >
        {rings.map((r, i) => (
          <circle
            key={i}
            cx={680}
            cy={210}
            r={r}
            fill="none"
            stroke={color}
            strokeOpacity={0.13 - i * 0.012}
            strokeWidth={1}
          />
        ))}
        {Array.from({ length: 60 }).map((_, i) => {
          const a = (i / 60) * Math.PI * 2;
          return (
            <line
              key={i}
              x1={680 + Math.cos(a) * 250}
              y1={210 + Math.sin(a) * 250}
              x2={680 + Math.cos(a) * 268}
              y2={210 + Math.sin(a) * 268}
              stroke={color}
              strokeOpacity={0.16}
              strokeWidth={1}
            />
          );
        })}
      </motion.g>
      {waves.map((d, i) => (
        <path
          key={i}
          d={d}
          fill="none"
          stroke="#6E8BFF"
          strokeOpacity={0.07 + i * 0.02}
          strokeWidth={1}
        />
      ))}
    </svg>
  );
}
