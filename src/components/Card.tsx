import type { CSSProperties, ReactNode } from "react";

import { T } from "@/constants/theme";

type CardProps = {
  children: ReactNode;
  style?: CSSProperties;
};

export default function Card({ children, style }: CardProps) {
  return (
    <div
      style={{
        background: T.panel,
        border: `1px solid ${T.border}`,
        borderRadius: 14,
        padding: 18,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
