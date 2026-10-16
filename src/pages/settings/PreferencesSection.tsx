import { Text, ChoiceGroup, Choice, Switch, Button } from "@/design-system";

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
      {/* <PreferenceRow
        label="Passport"
        sub="Some packages depend on this, not only on where you live."
        control={<SearchablePreferenceSelect ariaLabel="Passport country" disabled={saving === "passportCountry"} options={countryOptions} value={preferences.passportCountry} placeholder="Choose passport" onChange={(passportCountry) => void update({ passportCountry }, "passportCountry")} />}
      /> */}
      {/* <PreferenceRow
        label="Home currency"
        sub="Indicative rate, bundled with the app"
        control={<SearchablePreferenceSelect ariaLabel="Home currency" disabled={saving === "homeCurrency"} options={currencyOptions} value={preferences.homeCurrency} placeholder="Choose currency" onChange={(homeCurrency) => void update({ homeCurrency }, "homeCurrency")} />}
      /> */}
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-s12)", padding: "13px var(--space-s16)", borderTop: `1px solid ${T.border}` }}>
        <Moon aria-hidden="true" focusable="false" size="var(--icon-small)" color={T.muted} />
        <span style={{ flex: 1, minWidth: 0 }}>
          <Text size="md" weight="semibold" style={{ display: "block", color: T.text }}>Appearance</Text>
        </span>
        <ChoiceGroup style={{ display: "flex" }}>
          {(["dark", "light"] as const).map((theme) => (
            <Choice key={theme} type="button" aria-pressed={preferences.appearance === theme} onClick={() => changeAppearance(theme)} >{theme === "dark" ? "Dark" : "Light"}</Choice>
          ))}
        </ChoiceGroup>
        <Sun aria-hidden="true" focusable="false" size="var(--icon-small)" color={T.faint} />
      </div>
      <NotificationSettingsRow />
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-s12)", padding: "13px var(--space-s16)", borderTop: `1px solid ${T.border}` }}>
        <Brain aria-hidden="true" focusable="false" size="var(--icon-small)" color={T.muted} />
        <span style={{ flex: 1, minWidth: 0 }}>
          <Text size="md" weight="semibold" style={{ display: "block", color: T.text }}>AI processing</Text>
          <Text size="sm" tone="muted" style={{ display: "block", color: T.muted, marginTop: 1 }}>Allow Readiness to use AI to process your information, automatically extract details, classify records, and provide insights.</Text>
        </span>
        <Switch aria-label="AI processing" checked={preferences.aiProcessingEnabled} disabled={saving === "aiProcessingEnabled"} onCheckedChange={(checked) => { if (!checked) setConfirmAiOff(true); else void update({ aiProcessingEnabled: true }, "aiProcessingEnabled"); }} />
      </div>
      {confirmAiOff ? (
        <Overlay title="Turn off AI processing?" onClose={() => setConfirmAiOff(false)}>
          <Text as="p" size="md" style={{ color: T.text, margin: 0 }}>
            Readiness will stop using AI to process your information across the app. Documents and records won't be automatically read, classified, or analyzed, and AI-generated insights will be unavailable.
          </Text>
          <Text as="p" size="md" tone="muted" style={{ color: T.muted, margin: "var(--space-s10) 0 0" }}>
            You'll need to enter relevant information manually.
          </Text>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--space-s10)", marginTop: "var(--space-s18)" }}>
            <Button variant="secondary" type="button" onClick={() => setConfirmAiOff(false)} >Cancel</Button>
            <Button tone="danger" variant="primary" type="button" onClick={() => { setConfirmAiOff(false); void update({ aiProcessingEnabled: false }, "aiProcessingEnabled"); }} >Turn off AI</Button>
          </div>
        </Overlay>
      ) : null}
    </Section>
  );
}

function PreferenceRow({ label, sub, control }: { label: string; sub: string; control: ReactNode }) {
  return (
    <Text as="div" size="md" style={{ display: "flex", alignItems: "center", gap: "var(--space-s14)", padding: "13px var(--space-s16)", borderTop: `1px solid ${T.border}`, flexWrap: "wrap" }}>
      <span style={{ flex: "1 1 240px", minWidth: 0 }}>
        <span style={{ display: "block", fontSize: "var(--text-md)", fontWeight: "var(--weight-semibold)", color: T.text }}>{label}</span>
        <span style={{ display: "block", fontSize: "var(--text-sm)", color: T.muted, marginTop: 1 }}>{sub}</span>
      </span>
      {control}
    </Text>
  );
}
