import { useEffect, useRef, useState } from "react";
import type { Location } from "react-router-dom";
import { preferencesApi } from "@/lib/preferences-api";
import { useHealthData } from "./useHealthData";
import { useHealthRecordActions } from "./useHealthRecordActions";
import { useHealthTracking } from "./useHealthTracking";

export function useHealthPage(location: Pick<Location, "search" | "state">) {
  const data = useHealthData();
  const records = useHealthRecordActions(data);
  const tracking = useHealthTracking(data);
  const { members, setActiveTab, setSelectedMemberId } = data;
  const { openHealthRecord } = records;
  const uploadState = location.state as { newHealthProfileId?: string; newHealthProfileName?: string } | null;
  const newProfileId = uploadState?.newHealthProfileId;
  const newProfileName = uploadState?.newHealthProfileName;
  const [aiProcessingEnabled, setAiProcessingEnabled] = useState(false);
  const handledDeepLink = useRef("");
  const handledMemberLink = useRef("");

  useEffect(() => {
    let cancelled = false;
    const refreshPreferences = () => {
      void preferencesApi.get()
        .then((preferences) => {
          if (!cancelled) setAiProcessingEnabled(preferences.aiProcessingEnabled);
        })
        .catch(() => {
          if (!cancelled) setAiProcessingEnabled(false);
        });
    };
    refreshPreferences();
    window.addEventListener("readiness-preferences-changed", refreshPreferences);
    return () => {
      cancelled = true;
      window.removeEventListener("readiness-preferences-changed", refreshPreferences);
    };
  }, []);
  useEffect(() => {
    const requestedTab = newProfileId ? "Records" : new URLSearchParams(location.search).get("tab");
    const tab = requestedTab === "Trends" ? "Readings" : requestedTab === "Medications" ? "Medicines" : requestedTab;
    if (tab === "Overview" || tab === "Readings" || tab === "Timeline" || tab === "Medicines" || tab === "Records") setActiveTab(tab);
  }, [location.search, newProfileId, setActiveTab]);

  useEffect(() => {
    const memberId = newProfileId ?? new URLSearchParams(location.search).get("member");
    const linkKey = newProfileId ?? location.search;
    if (!memberId) handledMemberLink.current = "";
    else if (handledMemberLink.current !== linkKey && members.some(member => member.id === memberId)) {
      handledMemberLink.current = linkKey;
      setSelectedMemberId(memberId);
    }
  }, [location.search, members, newProfileId, setSelectedMemberId]);

  useEffect(() => {
    const recordId = new URLSearchParams(location.search).get("record");
    if (!recordId) handledDeepLink.current = "";
    else if (handledDeepLink.current !== location.search) {
      handledDeepLink.current = location.search;
      void openHealthRecord(recordId);
    }
  }, [location.search, openHealthRecord]);

  return { ...data, ...records, ...tracking, aiProcessingEnabled, newProfileId, newProfileName };
}
