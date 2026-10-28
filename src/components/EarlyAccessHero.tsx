import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type FormEvent,
} from "react";
import { ArrowRight, Check, Mail, Moon, Sun } from "lucide-react";
import { Button, Text, colors } from "@/design-system";
import {
  getAppliedAppearance,
  persistTheme,
  subscribeAppearance,
} from "@/lib/theme";
import { solveChallenge, waitlistApi } from "@/lib/waitlist-api";
import { BrandMark, BrandWordmark } from "./BrandLogo";
import { EarlyAccessOffer } from "./EarlyAccessOffer";
import {
  Surface,
  Nav,
  Logo,
  Actions,
  Layout,
  Copy,
  Badge,
  Title,
  Description,
  Form,
  EmailLabel,
  EmailInput,
  FormRow,
  Feedback,
  Reassurance,
  Mascot,
  HeroNavigationButton,
  HeroBrand,
} from "./EarlyAccessHero.styles";

export function EarlyAccessHero() {
  const appearance = useSyncExternalStore(
    subscribeAppearance,
    getAppliedAppearance,
    () => "dark",
  );
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const pending = useRef<AbortController | null>(null);
  useEffect(() => () => pending.current?.abort(), []);
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (pending.current || message) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Enter a valid email address.");
      return;
    }
    const controller = new AbortController();
    pending.current = controller;
    setBusy(true);
    setError("");
    try {
      const challenge = await waitlistApi.challenge(controller.signal);
      const solution = await solveChallenge(challenge, controller.signal);
      if (controller.signal.aborted) return;
      const result = await waitlistApi.register({
        email: email.trim(),
        website,
        challenge: challenge.token,
        solution,
      });
      if (!controller.signal.aborted) setMessage(result.message);
    } catch (failure) {
      if (!controller.signal.aborted)
        setError(
          failure instanceof Error
            ? failure.message
            : "Please try again later.",
        );
    } finally {
      if (!controller.signal.aborted) {
        pending.current = null;
        setBusy(false);
      }
    }
  }
  return (
    <Surface>
      <Nav aria-label="Main navigation">
        <Logo href="/" aria-label="Readines home">
          <HeroBrand>
            <BrandMark size={48} title="" />
            <BrandWordmark size={36} accent={colors.action} />
          </HeroBrand>
        </Logo>
        <Actions>
          <HeroNavigationButton
            type="button"
            variant="tertiary"
            iconOnly
            aria-label={`Switch to ${appearance === "dark" ? "light" : "dark"} theme`}
            onClick={() =>
              persistTheme(appearance === "dark" ? "light" : "dark")
            }
          >
            {appearance === "dark" ? (
              <Sun aria-hidden="true" />
            ) : (
              <Moon aria-hidden="true" />
            )}
          </HeroNavigationButton>
        </Actions>
      </Nav>
      <Layout>
        <Copy>
          <Badge size="sm" weight="semibold">
            EARLY ACCESS
          </Badge>
          <Title level={1}>
            Your life,<span>better prepared.</span>
          </Title>
          <Description as="p">
            Store, organize and get ready for life’s important moments, all in
            one secure place.
          </Description>
          <Form
            aria-label="Join early access"
            aria-busy={busy}
            onSubmit={submit}
          >
            <FormRow>
              <EmailLabel htmlFor="early-access-email">
                <span>Email address</span>
                <Mail aria-hidden="true" />
                <EmailInput
                  id="early-access-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  maxLength={254}
                  placeholder="Enter your email"
                  value={email}
                  disabled={busy || !!message}
                  aria-invalid={!!error}
                  aria-describedby="early-access-feedback"
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setError("");
                  }}
                />
              </EmailLabel>
              <input
                hidden
                tabIndex={-1}
                aria-hidden="true"
                autoComplete="off"
                name="website"
                value={website}
                onChange={(event) => setWebsite(event.target.value)}
              />
              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={busy || !!message}
              >
                {busy
                  ? "Joining…"
                  : message
                    ? "You’re on the list"
                    : "Join Early Access"}
                <ArrowRight aria-hidden="true" />
              </Button>
            </FormRow>
            <Feedback id="early-access-feedback">
              {error && (
                <Text as="p" role="alert" tone="danger">
                  {error}
                </Text>
              )}
              <Text as="p" role="status">
                {message}
              </Text>
            </Feedback>
          </Form>
          <Reassurance>
            {["Free to join", "No spam", "Founding price reserved for you"].map(
              (text) => (
                <li key={text}>
                  <Check aria-hidden="true" />
                  {text}
                </li>
              ),
            )}
          </Reassurance>
          <EarlyAccessOffer />
        </Copy>
        <Mascot>
          <img
            src="/images/early-access-squirrel.png"
            alt="Purple squirrel with tufted ears, brown eyes, a cream-striped tail, holding a branded document folder"
            width="1024"
            height="1536"
            fetchPriority="high"
            decoding="async"
          />
        </Mascot>
      </Layout>
    </Surface>
  );
}
