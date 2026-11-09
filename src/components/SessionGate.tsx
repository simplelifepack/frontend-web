import { Text, colors } from "@/design-system";
import styled from "styled-components";
import type { ReactNode } from "react";

import { useAppSelector } from "@/store/hooks";
const SessionCheck = styled.div`
  min-height: 100svh;
  display: grid;
  place-items: center;
  background: ${colors.background};
  color: ${colors.text};
`;

export default function SessionGate({ children, publicEntry = false }: { children: ReactNode; publicEntry?: boolean }) {
  const { sessionStatus, token } = useAppSelector((state) => state.auth);

  // Registration is public: session restoration must not block or unmount its form.
  // Protected routes never opt into this behavior.
  if (publicEntry && !token) return children;

  if (sessionStatus === "idle" || sessionStatus === "loading") {
    return <SessionCheck role="status" aria-busy="true" aria-label="Checking your session">
      <Text>Checking your session…</Text>
    </SessionCheck>;
  }

  return children;
}
