import {
  Stack,
  ListRow,
  ListAction,
  Text,
  ChoiceGroup,
  Choice,
  Switch,
} from "@/design-system";

import { Brain, Moon, Sun } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { T } from "@/constants/theme";
import { preferencesApi, type UserPreferences } from "@/lib/preferences-api";
import { persistHomeCurrency } from "@/lib/preferences-storage";
import {
  getStoredTheme,
  persistTheme,
  type ThemePreference,
} from "@/lib/theme";
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
  const [preferences, setPreferences] =
    useState<UserPreferences>(emptyPreferences);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    void preferencesApi
      .get()
      .then((data) => {
        if (!alive) return;
        setPreferences(data);
        persistTheme(data.appearance);
        persistHomeCurrency(data.homeCurrency);
      })
      .catch(() => undefined);
    return () => {
      alive = false;
    };
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
      toast.error(
        error instanceof Error
          ? error.message
          : "Preference could not be saved.",
      );
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
        control={
          <SearchablePreferenceSelect
            ariaLabel="Country"
            disabled={saving === "country"}
            options={countryOptions}
            value={preferences.country}
            placeholder="Choose country"
            onChange={(country) => void update({ country }, "country")}
          />
        }
      />
      <ListRow $divided>
        <Moon aria-hidden="true" />
        <Stack $grow>
          <Text weight="medium">Appearance</Text>
        </Stack>
        <ChoiceGroup aria-label="Appearance">
          {(["system", "dark", "light"] as const).map((theme) => (
            <Choice
              key={theme}
              aria-pressed={preferences.appearance === theme}
              onClick={() => changeAppearance(theme)}
            >
              {theme === "system" ? "System" : theme === "dark" ? "Dark" : "Light"}
            </Choice>
          ))}
        </ChoiceGroup>
        <Sun aria-hidden="true" />
      </ListRow>
      <NotificationSettingsRow />
      <ListRow $divided>
        <Brain aria-hidden="true" />
        <Stack $grow $gap="s4">
          <Text weight="medium">AI processing</Text>
          <Text size="sm" tone="muted">
            Allow Readines to use AI to process your information, automatically
            extract details, classify records, and provide insights.
          </Text>
        </Stack>
        <Switch
          aria-label="AI processing"
          checked={preferences.aiProcessingEnabled}
          disabled={saving === "aiProcessingEnabled"}
          onCheckedChange={(checked) => {
            void update({ aiProcessingEnabled: checked }, "aiProcessingEnabled");
          }}
        />
      </ListRow>
    </Section>
  );
}

function PreferenceRow({
  label,
  sub,
  control,
}: {
  label: string;
  sub: string;
  control: ReactNode;
}) {
  return (
    <ListRow $divided>
      <Stack $grow $gap="s4">
        <Text weight="medium">{label}</Text>
        <Text size="sm" tone="muted">
          {sub}
        </Text>
      </Stack>
      {control}
    </ListRow>
  );
}
