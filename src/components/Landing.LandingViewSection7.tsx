import { motion } from "framer-motion";
import { BrandPlanHeader } from "@/design-system/components/BrandSurface";
import { fade } from "./LandingVisuals";
import { Text, Heading, ChoiceGroup, Choice, Button, Card, Stack, Container, Section, Grid, Row, Center, Content, ScrollRegion, ComparisonTable, colors } from "@/design-system";
import { billingPrice, selectBillingPlan } from "@/lib/billing-api";
import { ShieldCheck, ArrowRight } from "lucide-react";
import { freePrice, Highlights, freeFeatures, paidFeatures, comparison } from "./Landing.Brand";
import { useLandingLogic } from "./Landing.useLandingLogic";


export function LandingViewSection7(context: ReturnType<typeof useLandingLogic>) {
const { initialAuthMode, onAuthed, auth, setAuth, unsubscribeToken, setUnsubscribeToken, billing, setBilling, catalogue, setCatalogue, startPaid, start, navigateSection } = context;
return (<Section
            id="pricing"
            tabIndex={-1}
            aria-labelledby="pricing-heading"
            $tone="raised"
          >
            <motion.div {...fade()}>
              <Container>
                <Stack $gap="s32">
                  <Center>
                    <Heading id="pricing-heading" level={2} size="lg">
                      Pricing
                    </Heading>
                    <Text as="p" size="lg">
                      Start with the essentials. Choose more room when you need
                      it.
                    </Text>
                  </Center>
                  <Grid $sharedRows={5}>
                    <Card flush>
                      <BrandPlanHeader>Free</BrandPlanHeader>
                      <Content>
                        <Text tone="muted">Begin with the essentials</Text>
                      </Content>
                      <Content>
                        <Center>
                          <Heading level={3} size="lg">
                            ₹{freePrice}
                          </Heading>
                          <Text>Everything you need to try Readines.</Text>
                        </Center>
                      </Content>
                      <Content>
                        <Highlights items={freeFeatures} />
                      </Content>
                      <Content>
                        <Button size="lg" variant="secondary" onClick={start}>
                          {"Start free"} <ArrowRight aria-hidden="true" />
                        </Button>
                      </Content>
                    </Card>
                    <Card flush>
                      <BrandPlanHeader $accent>Full plan</BrandPlanHeader>
                      <Content>
                        <ChoiceGroup aria-label="Billing period">
                          {(["annual", "monthly"] as const).map((period) => (
                            <Choice
                              key={period}
                              aria-pressed={billing === period}
                              onClick={() => { setBilling(period); selectBillingPlan(period); }}
                            >
                              {period === "annual" ? "Annual" : "Monthly"}
                            </Choice>
                          ))}
                        </ChoiceGroup>
                      </Content>
                      <Content>
                        <Center>
                          <Row>
                            <Heading level={3} size="lg">
                              {"₹"}
                              {catalogue ? billingPrice(catalogue.plans[billing].amountPaise) : "—"}
                            </Heading>
                            <Text>
                              {billing === "monthly" ? "/month" : "/year"}
                            </Text>
                          </Row>
                          <Text size="sm" tone="muted">
                            {catalogue
                              ? billing === "monthly"
                                ? `Cancel anytime · annual saves ₹${billingPrice(catalogue.annualSavingsPaise)} a year`
                                : `About ₹${catalogue.annualMonthlyEquivalent} a month, billed yearly`
                              : "Loading pricing…"}
                          </Text>
                          <Text size="sm" tone="muted">{catalogue?.testPaymentButtonId ? "Test payment button · No subscription activation" : "Renews automatically · Cancel anytime"}</Text>
                        </Center>
                      </Content>
                      <Content>
                        <Highlights items={paidFeatures} />
                      </Content>
                      <Content>
                        <Button size="lg" variant="primary" onClick={startPaid} disabled={!catalogue}>
                          {"Get started"} <ArrowRight aria-hidden="true" />
                        </Button>
                      </Content>
                    </Card>
                  </Grid>
                  <Card flush>
                    <ScrollRegion
                      role="region"
                      aria-label="Plan comparison"
                      tabIndex={0}
                    >
                      <ComparisonTable>
                        <caption>Compare plans</caption>
                        <thead>
                          <tr>
                            <th scope="col">What you get</th>
                            <th scope="col">Free</th>
                            <th scope="col">Full plan</th>
                          </tr>
                        </thead>
                        <tbody>
                          {comparison.map(([feature, free, paid]) => (
                            <tr key={feature}>
                              <th scope="row">{feature}</th>
                              <td>{free}</td>
                              <td>{paid}</td>
                            </tr>
                          ))}
                        </tbody>
                      </ComparisonTable>
                    </ScrollRegion>
                    <Content>
                      <Row>
                        <ShieldCheck aria-hidden="true" color={colors.action} />
                        <Heading level={3} size="sm">
                          Your documents remain yours.
                        </Heading>
                      </Row>
                      <Text as="p">
                        Export your documents and data from Settings on either
                        plan. Prepared export downloads are available for 24
                        hours; request a new export if the link expires.
                      </Text>
                    </Content>
                  </Card>
                </Stack>
              </Container>
            </motion.div>
          </Section>);
}
