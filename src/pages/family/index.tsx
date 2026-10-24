import {
  Heading,
  Content,
  Stack,
  Row,
  ListRow,
  Text,
  Button,
  Card,
} from "@/design-system";
import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import SectionHead from "@/components/SectionHead";
import { api, type TrustCenterResponse, type TrustMember } from "@/lib/api";
import { permissions, type AccessCode } from "./family-model";
import MemberRow from "./MemberRow";
import PersonSheet from "./PersonSheet";
import ConfirmRemove from "./ConfirmRemove";
export default function FamilyPage() {
  const [data, setData] = useState<TrustCenterResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sheet, setSheet] = useState<"add" | TrustMember | null>(null);
  const [confirm, setConfirm] = useState<TrustMember | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      setData(await api.trust.get());
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load family members.",
      );
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    void load();
  }, []);

  const members = useMemo(() => data?.members ?? [], [data]);
  const primary = useMemo(
    () => members.find((member) => member.accessType.id === "FAMILY_MEMBER"),
    [members],
  );

  async function setAccess(member: TrustMember, accessTypeCode: AccessCode) {
    setBusyId(member.id);
    setError("");
    try {
      await api.trust.updateMember(member.id, {
        accessTypeCode,
        permissions: permissions(accessTypeCode),
      });
      if (accessTypeCode === "FAMILY_MEMBER") {
        await Promise.all(
          members
            .filter(
              (item) =>
                item.id !== member.id && item.accessType.id === "FAMILY_MEMBER",
            )
            .map((item) =>
              api.trust.updateMember(item.id, {
                accessTypeCode: "EMERGENCY_ACCESS",
                permissions: permissions("EMERGENCY_ACCESS"),
              }),
            ),
        );
      }
      await load();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update emergency access.",
      );
    } finally {
      setBusyId(null);
    }
  }

  return (
    <>
      <SectionHead
        title="Emergency access"
        sub="Who your holdings and documents go to if you use the SOS handoff."
        action={null}
      />
      <Card flush>
        <ListRow>
          <Stack $grow>
            <Text as="p" tone="muted">
              The people your holdings and documents go to if you use the SOS
              handoff.
            </Text>
          </Stack>
          <Button variant="primary" size="lg" onClick={() => setSheet("add")}>
            <Plus aria-hidden="true" /> Add person
          </Button>
        </ListRow>
        {error && (
          <Content>
            <Card tone="danger">
              <Text role="alert" tone="danger">
                {error}
              </Text>
            </Card>
          </Content>
        )}
        {loading && (
          <ListRow>
            <Text tone="muted">Loading emergency access...</Text>
          </ListRow>
        )}
        {!loading &&
          members.map((member) => (
            <MemberRow
              key={member.id}
              member={member}
              primaryId={primary?.id}
              busy={busyId === member.id}
              onEdit={() => setSheet(member)}
              onPrimary={() => void setAccess(member, "FAMILY_MEMBER")}
              onToggle={(checked) =>
                void setAccess(
                  member,
                  checked
                    ? primary
                      ? "EMERGENCY_ACCESS"
                      : "FAMILY_MEMBER"
                    : "VIEW_ONLY",
                )
              }
            />
          ))}
        {!loading && !members.length && (
          <ListRow $divided>
            <Text tone="muted">
              Add the people who would step in. You can change or remove them
              any time.
            </Text>
          </ListRow>
        )}
      </Card>
      {sheet && (
        <PersonSheet
          person={sheet === "add" ? undefined : sheet}
          members={members}
          onClose={() => setSheet(null)}
          onSaved={async () => {
            setSheet(null);
            await load();
          }}
          onRemove={(member) => {
            setSheet(null);
            setConfirm(member);
          }}
        />
      )}
      {confirm && (
        <ConfirmRemove
          member={confirm}
          onClose={() => setConfirm(null)}
          onRemoved={async () => {
            setConfirm(null);
            await load();
          }}
        />
      )}
    </>
  );
}
