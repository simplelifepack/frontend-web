import { useState } from "react";
import { X } from "lucide-react";
import type { HealthMember, HealthMemberResolution } from "@/lib/api.types";
import { btnGhost, btnGold } from "@/constants/theme";

function MemberResolutionDialog({
  resolution,
  members,
  onClose,
  onCreateProfile,
  onConfirm,
}: {
  resolution: HealthMemberResolution;
  members: HealthMember[];
  onClose: () => void;
  onCreateProfile: () => void;
  onConfirm: (memberId: string) => Promise<void>;
}) {
  const [memberId, setMemberId] = useState(
    resolution.memberMatch.candidates[0]?.id ?? "",
  );
  const [choosingExisting, setChoosingExisting] = useState(false);
  const [saving, setSaving] = useState(false);
  const patientName = resolution.patient?.name?.trim();
  const ambiguous = resolution.memberMatch.status === "ambiguous";
  if (
    !ambiguous &&
    resolution.memberMatch.status === "unmatched" &&
    patientName
  )
    return (
      <div className="lp-modal-backdrop" style={{ zIndex: 90 }}>
        <div
          className="lp-modal-panel lp-health-add-dialog"
          role="dialog"
          aria-modal="true"
        >
          <header className="lp-health-dialog-head">
            <h2>No Health profile found for {patientName}.</h2>
            <button type="button" onClick={onClose} aria-label="Close">
              <X size={18} />
            </button>
          </header>
          <p>This record appears to belong to a new person.</p>
          <footer>
            <button type="button" style={btnGold} onClick={onCreateProfile}>
              Create profile for {patientName}
            </button>
            <button
              type="button"
              style={btnGhost}
              onClick={() => setChoosingExisting(true)}
            >
              Choose existing profile
            </button>
            <button type="button" style={btnGhost} onClick={onClose}>
              Cancel
            </button>
          </footer>
          {choosingExisting ? (
            <div className="lp-health-form">
              <label>
                <span>Who does this record belong to?</span>
                <select
                  value={memberId}
                  onChange={(event) => setMemberId(event.target.value)}
                >
                  <option value="">Choose a profile</option>
                  {members.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name} · {member.relation}
                    </option>
                  ))}
                </select>
              </label>
              {memberId ? (
                <button
                  type="button"
                  style={btnGold}
                  disabled={saving}
                  onClick={() => {
                    setSaving(true);
                    void onConfirm(memberId).finally(() => setSaving(false));
                  }}
                >
                  Confirm
                </button>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    );
  return (
    <div className="lp-modal-backdrop" style={{ zIndex: 90 }}>
      <div
        className="lp-modal-panel lp-health-add-dialog"
        role="dialog"
        aria-modal="true"
      >
        <header className="lp-health-dialog-head">
          <h2>
            {ambiguous
              ? "We found more than one matching profile."
              : "We couldn't identify who this health record belongs to."}
          </h2>
          <button type="button" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </header>
        <p>
          {ambiguous
            ? "Who does this record belong to?"
            : "Choose an existing profile to continue."}
        </p>
        <div className="lp-health-form">
          <label>
            <span>Health profile</span>
            <select
              value={memberId}
              onChange={(event) => setMemberId(event.target.value)}
            >
              <option value="">Choose a profile</option>
              {(ambiguous ? resolution.memberMatch.candidates : members).map(
                (member) => (
                  <option key={member.id} value={member.id}>
                    {member.name} · {member.relation}
                  </option>
                ),
              )}
            </select>
          </label>
        </div>
        <footer>
          <button
            type="button"
            style={btnGhost}
            disabled={saving}
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            style={btnGold}
            disabled={!memberId || saving}
            onClick={async () => {
              setSaving(true);
              await onConfirm(memberId);
              setSaving(false);
            }}
          >
            {saving ? "Assigning..." : "Confirm"}
          </button>
        </footer>
      </div>
    </div>
  );
}

export default MemberResolutionDialog;
