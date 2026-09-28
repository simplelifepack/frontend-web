import { Coins, FileCheck, FileText, Plus, ShieldAlert } from "lucide-react";

import { btnGhost } from "@/constants/theme";

export function WealthDesktopActions({ onHolding, onProof, onMoney, onSos }: { onHolding: () => void; onProof: () => void; onMoney: () => void; onSos: () => void }) {
  return (
    <div className="lp-wealth-actions">
      <button type="button" style={btnGhost} onClick={onHolding}><Plus size={15} /> Add holding</button>
      <button type="button" style={btnGhost} onClick={onProof}><FileCheck size={15} /> Capture proof</button>
      <button type="button" style={btnGhost} onClick={onMoney}><Coins size={15} /> Money lent / borrowed</button>
    </div>
  );
}

export function WealthActionSheet({
  onClose,
  onDocument,
  onHolding,
  onMoney,
}: {
  onClose: () => void;
  onDocument: () => void;
  onHolding: () => void;
  onMoney: () => void;
}) {
  return (
    <>
      <div className="lp-scrim" onClick={onClose} />
      <div
        className="lp-sheet"
        role="dialog"
        aria-modal="true"
        aria-label="Wealth actions"
      >
        <div className="lp-sheet-grab" />
        <div className="lp-sheet-head">
          <b>Wealth actions</b>
          <button type="button" onClick={onClose}>
            Done
          </button>
        </div>
        <button type="button" className="lp-sheet-item" onClick={onDocument}>
          <FileText size={19} /> From a document in your vault
        </button>
        <button type="button" className="lp-sheet-item" onClick={onHolding}>
          <Plus size={19} /> Without a document (cash, gold, informal)
        </button>
        <button type="button" className="lp-sheet-item" onClick={onMoney}>
          <Coins size={19} /> Record money lent or borrowed
        </button>
      </div>
    </>
  );
}
