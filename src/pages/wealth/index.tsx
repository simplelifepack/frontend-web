import { useState } from "react";
import { AlertTriangle, ArrowRight, FileCheck, KeyRound, Lock, ShieldAlert } from "lucide-react";

import Card from "@/components/Card";
import SectionHead from "@/components/SectionHead";
import { btnGhost, T } from "@/constants/theme";
import { WEALTH, money } from "@/data/demoData";

export default function WealthPage() {
  const [onlyNoNominee, setOnlyNoNominee] = useState(false);
  const rows = onlyNoNominee ? WEALTH.filter((item) => !item.nominee && item.cls === "asset") : WEALTH;
  const assets = WEALTH.filter((item) => item.cls === "asset").reduce((total, item) => total + item.value, 0);
  const liabilities = WEALTH.filter((item) => item.cls === "liability").reduce((total, item) => total + item.value, 0);
  const gaps = WEALTH.filter((item) => item.cls === "asset" && !item.nominee).length;

  return (
    <div className="lp-route lp-wealth-route">
      <SectionHead
        title="Wealth"
        sub="Not a balance sheet: whether your family could access all of it if something happened to you."
        action={null}
      />

      <div className="lp-wealth-actions">
        <button type="button" style={btnGhost}><FileCheck size={15} /> Capture proof</button>
        <button type="button" className="danger"><ShieldAlert size={15} /> SOS handoff</button>
        <button type="button" style={btnGhost}><Lock size={15} /> Add passcode</button>
      </div>

      <div className="lp-wealth-hero">
        <Card>
          <div className="lp-wealth-card-title"><KeyRound size={16} /> Estate readiness <span>{WEALTH.length} holdings tracked</span></div>
          <div className="lp-wealth-score">53% <small>of documented value your family could actually reach</small></div>
          <div className="lp-wealth-progress"><i style={{ width: "53%" }} /></div>
          <div className="lp-wealth-gaps">
            <span>{Math.max(0, WEALTH.filter((item) => item.nominee).length)} missing nominees</span>
            <span>{gaps + 1} missing documents</span>
            <span>1 missing access instruction</span>
            <time>~11 min to fix</time>
          </div>
          <button type="button" className="lp-wealth-computed">⌄ How is this computed?</button>
        </Card>
        <Card style={{ background: "linear-gradient(135deg,#171D2B,#1D2029)", borderColor: "rgba(217,184,106,.25)" }}>
          <div className="lp-wealth-summary-title"><FileCheck size={17} /> Estate summary</div>
          <p>The one document your family opens first: every holding, nominee, location, and the first steps to take.</p>
          <div className="lp-wealth-summary-foot"><b>53% ready for family</b><button type="button">Preview <ArrowRight size={14} /></button></div>
        </Card>
      </div>

      <div className="lp-wealth-strip">
        <span>Net worth <b>{money(assets - liabilities)}</b></span>
        <span>Assets <b>{money(assets)}</b></span>
        <span>Liabilities <b>{money(liabilities)}</b></span>
        <span>Protection <b>{money(Math.max(0, assets - liabilities) * .55)}</b></span>
      </div>

      <Card style={{ marginBottom: 16, padding: 0, overflow: "hidden" }}>
        <button
          type="button"
          onClick={() => setOnlyNoNominee((current) => !current)}
          className="lp-wealth-attention-head"
        >
          <AlertTriangle size={16} color={gaps ? T.coral : T.mint} />
          <b style={{ color: T.white }}>Needs attention</b>
          <span style={{ marginLeft: "auto", color: T.gold, fontFamily: "ui-monospace,monospace" }}>{gaps}</span>
        </button>
        {WEALTH.filter((item) => item.cls === "asset" && !item.nominee).map((item) => (
          <div key={item.name} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderTop: `1px solid ${T.border}` }}>
            <div style={{ flex: 1 }}>
              <div style={{ color: T.coral, font: "700 10px ui-monospace,monospace", letterSpacing: 1 }}>CRITICAL</div>
              <div style={{ color: T.text, fontSize: 13.5, fontWeight: 700, marginTop: 3 }}>{item.name} · no nominee named</div>
              <div style={{ color: T.muted, fontSize: 11.5, marginTop: 2 }}>A family claim may require additional legal verification.</div>
            </div>
            <button type="button" style={btnGhost}>Add nominee</button>
          </div>
        ))}
      </Card>

      <Card style={{ padding: 0, overflow: "hidden", marginBottom: 16 }}>
        {rows.map((item, index) => (
          <div
            key={item.name}
            style={{
              display: "grid",
              gridTemplateColumns: "1.8fr 1fr 1fr",
              alignItems: "center",
              padding: "13px 16px",
              borderTop: index ? `1px solid ${T.border}` : "none",
              fontSize: 13,
            }}
          >
            <div>
              <div style={{ color: T.text, fontWeight: 600 }}>{item.name}</div>
              <div style={{ color: T.faint, fontSize: 11.5, marginTop: 2 }}>{item.type}</div>
            </div>
            <div style={{ color: item.cls === "liability" ? T.coral : T.text, fontWeight: 600 }}>
              {item.cls === "liability" ? "-" : ""}
              {money(item.value)}
            </div>
            <div style={{ textAlign: "right", color: item.nominee ? T.mint : T.coral, fontSize: 11.5 }}>
              {item.nominee ? "nominee set" : "no nominee"}
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}
