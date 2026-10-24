import { spacing } from "@/design-system";
import {
  AuthFrame,
  AuthSurface,
  Heading,
  Text,
  Stack,
  Card,
} from "@/design-system";
import BrandLogo from "./BrandLogo";
import type { ReactNode } from "react";
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <AuthFrame>
      <AuthSurface>
        <Stack as="aside" $gap="s32">
          <BrandLogo height={Number.parseInt(spacing.s60)} />
          <Heading level={1} size="lg">
            Your documents, ready when life asks.
          </Heading>
          <Text tone="muted">
            Sign in to your private living archive, create an account, or reset
            your password.
          </Text>
          <Card>
            <Text>
              Private by design. Your connected sources remain read-only and
              under your control.
            </Text>
          </Card>
        </Stack>
        <section>{children}</section>
      </AuthSurface>
    </AuthFrame>
  );
}
