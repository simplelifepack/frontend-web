import Landing from "@/components/Landing";

type LandingPageProps = {
  initialAuthMode?: "signin" | "signup" | null;
  onAuthed: (isNew: boolean) => void;
};

export default function LandingPage({ initialAuthMode, onAuthed }: LandingPageProps) {
  return <Landing initialAuthMode={initialAuthMode} onAuthed={onAuthed} />;
}
