import { motion } from "framer-motion";
import { PackDetail, DocGraph, WealthMock, HealthMock, MomentCard, MOMENTS, fade } from "./LandingVisuals";
import { Text, Heading, Card, Stack, Container, Section, Grid, Row, Center, Content, colors } from "@/design-system";
import { Lock } from "lucide-react";
import { Feature } from "./Landing.Brand";
import { useLandingLogic } from "./Landing.useLandingLogic";


export function LandingViewSection4(context: ReturnType<typeof useLandingLogic>) {
const { initialAuthMode, onAuthed, auth, setAuth, unsubscribeToken, setUnsubscribeToken, billing, setBilling, catalogue, setCatalogue, startPaid, start, navigateSection } = context;
return (<Section id="privacy" tabIndex={-1} aria-labelledby="privacy-heading">
            <motion.div {...fade()}>
              <Container>
                <Card>
                  <Content>
                    <Stack $gap="s24">
                      <Row>
                        <Lock aria-hidden="true" color={colors.action} />
                        <Heading id="privacy-heading" level={2} size="lg">
                          Privacy: private by design
                        </Heading>
                      </Row>
                      <Text as="p" size="lg">
                        Your documents are stored encrypted. Readines manages
                        the encryption keys to support the features you choose,
                        including document analysis and export.
                      </Text>
                      <Grid $columns={3}>
                        {[
                          [
                            "You control your documents",
                            "Choose what you upload, review extracted details, and export your documents and data from Settings.",
                          ],
                          [
                            "Sharing needs your permission",
                            "Use Trust Center to choose who can access your records and manage their permissions.",
                          ],
                          [
                            "AI processing is your choice",
                            "When enabled, document content is sent for AI processing. Keep it disabled to enter details manually.",
                          ],
                        ].map(([title, body]) => (
                          <Stack key={title}>
                            <Heading level={3} size="sm">
                              {title}
                            </Heading>
                            <Text as="p">{body}</Text>
                          </Stack>
                        ))}
                      </Grid>
                    </Stack>
                  </Content>
                </Card>
              </Container>
            </motion.div>
          </Section>);
}


export function LandingViewSection5(context: ReturnType<typeof useLandingLogic>) {
const { initialAuthMode, onAuthed, auth, setAuth, unsubscribeToken, setUnsubscribeToken, billing, setBilling, catalogue, setCatalogue, startPaid, start, navigateSection } = context;
return (<Section $tone="raised">
            <Container>
              <Stack $gap="s32">
                <Center>
                  <Heading level={2} size="lg">
                    Life happens. Keep the paperwork ready.
                  </Heading>
                  <Text as="p">
                    For a new role, a new place, a trip, or a care visit, keep
                    important records in reach.
                  </Text>
                </Center>
                <div className="lp-moments">
                  {MOMENTS.map((m, i) => (
                    <MomentCard key={m.kind} m={m} i={i} />
                  ))}
                </div>
                <Center>
                  <Text as="p" size="lg">
                    Open Readines to find your records, review what is missing,
                    and prepare for what comes next.
                  </Text>
                </Center>
              </Stack>
            </Container>
          </Section>);
}


export function LandingViewSection6(context: ReturnType<typeof useLandingLogic>) {
const { initialAuthMode, onAuthed, auth, setAuth, unsubscribeToken, setUnsubscribeToken, billing, setBilling, catalogue, setCatalogue, startPaid, start, navigateSection } = context;
return (<Section
            id="features"
            tabIndex={-1}
            aria-labelledby="features-heading"
          >
            <Container>
              <Stack $gap="s60">
                <Center>
                  <Heading id="features-heading" level={2} size="lg">
                    Features
                  </Heading>
                  <Text as="p" size="lg">
                    Four modules for the records that matter.
                  </Text>
                </Center>
                <Feature
                  name="Packages"
                  title="Know what is ready and what is missing."
                  body="Choose a life event and review the required documents. Match records from your library and fill the gaps before you need them."
                  points={[
                    "Clear document checklists",
                    "Review and change document matches",
                    "Prepare and export your package",
                  ]}
                >
                  <PackDetail />
                </Feature>
                <Feature
                  reverse
                  name="Documents"
                  title="A home for your important records."
                  body="Upload documents or import from Gmail and Google Drive. Review extracted details when AI processing is enabled, organize records, and search when you need them."
                  points={[
                    "Files and photos in one library",
                    "Review categories and document details",
                    "Search across your records",
                  ]}
                >
                  <DocGraph />
                </Feature>
                <Feature
                  name="Health"
                  title="Bring the right records to your next visit."
                  body="Keep reports, medications, and measurements together for each family member. Review trends and prepare records for appointments."
                  points={[
                    "Health records for family members",
                    "Measurements and medication lists",
                    "Doctor visit preparation",
                  ]}
                >
                  <HealthMock />
                </Feature>
                <Feature
                  reverse
                  name="Wealth"
                  title="See your financial records more clearly."
                  body="Keep assets, loans, and insurance records together. Review recorded values and nominee details, with supporting documents close at hand."
                  points={[
                    "Assets, loans, and insurance",
                    "Review nominee information",
                    "Link supporting documents",
                  ]}
                >
                  <WealthMock />
                </Feature>
              </Stack>
            </Container>
          </Section>);
}
