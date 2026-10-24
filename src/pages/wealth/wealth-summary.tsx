import {
  Text,
  Button,
  Card,
  Stack,
  Row,
  Center,
  IconBadge,
  LinearProgress,
} from "@/design-system";

import { ChevronRight, Coins, Link2, ShieldAlert, Wallet } from "lucide-react";

import type { WealthRecord } from "@/lib/api";
import {
  classifyWealthRecord,
  dashboardStats,
  money,
  recordHomeAmount,
  statusFor,
} from "./wealth-view";

export function Readiness({
  stats,
  records,
  showMath,
  onMath,
  onSos,
  onLent,
}: {
  stats: ReturnType<typeof dashboardStats>;
  records: WealthRecord[];
  showMath: boolean;
  onMath: () => void;
  onSos: () => void;
  onLent: () => void;
}) {
  const gaps = stats.accessMissing;
  const owedToYou = records
    .filter(
      (record) =>
        classifyWealthRecord(record) === "lentBorrowed" &&
        record.details.direction !== "BORROWED" &&
        record.details.direction !== "received",
    )
    .reduce((total, record) => total + recordHomeAmount(record), 0);
  const youOwe = records
    .filter(
      (record) =>
        classifyWealthRecord(record) === "lentBorrowed" &&
        (record.type === "LOAN_TAKEN" ||
          record.details.direction === "BORROWED" ||
          record.details.direction === "received"),
    )
    .reduce((total, record) => total + recordHomeAmount(record), 0);
  return (
    <Stack $spaceAfter="s16">
      <Card>
        <Stack $gap="s16">
          <Row $justify="space-between">
            <Row $gap="s8">
              <Link2 aria-hidden="true" size="var(--icon-regular)" />
              <Text weight="semibold">Family access readiness</Text>
            </Row>
            <Row $gap="s8">
              <Text size="lg" weight="semibold">
                {stats.readiness}%
              </Text>
              <Button
                size="sm"
                variant="tertiary"
                type="button"
                onClick={onMath}
              >
                {showMath ? "Hide" : "How?"}
              </Button>
            </Row>
          </Row>
          <LinearProgress
            $tone="readiness"
            value={stats.readiness}
            max={100}
            aria-label="Family access readiness"
          />
          <Row $justify="space-between">
            <Row>
              <Text tone="muted">{records.length} docs</Text>
              <Text tone="muted">{gaps} access missing</Text>
            </Row>
            <Button variant="tertiary" type="button" onClick={onSos}>
              <ShieldAlert aria-hidden="true" size="var(--icon-regular)" />
              SOS handoff
            </Button>
          </Row>
          <Button
            variant="secondary"
            type="button"
            fullWidth
            onClick={onLent}
            title="Lent and borrowed"
            aria-label="Lent and borrowed"
          >
            <Coins aria-hidden="true" size="var(--icon-regular)" />
            <Text>
              Owed to you <b>{money(owedToYou)}</b> · You owe{" "}
              <b>{money(youOwe)}</b>
            </Text>
            <ChevronRight aria-hidden="true" size="var(--icon-regular)" />
          </Button>
        </Stack>
      </Card>
    </Stack>
  );
}

export function ReadinessMath({ records }: { records: WealthRecord[] }) {
  return (
    <Stack $spaceAfter="s16">
      <Card>
        <Stack $gap="s12">
          <Text as="p" size="sm" tone="muted">
            Readines counts each record once for proof and once for access
            instructions. Nominees stay visible on rows, but are not folded into
            this score yet.
          </Text>
          {records.slice(0, 6).map((record) => {
            const status = statusFor(record);
            return (
              <Row key={record.id} $justify="space-between">
                <Text size="md">{record.title}</Text>
                <Text as="b" size="md" weight="semibold">
                  {status.document ? "proof" : "no proof"} ·{" "}
                  {status.access ? "access" : "no access"}
                </Text>
              </Row>
            );
          })}
        </Stack>
      </Card>
    </Stack>
  );
}

export function EmptyWealth({
  query,
  onCapture,
}: {
  query: string;
  onCapture: () => void;
}) {
  return (
    <Stack $spaceAfter="s16">
      <Card>
        <Center $gap="s16">
          <IconBadge>
            <Wallet aria-hidden="true" />
          </IconBadge>
          <Text weight="semibold" tone="heading">
            {query ? "No matching records" : "Nothing recorded yet"}
          </Text>
          <Text as="p" tone="muted">
            {query
              ? "Try another search term, or capture proof for a new account, policy, loan, or payment."
              : "Capture an account, a policy, a loan, or informal money proof so your family can find it later."}
          </Text>
          <Button variant="primary" type="button" onClick={onCapture}>
            Capture proof
          </Button>
        </Center>
      </Card>
    </Stack>
  );
}
