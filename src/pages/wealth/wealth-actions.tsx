import {
  Text,
  DrawerPortal,
  DrawerBackdrop,
  DrawerPanel,
  Button,
  ListAction,
} from "@/design-system";

import { Coins, FileCheck, FileText, Plus, ShieldAlert } from "lucide-react";

export function WealthDesktopActions({
  onHolding,
  onProof,
  onMoney,
  onSos,
}: {
  onHolding: () => void;
  onProof: () => void;
  onMoney: () => void;
  onSos: () => void;
}) {
  return (
    <div className="lp-wealth-actions">
      <Button variant="secondary" type="button" onClick={onHolding}>
        <Plus aria-hidden="true" focusable="false" size={15} /> Add holding
      </Button>
      <Button variant="secondary" type="button" onClick={onProof}>
        <FileCheck aria-hidden="true" focusable="false" size={15} /> Capture
        proof
      </Button>
      <Button variant="secondary" type="button" onClick={onMoney}>
        <Coins aria-hidden="true" focusable="false" size={15} /> Money lent /
        borrowed
      </Button>
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
    <DrawerPortal>
      <DrawerBackdrop
        aria-label="Close wealth actions"
        className="lp-scrim"
        onClick={onClose}
      />
      <DrawerPanel
        onDismiss={onClose}
        edge="bottom"
        className="lp-sheet"
        role="dialog"
        aria-modal="true"
        aria-label="Wealth actions"
      >
        <div className="lp-sheet-grab" />
        <div className="lp-sheet-head">
          <Text as="b" size="lg" weight="semibold">
            Wealth actions
          </Text>
          <Button size="sm" variant="tertiary" type="button" onClick={onClose}>
            Done
          </Button>
        </div>
        <ListAction variant="tertiary" type="button" onClick={onDocument}>
          <FileText aria-hidden="true" focusable="false" size={19} /> From a
          document in your vault
        </ListAction>
        <ListAction variant="tertiary" type="button" onClick={onHolding}>
          <Plus aria-hidden="true" focusable="false" size={19} /> Without a
          document (cash, gold, informal)
        </ListAction>
        <ListAction variant="tertiary" type="button" onClick={onMoney}>
          <Coins aria-hidden="true" focusable="false" size={19} /> Record money
          lent or borrowed
        </ListAction>
      </DrawerPanel>
    </DrawerPortal>
  );
}
