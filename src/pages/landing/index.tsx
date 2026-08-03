import Landing from "@/components/Landing";

type LandingPageProps = {
  onStart: () => void;
};

export default function LandingPage({ onStart }: LandingPageProps) {
  return <Landing onStart={onStart} />;
}
