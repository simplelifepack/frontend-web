import { Check } from "lucide-react";

const wrap = "rounded-2xl bg-[#0B0E24] p-5 min-h-[260px] relative overflow-hidden";

function PackagesVisual() {
  const rows: Array<[string, boolean]> = [
    ["Passport", true],
    ["Payslips (3 mo)", true],
    ["Bank statements", true],
    ["Travel insurance", false],
    ["Hotel booking", false],
  ];

  return (
    <div className={wrap}>
      <div className="font-mono text-[11px] tracking-widest text-white/40 uppercase mb-4">
        Schengen Visa . 82%
      </div>
      {rows.map(([label, ok], index) => (
        <div
          key={index}
          className="flex items-center gap-2.5 py-2 border-t border-white/5 first:border-0"
        >
          <span
            className="grid place-items-center rounded-md"
            style={{ width: 20, height: 20, background: ok ? "#1e3a2f" : "#3a2a1e" }}
          >
            {ok ? <Check size={12} color="#2FB68A" /> : <span className="text-seal text-[12px]">!</span>}
          </span>
          <span className="text-white/80 text-[14px]">{label}</span>
        </div>
      ))}
    </div>
  );
}

function HealthVisual() {
  const rows: Array<[string, string]> = [
    ["Prescription - Diabetes", "10 Jun"],
    ["Lab Report - HbA1c", "10 Jun"],
    ["Prescription - BP", "02 May"],
  ];

  return (
    <div className={wrap}>
      <div className="font-mono text-[11px] tracking-widest text-white/40 uppercase mb-4">
        Dad . records timeline
      </div>
      {rows.map(([name, date], index) => (
        <div
          key={index}
          className="flex items-center gap-3 py-2.5 border-t border-white/5 first:border-0"
        >
          <span className="w-2 h-2 rounded-full" style={{ background: "#E0508F" }} />
          <span className="text-white/80 text-[14px] flex-1">{name}</span>
          <span className="font-mono text-white/40 text-[12px]">{date}</span>
        </div>
      ))}
      <div className="mt-3 flex items-end gap-1 h-12">
        {[6.8, 7.1, 6.9, 6.5, 6.4].map((value, index) => (
          <div
            key={index}
            className="flex-1 rounded-t bg-seal/40"
            style={{ height: `${(value - 6) * 70}%` }}
          />
        ))}
      </div>
    </div>
  );
}

function ReadyVisual() {
  const rows: Array<[string, string, string]> = [
    ["Vehicle insurance", "10d", "#D8B25A"],
    ["Health insurance", "53d", "#ffffff"],
    ["Rental agreement", "expired", "#E04A4F"],
  ];

  return (
    <div className={wrap}>
      <div className="font-mono text-[11px] tracking-widest text-white/40 uppercase mb-4">
        Expiring soon
      </div>
      {rows.map(([name, date, color], index) => (
        <div
          key={index}
          className="flex items-center justify-between py-2.5 border-t border-white/5 first:border-0"
        >
          <span className="text-white/80 text-[14px]">{name}</span>
          <span className="font-mono text-[12px]" style={{ color }}>
            {date}
          </span>
        </div>
      ))}
    </div>
  );
}

function DiscoverVisual() {
  return (
    <div className={wrap}>
      <div className="font-mono text-[11px] tracking-widest text-white/40 uppercase mb-4">
        Document graph
      </div>
      <div className="grid grid-cols-3 gap-2.5">
        {["Identity", "Finance", "Insurance", "Property", "Medical", "Employment"].map((category, index) => (
          <div key={category} className="rounded-xl bg-white/[0.05] border border-white/5 p-3">
            <div className="text-white/80 text-[12.5px] font-semibold">{category}</div>
            <div className="font-mono text-[11px] text-seal mt-1">{[4, 4, 3, 3, 2, 4][index]} docs</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function TabVisual({ id }: { id: string }) {
  if (id === "packages") return <PackagesVisual />;
  if (id === "health") return <HealthVisual />;
  if (id === "ready") return <ReadyVisual />;
  return <DiscoverVisual />;
}
