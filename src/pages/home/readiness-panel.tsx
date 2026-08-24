import {
  CheckCircle2,
  AlertCircle,
  Download,
  Upload,
  XCircle,
} from "lucide-react";
import { useState } from "react";

import Card from "@/components/Card";
import Pill from "@/components/Pill";
import Ring from "@/components/Ring";
import Stamp from "@/components/Stamp";
import { btnGhost, btnGold, T } from "@/constants/theme";
import {
  api,
  type ReadinessRequirement,
  type ReadinessResult,
} from "@/lib/api";

export function openReadinessUpload() {
  window.dispatchEvent(
    new CustomEvent("ReadiNes:open-upload", { detail: { stayOnSave: true } }),
  );
}

function statusCopy(requirement: ReadinessRequirement) {
  if (requirement.status === "ready") return "Ready";
  if (requirement.status === "partial") return "Needs Attention";
  return "Missing";
}

function RequirementRow({
  requirement,
}: {
  requirement: ReadinessRequirement;
}) {
  const satisfied = requirement.status === "ready";
  const partial = requirement.status === "partial";

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "24px minmax(0, 1fr) auto",
        gap: 10,
        padding: "10px 0",
        alignItems: "center",
        borderTop: `1px solid ${T.border}`,
      }}
    >
      {satisfied ? (
        <CheckCircle2 size={18} color={T.mint} />
      ) : partial ? (
        <AlertCircle size={18} color={T.gold} />
      ) : (
        <XCircle size={18} color={T.coral} />
      )}
      <div style={{ minWidth: 0 }}>
        <div style={{ color: T.white, fontSize: 13.5, fontWeight: 700 }}>
          {requirement.title}
        </div>
        <div style={{ color: T.muted, fontSize: 12, marginTop: 3 }}>
          {partial && requirement.reason
            ? requirement.reason
            : satisfied
              ? [
                  requirement.matchedDocument?.originalName,
                  requirement.alternatives.length
                    ? `${requirement.alternatives.length} alternative${requirement.alternatives.length === 1 ? "" : "s"}`
                    : null,
                ]
                  .filter(Boolean)
                  .join(" . ")
              : (requirement.alternativeLabels.length
                  ? requirement.alternativeLabels
                  : requirement.acceptedDocumentTypes
                )
                  .slice(0, 5)
                  .join(", ")}
        </div>
      </div>
      <div
        style={{
          display: "flex",
          gap: 8,
          alignItems: "center",
          justifyContent: "flex-end",
          flexWrap: "wrap",
        }}
      >
        <Pill tone={satisfied ? "ready" : partial ? "warn" : "wax"}>
          {statusCopy(requirement)}
        </Pill>
        {!satisfied ? (
          <button
            type="button"
            onClick={openReadinessUpload}
            style={{ ...btnGold, padding: "8px 10px" }}
          >
            <Upload size={14} /> Upload document
          </button>
        ) : null}
      </div>
    </div>
  );
}

export function ReadinessPanel({ result }: { result: ReadinessResult }) {
  const [downloadStatus, setDownloadStatus] = useState<
    "idle" | "loading" | "failed"
  >("idle");

  const downloadPack = async () => {
    if (!result.matchedPack) return;
    setDownloadStatus("loading");
    try {
      const { blob, fileName } = await api.packages.download(
        result.matchedPack.slug,
      );
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 30_000);
      setDownloadStatus("idle");
    } catch {
      setDownloadStatus("failed");
    }
  };

  if (!result.matchedPack) {
    return null;
  }

  return (
    <Card style={{ marginBottom: 22 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          marginBottom: 14,
        }}
      >
        <Ring score={result.readiness.percentage} />
        <div style={{ flex: 1 }}>
          <div style={{ color: T.white, fontSize: 18, fontWeight: 800 }}>
            {result.matchedPack.title} Readiness
          </div>
          <div style={{ color: T.muted, fontSize: 13, marginTop: 4 }}>
            {result.matchedPack.description}
          </div>
          <div style={{ color: T.faint, fontSize: 12, marginTop: 6 }}>
            {result.readiness.satisfiedRequired} of{" "}
            {result.readiness.totalRequired} required documents ready
          </div>
        </div>
        {result.readiness.percentage === 100 ? <Stamp /> : null}
      </div>

      <div
        style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}
      >
        {result.readiness.percentage === 100 ? (
          <button
            type="button"
            onClick={() => void downloadPack()}
            disabled={downloadStatus === "loading"}
            style={btnGold}
          >
            <Download size={15} />{" "}
            {downloadStatus === "loading" ? "Preparing..." : "Download Pack"}
          </button>
        ) : (
          <button type="button" onClick={openReadinessUpload} style={btnGold}>
            <Upload size={15} /> Upload Missing
          </button>
        )}
        <button type="button" onClick={openReadinessUpload} style={btnGhost}>
          <Upload size={15} /> Add Document
        </button>
        {downloadStatus === "failed" ? (
          <span style={{ color: T.coral, fontSize: 12, alignSelf: "center" }}>
            Download failed.
          </span>
        ) : null}
      </div>

      <div style={{ display: "grid", gap: 12 }}>
        {result.groups.map((group) => (
          <div key={group.group}>
            <div
              style={{
                color: T.gold,
                fontSize: 12,
                fontWeight: 800,
                letterSpacing: 0.7,
                marginBottom: 2,
              }}
            >
              {group.group.toUpperCase()}
            </div>
            {group.requirements.map((requirement) => (
              <RequirementRow key={requirement.id} requirement={requirement} />
            ))}
          </div>
        ))}
      </div>
    </Card>
  );
}
