import { Text, Input, Stack, Grid, ListRow, IconBadge } from "@/design-system";

import { useEffect, useState } from "react";
import {
  HardDrive,
  HelpCircle,
  Info,
  KeyRound,
  Lock,
  LogOut,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

import SectionHead from "@/components/SectionHead";
import { storageText } from "@/components/AccountUsage";
import { api } from "@/lib/api";
import { Overlay, Row, Section, TextBlock } from "./settings-ui";
import AccountChangeModal from "./AccountChangeModals";
import PinChangeModal from "./PinChangeModal";
import BillingSection from "./BillingSection";
import PreferencesSection from "./PreferencesSection";
import {
  AccountDataSection,
  DeleteAccountSection,
} from "./SettingsDataSections";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logout } from "@/store/slices/authSlice";
import { refreshUsage } from "@/store/slices/usageSlice";

type ModalKind = "whatsnew" | "faq" | "feedback" | "about" | null;
type AccountModalKind = "email" | "password" | null;

const changelog = [
  [
    "Landing auth",
    "Sign in and sign up now live directly on the landing page.",
  ],
  [
    "Document archive",
    "Cleaner archive states and safer missing-file handling.",
  ],
  [
    "Health readiness",
    "Health profiles and visit packs are now part of the app shell.",
  ],
];

const faqs = [
  [
    "Where are my documents stored?",
    "Your documents are stored in your Readines cloud archive and protected by your account.",
  ],
  [
    "Can I export my data?",
    "Use Export all data in Settings to prepare a ZIP with your Readines data and uploaded files.",
  ],
  [
    "How do I reset my password?",
    "Use forgot password from the sign-in screen to reset access by email.",
  ],
];

export default function SettingsPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const account = useAppSelector((state) => state.auth.user);
  const { data: usage } = useAppSelector((state) => state.usage);
  const [modal, setModal] = useState<ModalKind>(null);
  const [accountModal, setAccountModal] = useState<AccountModalKind>(null);
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const initial = (account?.name || account?.email || "?")
    .trim()
    .charAt(0)
    .toUpperCase();

  useEffect(() => {
    void dispatch(refreshUsage());
  }, [dispatch]);

  const signOut = async () => {
    if (signingOut) return;
    setSigningOut(true);
    await api.auth.logout().catch(() => undefined);
    dispatch(logout());
    toast.success("Signed out");
    navigate("/", { replace: true });
  };

  return (
    <div className="lp-route">
      <SectionHead
        title="Settings"
        sub="Your account, your family, and how Readines behaves."
        action={null}
      />
      <Grid $align="start">
        <div>
          <Section label="Account">
            <ListRow>
              <IconBadge>{initial}</IconBadge>
              <Stack $grow $gap="s4">
                <Input
                  value={account?.name || "Account"}
                  readOnly
                  aria-label="Account name"
                />
                <Text size="sm" tone="muted">
                  {account?.email || "Not signed in"}
                </Text>
              </Stack>
            </ListRow>
            <Row
              icon={Users}
              label="Family and Access"
              sub="Members, access levels, emergency contacts and SOS handoff"
              onClick={() => navigate("/family")}
            />
            <Row
              icon={Lock}
              label="Change Email"
              sub="Request a change to your email address"
              onClick={() => setAccountModal("email")}
            />
            <Row
              icon={ShieldCheck}
              label="Change Password"
              sub="Update your account password"
              onClick={() => setAccountModal("password")}
            />
            <Row
              icon={KeyRound}
              label="Change R-pin"
              sub="Update the R-pin used for quick sign-in"
              onClick={() => setPinModalOpen(true)}
            />
          </Section>
          <BillingSection />
          <PreferencesSection />
          <Section label="Storage">
            <Row
              icon={HardDrive}
              label="Storage used"
              value={usage ? storageText(usage.storage) : "Loading..."}
              first
            />
          </Section>
          <AccountDataSection />
        </div>
        <div>
          <Section label="Support">
            <Row
              icon={Sparkles}
              label="What's new"
              value="v0.9"
              sub="Latest changes in Readines"
              onClick={() => setModal("whatsnew")}
              first
            />
            <Row
              icon={HelpCircle}
              label="Help and FAQs"
              sub="Straight answers, including the uncomfortable ones"
              onClick={() => setModal("faq")}
            />
            <Row
              icon={MessageSquare}
              label="Send feedback"
              sub="Tell us what is broken or missing"
              onClick={() => setModal("feedback")}
            />
            <Row
              icon={Info}
              label="About Readines"
              onClick={() => setModal("about")}
            />
          </Section>
          <Section label="Session">
            <Row
              icon={LogOut}
              label={signingOut ? "Signing out..." : "Sign out"}
              sub="Your archive stays in your account"
              onClick={() => void signOut()}
              first
            />
          </Section>
          <DeleteAccountSection />
        </div>
      </Grid>
      {modal === "whatsnew" ? (
        <Overlay title="What's new" onClose={() => setModal(null)}>
          {changelog.map(([title, body], index) => (
            <TextBlock
              key={title}
              title={title}
              body={body}
              divided={index > 0}
            />
          ))}
        </Overlay>
      ) : null}
      {modal === "faq" ? (
        <Overlay title="Help and FAQs" onClose={() => setModal(null)}>
          {faqs.map(([title, body], index) => (
            <TextBlock
              key={title}
              title={title}
              body={body}
              divided={index > 0}
            />
          ))}
        </Overlay>
      ) : null}
      {modal === "feedback" ? (
        <Overlay title="Send feedback" onClose={() => setModal(null)}>
          <Text as="p" size="md">
            Feedback collection is not connected yet. For now, send issues to
            support@readiness.com.
          </Text>
        </Overlay>
      ) : null}
      {modal === "about" ? (
        <Overlay title="About Readines" onClose={() => setModal(null)}>
          <Text as="p" size="md">
            Readines keeps your family ready for important moments by
            organizing documents, readiness packs, health context, wealth
            records, and trusted access in one private account.
          </Text>
        </Overlay>
      ) : null}
      {accountModal && account?.email ? (
        <AccountChangeModal
          kind={accountModal}
          currentEmail={account.email}
          onClose={() => setAccountModal(null)}
        />
      ) : null}
      {pinModalOpen && account?.email ? (
        <PinChangeModal
          currentEmail={account.email}
          onClose={() => setPinModalOpen(false)}
        />
      ) : null}
    </div>
  );
}
