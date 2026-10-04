import { Brain, Moon, Sun } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { T } from "@/constants/theme";
import { preferencesApi, type UserPreferences } from "@/lib/preferences-api";
import { persistHomeCurrency } from "@/lib/preferences-storage";
import { getStoredTheme, persistTheme, type ThemePreference } from "@/lib/theme";
import { Overlay, Section } from "./settings-ui";
import NotificationSettingsRow from "./NotificationSettingsRow";
import SearchablePreferenceSelect from "./SearchablePreferenceSelect";
import { countryOptions, currencyOptions } from "./preference-options";

const emptyPreferences: UserPreferences = {
  country: null,
  passportCountry: null,
  homeCurrency: null,
  appearance: getStoredTheme(),
  aiProcessingEnabled: true,
};

export default function PreferencesSection() {
  const [preferences, setPreferences] = useState<UserPreferences>(emptyPreferences);
  const [saving, setSaving] = useState<string | null>(null);
  const [confirmAiOff, setConfirmAiOff] = useState(false);

  useEffect(() => {
    let alive = true;
    void preferencesApi.get().then((data) => {
      if (!alive) return;
      setPreferences(data);
      persistTheme(data.appearance);
      persistHomeCurrency(data.homeCurrency);
    }).catch(() => undefined);
    return () => { alive = false; };
  }, []);

  const update = async (patch: Partial<UserPreferences>, key: string) => {
    const next = { ...preferences, ...patch };
    setPreferences(next);
    if (patch.appearance) persistTheme(patch.appearance);
    if (Object.prototype.hasOwnProperty.call(patch, "homeCurrency")) {
      persistHomeCurrency(patch.homeCurrency ?? null);
    }
    setSaving(key);
    try {
      const saved = await preferencesApi.update(patch);
      setPreferences(saved);
      if (patch.appearance) persistTheme(saved.appearance);
      if (Object.prototype.hasOwnProperty.call(patch, "homeCurrency")) {
        persistHomeCurrency(saved.homeCurrency);
      }
      if (Object.prototype.hasOwnProperty.call(patch, "aiProcessingEnabled")) {
        window.dispatchEvent(new Event("readiness-preferences-changed"));
      }
    } catch (error) {
      setPreferences(preferences);
      if (patch.appearance) persistTheme(preferences.appearance);
      if (Object.prototype.hasOwnProperty.call(patch, "homeCurrency")) {
        persistHomeCurrency(preferences.homeCurrency);
      }
      toast.error(error instanceof Error ? error.message : "Preference could not be saved.");
    } finally {
      setSaving(null);
    }
  };

  const changeAppearance = (appearance: ThemePreference) => {
    void update({ appearance }, "appearance");
  };

  return (
    <Section label="Preferences">
      <PreferenceRow
        label="Country"
        sub="Where you prepare documents. Sets which packs and requirements you see."
        control={<SearchablePreferenceSelect ariaLabel="Country" disabled={saving === "country"} options={countryOptions} value={preferences.country} placeholder="Choose country" onChange={(country) => void update({ country }, "country")} />}
      />
      <PreferenceRow
        label="Passport"
        sub="Some packages depend on this, not only on where you live."
        control={<SearchablePreferenceSelect ariaLabel="Passport country" disabled={saving === "passportCountry"} options={countryOptions} value={preferences.passportCountry} placeholder="Choose passport" onChange={(passportCountry) => void update({ passportCountry }, "passportCountry")} />}
      />
      <PreferenceRow
        label="Home currency"
        sub="Indicative rate, bundled with the app"
        control={<SearchablePreferenceSelect ariaLabel="Home currency" disabled={saving === "homeCurrency"} options={currencyOptions} value={preferences.homeCurrency} placeholder="Choose currency" onChange={(homeCurrency) => void update({ homeCurrency }, "homeCurrency")} />}
      />
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 16px", borderTop: `1px solid ${T.border}` }}>
        <Moon size={16} color={T.muted} />
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: "block", fontSize: 14, fontWeight: 600, color: T.text }}>Appearance</span>
        </span>
        <div style={{ display: "flex", border: `1px solid ${T.border}`, borderRadius: 9, overflow: "hidden" }}>
          {(["dark", "light"] as const).map((theme) => (
            <button key={theme} type="button" aria-pressed={preferences.appearance === theme} onClick={() => changeAppearance(theme)} style={{
              padding: "6px 14px",
              border: 0,
              fontSize: 12.5,
              fontWeight: 700,
              background: preferences.appearance === theme ? T.action : "transparent",
              color: preferences.appearance === theme ? T.actionText : T.muted,
              cursor: "pointer",
            }}>{theme === "dark" ? "Dark" : "Light"}</button>
          ))}
        </div>
        <Sun size={16} color={T.faint} />
      </div>
      <NotificationSettingsRow />
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 16px", borderTop: `1px solid ${T.border}` }}>
        <Brain size={16} color={T.muted} />
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: "block", fontSize: 14, fontWeight: 600, color: T.text }}>AI processing</span>
          <span style={{ display: "block", fontSize: 12, color: T.muted, marginTop: 1 }}>Allow Readiness to use AI to process your information, automatically extract details, classify records, and provide insights.</span>
        </span>
        <button type="button" role="switch" aria-checked={preferences.aiProcessingEnabled} disabled={saving === "aiProcessingEnabled"} onClick={() => {
          if (preferences.aiProcessingEnabled) setConfirmAiOff(true);
          else void update({ aiProcessingEnabled: true }, "aiProcessingEnabled");
        }} style={{
          width: 48,
          height: 28,
          borderRadius: 999,
          border: `1px solid ${preferences.aiProcessingEnabled ? T.action : T.border}`,
          background: preferences.aiProcessingEnabled ? T.action : T.raised,
          padding: 3,
          cursor: saving === "aiProcessingEnabled" ? "wait" : "pointer",
        }}>
          <span style={{ display: "block", width: 20, height: 20, borderRadius: "50%", background: preferences.aiProcessingEnabled ? T.actionText : T.muted, transform: preferences.aiProcessingEnabled ? "translateX(18px)" : "translateX(0)", transition: "transform 0.18s ease" }} />
        </button>
      </div>
      {confirmAiOff ? (
        <Overlay title="Turn off AI processing?" onClose={() => setConfirmAiOff(false)}>
          <p style={{ color: T.text, fontSize: 13.5, lineHeight: 1.7, margin: 0 }}>
            Readiness will stop using AI to process your information across the app. Documents and records won't be automatically read, classified, or analyzed, and AI-generated insights will be unavailable.
          </p>
          <p style={{ color: T.muted, fontSize: 13, lineHeight: 1.7, margin: "10px 0 0" }}>
            You'll need to enter relevant information manually.
          </p>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 18 }}>
            <button type="button" onClick={() => setConfirmAiOff(false)} style={{ border: `1px solid ${T.border}`, background: T.raised, color: T.text, borderRadius: 9, padding: "9px 13px", fontWeight: 700 }}>Cancel</button>
            <button type="button" onClick={() => { setConfirmAiOff(false); void update({ aiProcessingEnabled: false }, "aiProcessingEnabled"); }} style={{ border: 0, background: T.coral, color: T.actionText, borderRadius: 9, padding: "9px 13px", fontWeight: 800 }}>Turn off AI</button>
          </div>
        </Overlay>
      ) : null}
    </Section>
  );
}

function PreferenceRow({ label, sub, control }: { label: string; sub: string; control: ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "13px 16px", borderTop: `1px solid ${T.border}`, flexWrap: "wrap" }}>
      <span style={{ flex: "1 1 240px", minWidth: 0 }}>
        <span style={{ display: "block", fontSize: 14, fontWeight: 600, color: T.text }}>{label}</span>
        <span style={{ display: "block", fontSize: 12, color: T.muted, marginTop: 1 }}>{sub}</span>
      </span>
      {control}
    </div>
  );
}
