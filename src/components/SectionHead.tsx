import type { ReactNode } from "react";

import { btnPrimary, T } from "@/constants/theme";

type SectionHeadProps = {
  title: string;
  sub: string;
  action?: ReactNode;
};

export default function SectionHead({ title, sub, action }: SectionHeadProps) {
  const openUpload = () => {
    window.dispatchEvent(new CustomEvent("readiness:open-upload"));
  };

  return (
    <div className="lp-section-head">
      <div>
        <h2
          style={{
            color: T.white,
            fontFamily:
              '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
            fontSize: 26,
            fontWeight: 800,
            lineHeight: 1.2,
            margin: 0,
            letterSpacing: -0.5,
          }}
        >
          {title}
        </h2>
        <p style={{ color: T.muted, fontSize: 14.5, lineHeight: 1.5, margin: "6px 0 0" }}>
          {sub}
        </p>
      </div>

      {action === undefined ? <button type="button" onClick={openUpload} style={btnPrimary}>Upload</button> : action}
    </div>
  );
}
