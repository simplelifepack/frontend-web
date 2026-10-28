import { motion } from "framer-motion";
import { landingBrand as C } from "@/design-system/variables/brand";
import { Radar, ReadinessMock, fade } from "./LandingVisuals";
import { useEffect, useState, type MouseEvent } from "react";
import { Text, Heading, Button, Card, Stack, Container, Section, Grid, Row, Center, SiteNav, NavLayout, NavLink, colors, spacing } from "@/design-system";
import { billingApi, requestBillingCheckout, selectedBillingPlan, type BillingCatalogue } from "@/lib/billing-api";
import { toast } from "sonner";
import { ArrowRight, Lock, UploadCloud, Sparkles, Briefcase, Mail, HardDrive } from "lucide-react";
import { Brand } from "./Landing.Brand";


export function useLandingLogic({
  initialAuthMode = null,
  earlyAccess = false,
  onAuthed,
}: {
  earlyAccess?: boolean;
  initialAuthMode?: "signin" | "signup" | null;
  onAuthed: (isNew: boolean) => void;
}) {

  const [auth, setAuth] = useState<null | "signin" | "signup">(earlyAccess ? null : initialAuthMode);
  const [waitlistOpen, setWaitlistOpen] = useState(false);
  const [unsubscribeToken, setUnsubscribeToken] = useState(() => new URLSearchParams(window.location.search).get("waitlistUnsubscribe") ?? undefined);
  const [billing, setBilling] = useState<"annual" | "monthly">(selectedBillingPlan);
  const [catalogue, setCatalogue] = useState<BillingCatalogue | null>(null);
  useEffect(() => { if (!earlyAccess) void billingApi.plans().then(setCatalogue).catch(() => {}); }, [earlyAccess]);
  const startPaid = () => {
    if (earlyAccess) { setWaitlistOpen(true); return; }
    if (!catalogue?.available) { toast.error("Payments are not available yet. Please try again later."); return; }
    requestBillingCheckout(billing); start();
  };
  useEffect(() => {
    if (!earlyAccess && initialAuthMode) setAuth(initialAuthMode);
  }, [earlyAccess, initialAuthMode]);
  const start = () => {
    if (earlyAccess) { setWaitlistOpen(true); return; }
    sessionStorage.setItem("lp-fresh", "1");
    setAuth("signup");
  };
  const navigateSection = (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
      return;
    const id = event.currentTarget.hash;
    const target = document.getElementById(id.slice(1));
    if (!target) return;
    event.preventDefault();
    const nav = event.currentTarget.closest("nav");
    const top =
      target.getBoundingClientRect().top +
      window.scrollY -
      (nav?.getBoundingClientRect().height ?? 0) -
      Number.parseInt(spacing.s16);
    window.history.pushState(null, "", id);
    target.focus({ preventScroll: true });
    window.scrollTo({
      top,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
  };
return { initialAuthMode, earlyAccess, onAuthed, auth, setAuth, waitlistOpen, setWaitlistOpen, unsubscribeToken, setUnsubscribeToken, billing, setBilling, catalogue, setCatalogue, startPaid, start, navigateSection };
}


export function LandingViewSection1(context: ReturnType<typeof useLandingLogic>) {
const { initialAuthMode, earlyAccess, onAuthed, auth, setAuth, waitlistOpen, setWaitlistOpen, unsubscribeToken, setUnsubscribeToken, billing, setBilling, catalogue, setCatalogue, startPaid, start, navigateSection } = context;
return (<SiteNav aria-label="Main navigation">
          <Container>
            <NavLayout>
              <Brand />
              <Row as="div" $gap="s18" $justify="center">
                {[
                  ["features", "Features"],
                  ["how", "How it works"],
                  ["privacy", "Privacy"],
                  ["pricing", "Pricing"],
                ].map(([id, label]) => (
                  <NavLink key={id} href={`#${id}`} onClick={navigateSection}>
                    {label}
                  </NavLink>
                ))}
              </Row>
              <Button
                size="sm"
                variant="tertiary"
                onClick={() => earlyAccess ? setWaitlistOpen(true) : setAuth("signin")}
              >
                {earlyAccess ? "Register for Early Access" : "Sign in"}
              </Button>
            </NavLayout>
          </Container>
        </SiteNav>);
}


export function LandingViewSection2(context: ReturnType<typeof useLandingLogic>) {
const { initialAuthMode, earlyAccess, onAuthed, auth, setAuth, waitlistOpen, setWaitlistOpen, unsubscribeToken, setUnsubscribeToken, billing, setBilling, catalogue, setCatalogue, startPaid, start, navigateSection } = context;
return (<header className="lp-hero">
            <div className="lp-herobg" aria-hidden>
              <Radar />
            </div>
            <div className="lp-heroinner">
              <motion.div {...fade()}>
                <Heading level={1} size="xl" className="lp-h1">
                  Your documents,
                  <br />
                  in order and{" "}
                  <span style={{ color: C.clay }}>
                    ready
                    <br />
                    when you need them.
                  </span>
                </Heading>
                <Text as="p" size="md" className="lp-sub">
                  Readines helps you organize important records, find what you
                  need, and prepare for life’s important moments.
                </Text>
                <div className="lp-herocta">
                  <Button
                    size="lg"
                    variant="primary"
                    type="button"
                    onClick={start}
                  >
                    {earlyAccess ? "Register for Early Access" : "Get started"}{" "}
                    <ArrowRight
                      aria-hidden="true"
                      focusable="false"
                      size={17}
                    />
                  </Button>
                  <Text size="md" className="lp-trust">
                    <Lock aria-hidden="true" focusable="false" size={12} />{" "}
                    Private by design | Encrypted storage | You control what is
                    stored.
                  </Text>
                </div>
              </motion.div>
              <div className="lp-heromock">
                <ReadinessMock />
              </div>
            </div>
            <div className="lp-connectors">
              <Text size="md">
                Upload files or photos, review Gmail attachments, or scan
                connected Google Drive from Documents.
              </Text>
              <Text size="md" className="lp-conn">
                <Mail aria-hidden="true" focusable="false" size={14} /> Email
              </Text>
              <Text size="md" className="lp-conn">
                <HardDrive aria-hidden="true" focusable="false" size={14} />{" "}
                Drive
              </Text>
              <Text size="md" className="lp-conn">
                <UploadCloud aria-hidden="true" focusable="false" size={14} />{" "}
                Upload &amp; scan
              </Text>
            </div>
          </header>);
}


export function LandingViewSection3(context: ReturnType<typeof useLandingLogic>) {
const { initialAuthMode, earlyAccess, onAuthed, auth, setAuth, waitlistOpen, setWaitlistOpen, unsubscribeToken, setUnsubscribeToken, billing, setBilling, catalogue, setCatalogue, startPaid, start, navigateSection } = context;
return (<Section
            id="how"
            tabIndex={-1}
            aria-labelledby="how-heading"
            data-brand-tone="raised"
          >
            <motion.div {...fade()}>
              <Container>
                <Stack $gap="s32">
                  <Center>
                    <Heading id="how-heading" level={2} size="lg">
                      How it works
                    </Heading>
                    <Text as="p" size="lg">
                      From scattered paperwork to the records you need.
                    </Text>
                  </Center>
                  <Grid $columns={3}>
                    {[
                      {
                        icon: UploadCloud,
                        title: "Add your documents",
                        body: "Upload a file or photo. Or connect Gmail to review attachments, or Google Drive to scan documents.",
                      },
                      {
                        icon: Sparkles,
                        title: "Organize and review",
                        body: "Choose AI processing to extract document details, then review the results. You can also enter details manually.",
                      },
                      {
                        icon: Briefcase,
                        title: "Find it. Prepare it.",
                        body: "Search your records, choose a package, and check which documents are ready and what is missing.",
                      },
                    ].map((step, i) => (
                      <Card key={step.title}>
                        <Stack $gap="s16">
                          <Row $justify="space-between">
                            <step.icon
                              aria-hidden="true"
                              color={colors.action}
                            />
                            <Text tone="muted">0{i + 1}</Text>
                          </Row>
                          <Heading level={3} size="sm">
                            {step.title}
                          </Heading>
                          <Text as="p">{step.body}</Text>
                        </Stack>
                      </Card>
                    ))}
                  </Grid>
                </Stack>
              </Container>
            </motion.div>
          </Section>);
}
