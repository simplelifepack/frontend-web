import { homeCards, greeting } from "./home-cards";
import {
  Text,
  Heading,
  Button,
  Card,
  Ring,
  Stack,
  Grid,
  Row,
  Content,
  ListRow,
  ListAction,
  TileAction,
  IconBadge,
  spacing,
} from "@/design-system";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import SectionHead from "@/components/SectionHead";
import { T } from "@/constants/theme";
import { api, type DocumentRecord, type WealthRecord } from "@/lib/api";
import type { HealthHomeAttention } from "@/lib/api.types";
import { expiryValue } from "@/pages/documents/document-utils";
import { useAppSelector } from "@/store/hooks";
import {
  documentAttention,
  healthAttention,
  daysUntil,
  medicationAttention,
  wealthAttention,
  type HealthMedicationAttention,
} from "./attention";

export default function HomePage() {
  const navigate = useNavigate();
  const { items: documents, documentCount } = useAppSelector(
    (state) => state.documents,
  );
  const user = useAppSelector((state) => state.auth.user);
  const [healthAttentionData, setHealthAttentionData] =
    useState<HealthHomeAttention>({ reminders: [], medications: [] });
  const [healthMedications, setHealthMedications] = useState<
    HealthMedicationAttention[]
  >([]);
  const [wealthRecords, setWealthRecords] = useState<WealthRecord[]>([]);

  useEffect(() => {
    let active = true;
    void api.health
      .homeAttention()
      .then((attention) => {
        if (!active) return;
        setHealthAttentionData(attention);
        setHealthMedications(attention.medications);
      })
      .catch(() => {
        if (!active) return;
        setHealthAttentionData({ reminders: [], medications: [] });
        setHealthMedications([]);
      });
    void api.wealth
      .records()
      .then((records) => {
        if (active) setWealthRecords(records);
      })
      .catch(() => {
        if (active) setWealthRecords([]);
      });
    return () => {
      active = false;
    };
  }, []);

  const firstName = user?.name.trim().split(/\s+/)[0] || "there";
  const expiring = useMemo(
    () =>
      documents
        .map((document) => {
          const expiry = expiryValue(document);
          return expiry ? { document, days: daysUntil(expiry) } : null;
        })
        .filter((item): item is { document: DocumentRecord; days: number } =>
          Boolean(item),
        )
        .filter(({ days }) => days < 60)
        .sort((left, right) => left.days - right.days),
    [documents],
  );
  const unknown = useMemo(
    () => documents.filter((document) => document.documentType === "Unknown"),
    [documents],
  );
  const attentionItems = useMemo(
    () => [
      ...documentAttention(documents),
      ...healthAttention(healthAttentionData.reminders),
      ...medicationAttention(healthMedications),
      ...wealthAttention(wealthRecords),
    ],
    [
      documents,
      healthAttentionData.reminders,
      healthMedications,
      wealthRecords,
    ],
  );
  const readiness = documentCount
    ? Math.round(((documentCount - unknown.length) / documentCount) * 100)
    : 0;
  const { stats, insights } = homeCards(
    documentCount,
    readiness,
    expiring.length,
    attentionItems.length,
    attentionItems[0]?.route,
  );

  return (
    <>
      <SectionHead
        title={`${greeting()}, ${firstName}`}
        sub="Your archive at a glance, and what needs attention today."
        action={null}
      />
      <Stack $gap="s24">
        <Grid $columns={4} $compactColumns={2}>
          {stats.map(({ label, value, icon: Icon, color, route }) => (
            <TileAction
              key={label}
              variant="default"
              onClick={() => navigate(route)}
            >
              <IconBadge>
                <Icon aria-hidden="true" color={color} />
              </IconBadge>
              <Heading level={3} size="md">
                {value}
              </Heading>
              <Text tone="muted">{label}</Text>
            </TileAction>
          ))}
        </Grid>
        <Grid $align="stretch">
          <Card flush>
            <ListRow>
              <AlertTriangle
                aria-hidden="true"
                color={attentionItems.length ? T.warning : T.mint}
              />
              <Text weight="semibold">Action center</Text>
              <Text tone="muted">{attentionItems.length || "all clear"}</Text>
            </ListRow>
            {attentionItems.length ? (
              attentionItems.slice(0, 10).map((action) => (
                <ListAction
                  variant="tertiary"
                  $divided
                  key={action.id}
                  onClick={() => navigate(action.route)}
                >
                  <Text size="sm" tone="muted">
                    {action.module}
                  </Text>
                  <Stack $grow $gap="s4">
                    <Text>{action.label}</Text>
                    <Text size="sm" tone="muted">
                      {action.detail}
                    </Text>
                  </Stack>
                  <ChevronRight aria-hidden="true" />
                </ListAction>
              ))
            ) : (
              <Content>
                <Row $wrap={false}>
                  <CheckCircle2 aria-hidden="true" color={T.mint} />
                  <Text>
                    Nothing pressing across your documents. Nicely handled.
                  </Text>
                </Row>
              </Content>
            )}
            {attentionItems.length > 10 && (
              <Button variant="tertiary" onClick={() => navigate("/documents")}>
                +{attentionItems.length - 10} more across Readines
              </Button>
            )}
          </Card>
          <Card>
            <Stack $gap="s12">
              <Row>
                <ShieldCheck aria-hidden="true" color={T.readiness} />
                <Text weight="semibold">Connected across Readines</Text>
              </Row>
              <Text as="p" size="sm" tone="muted">
                What your modules mean together, not what they already show
                apart.
              </Text>
              {insights.map((insight, index) => (
                <ListAction
                  variant="tertiary"
                  $divided={index > 0}
                  key={insight.text}
                  onClick={() => navigate(insight.route)}
                >
                  <Row $wrap={false}>
                    {insight.icons.map((Icon) => (
                      <Icon
                        key={Icon.displayName || Icon.name}
                        aria-hidden="true"
                        size={spacing.s16}
                        color={insight.tone}
                      />
                    ))}
                  </Row>
                  <Stack $grow>
                    <Text>{insight.text}</Text>
                  </Stack>
                  <ChevronRight aria-hidden="true" />
                </ListAction>
              ))}
              <Row $wrap={false}>
                <Ring score={readiness} size={Number.parseInt(spacing.s40)} />
                <Text>
                  Most ready:{" "}
                  <b>
                    {readiness === 100
                      ? "Your document archive"
                      : "Review your packages"}
                  </b>
                </Text>
              </Row>
              <Button
                fullWidth
                variant="secondary"
                onClick={() => navigate("/packages")}
              >
                See all packages <ArrowRight aria-hidden="true" />
              </Button>
            </Stack>
          </Card>
        </Grid>
      </Stack>
    </>
  );
}
