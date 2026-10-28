import { Stack, Grid, Row, Heading, IconBadge, ListRow, Text, Button, Card } from "@/design-system";
import { LockKeyhole, Plus, RotateCcw, Users } from "lucide-react";
import SectionHead from "@/components/SectionHead";
import { api } from "@/lib/api";
import { OwnerRow, MemberRow } from "./index.OwnerRow";
import { MemberModal } from "./index.MemberModal";
import { useTrustPageLogic } from "./index.defaultPermissions";


export function TrustPage() {
const context = useTrustPageLogic();
const { data, setData, loading, setLoading, error, setError, notice, setNotice, addOpen, setAddOpen, editing, setEditing, removingId, setRemovingId, leavingId, setLeavingId, load, enabledModules, refreshAfter, removeMember, resetPin, leaveConnection } = context;
if (loading)
    return <SectionHead title="Trust center" sub="Loading trusted access..." />;
if (error || !data)
    return (
      <TrustError
        message={error ?? "Unable to load Trust Center."}
        onRetry={() => void load()}
      />
    );
return ((
    <>
      <SectionHead
        title="Trust center"
        sub="In plain language: what is protected, who is in your archive, and what each person can reach."
      />
      <Stack $gap="s24">
        <Grid>
          <Card>
            <Stack>
              <IconBadge $tone="success">
                <LockKeyhole aria-hidden="true" />
              </IconBadge>
              <Heading level={3} size="sm">
                Encrypted storage
              </Heading>
              <Text as="p" tone="muted">
                Documents use encrypted storage. The current backend can decrypt
                them for processing.
              </Text>
            </Stack>
          </Card>
          <Card>
            <Stack>
              <IconBadge $tone="success">
                <Users aria-hidden="true" />
              </IconBadge>
              <Heading level={3} size="sm">
                {data.memberCount + 1} people
              </Heading>
              <Text as="p" tone="muted">
                Have some level of access, set by you.
              </Text>
            </Stack>
          </Card>
        </Grid>
        <Card flush>
          <ListRow>
            <Stack $grow>
              <Heading level={3} size="sm">
                Family &amp; access
              </Heading>
            </Stack>
            <Button variant="primary" onClick={() => setAddOpen(true)}>
              <Plus aria-hidden="true" /> Add member
            </Button>
          </ListRow>
          <OwnerRow owner={data.owner} />
          {data.members.map((member) => (
            <MemberRow
              key={member.id}
              member={member}
              onChange={(accessTypeCode) =>
                void refreshAfter(
                  api.trust.updateMember(member.id, { accessTypeCode }),
                )
              }
              onEdit={() => setEditing(member)}
              onResend={() =>
                void refreshAfter(api.trust.resendInvitation(member.id))
              }
              onResetPin={() => void resetPin(member)}
              onRemove={() => void removeMember(member)}
              removing={removingId === member.id}
            />
          ))}
          {!data.members.length && (
            <ListRow>
              <Text tone="muted">No trusted members yet.</Text>
            </ListRow>
          )}
        </Card>
        {notice && (
          <Card>
            <Stack $gap="s6">
              <Heading level={3} size="sm">
                Invitation status
              </Heading>
              <Text as="p" tone="muted">
                {notice}
              </Text>
            </Stack>
          </Card>
        )}
        {!!data.connections.length && (
          <Card flush>
            <ListRow>
              <Heading level={3} size="sm">
                Connected to
              </Heading>
            </ListRow>
            {data.connections.map((connection) => (
              <ListRow $divided key={connection.id}>
                <IconBadge>{connection.owner.name.charAt(0)}</IconBadge>
                <Stack $grow $gap="s4">
                  <Text>
                    {connection.owner.name} · {connection.relationLabel}
                  </Text>
                  <Text size="sm" tone="muted">
                    {connection.accessType.name}
                  </Text>
                </Stack>
                <Button
                  tone="danger"
                  variant="secondary"
                  disabled={leavingId === connection.id}
                  onClick={() =>
                    void leaveConnection(connection.id, connection.owner.name)
                  }
                >
                  Leave Readines
                </Button>
              </ListRow>
            ))}
          </Card>
        )}
        <Card>
          <Stack>
            <Heading level={3} size="sm">
              Reset demo data
            </Heading>
            <Text as="p" tone="muted">
              Restore the sample family and documents on this device.
            </Text>
            <Row>
              <Button
                tone="danger"
                variant="secondary"
                disabled
                title="Demo reset is not available for account data."
              >
                <RotateCcw aria-hidden="true" /> Reset everything
              </Button>
            </Row>
          </Stack>
        </Card>
      </Stack>
      {editing && (
        <MemberModal
          initial={editing}
          enabledModules={enabledModules}
          onClose={() => setEditing(null)}
          onSave={(payload) =>
            refreshAfter(api.trust.updateMember(editing.id, payload)).then(() =>
              setEditing(null),
            )
          }
        />
      )}
      {addOpen && (
        <MemberModal
          enabledModules={enabledModules}
          onClose={() => setAddOpen(false)}
          onSave={(payload) =>
            refreshAfter(api.trust.addMember(payload)).then(() =>
              setAddOpen(false),
            )
          }
        />
      )}
    </>
  ));
}


export function TrustError({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <Card>
      <Stack>
        <Heading level={2} size="sm">
          Trust Center unavailable
        </Heading>
        <Text as="p" tone="muted" role="alert">
          {message}
        </Text>
        <Row>
          <Button variant="primary" onClick={onRetry}>
            <RotateCcw aria-hidden="true" /> Retry
          </Button>
        </Row>
      </Stack>
    </Card>
  );
}
