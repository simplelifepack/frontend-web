import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type FormEvent,
} from "react";
import { ArrowRight, Check, Mail, Moon, Sun } from "lucide-react";
import { Text, colors } from "@/design-system";
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
  JoinButton,
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
            Be ready for<span>life’s important moments.</span>
          </Title>
          <Description as="p">
            Visa, loan, admission, hospital visit, or a family handoff: the documents
            you’ll be asked for, matched and ready before the day comes.
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
              <JoinButton
                type="submit"
                variant="primary"
                size="lg"
                disabled={busy || !!message}
              >
                <span>{busy
                  ? "Joining…"
                  : message
                    ? "You’re on the list"
                    : "Join early access"}</span>
                <ArrowRight aria-hidden="true" />
              </JoinButton>
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
          <svg
            viewBox="0 0 1024 1536"
            preserveAspectRatio="xMidYMax meet"
            role="img"
            aria-label="Purple squirrel standing on the floor, holding a document folder with the Readines logo"
          >
            <defs>
              <radialGradient id="mascot-ground-shadow">
                <stop stopColor="currentColor" stopOpacity="0.3" />
                <stop offset="1" stopColor="currentColor" stopOpacity="0" />
              </radialGradient>
            </defs>
            <ellipse cx="480" cy="1495" rx="385" ry="38" fill="url(#mascot-ground-shadow)" />
            <image href="/images/early-access-squirrel.png" width="1024" height="1536" />
            {/* Use the actual brand asset over the illustrated folder's distorted mark. */}
            <image
              href="/icons/favicon.svg"
              x="228"
              y="918"
              width="204"
              height="204"
              transform="rotate(8 330 1020)"
            />
          </svg>
        </Mascot>
      </Layout>
    </Surface>
  );
}
