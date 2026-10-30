import {
  Text,
  Heading,
  ModalPanel,
  ModalBackdrop,
  ModalHeader,
  Button,
  Card,
  Stack,
  ListRow,
  ListAction,
} from "@/design-system";
import type { ReactNode } from "react";
import { ChevronRight, X, type LucideIcon } from "lucide-react";
import { T } from "@/constants/theme";

export function Section({
  label,
  children,
  danger = false,
}: {
  label: string;
  children: ReactNode;
  danger?: boolean;
}) {
  return (
    <Stack $gap="s8" $spaceAfter="s20">
      <Text
        as="div"
        size="sm"
        weight="semibold"
        tone={danger ? "danger" : "muted"}
      >
        {label}
      </Text>
      <Card tone={danger ? "danger" : "default"} flush>
        {children}
      </Card>
    </Stack>
  );
}
export function Row({
  icon: Icon,
  label,
  value,
  sub,
  onClick,
  danger = false,
  first = false,
}: {
  icon: LucideIcon;
  label: string;
  value?: string;
  sub?: string;
  onClick?: () => void;
  danger?: boolean;
  first?: boolean;
}) {
  const content = (
    <>
      <Icon aria-hidden="true" color={danger ? T.coral : T.muted} />
      <Stack $grow $gap="s4">
        <Text weight="medium" tone={danger ? "danger" : "default"}>
          {label}
        </Text>
        {sub && (
          <Text size="sm" tone="muted">
            {sub}
          </Text>
        )}
      </Stack>
      {value && <Text tone="muted">{value}</Text>}
      {onClick && <ChevronRight aria-hidden="true" />}
    </>
  );
  return onClick ? (
    <ListAction
      variant="tertiary"
      tone={danger ? "danger" : "neutral"}
      $divided={!first}
      onClick={onClick}
    >
      {content}
    </ListAction>
  ) : (
    <ListRow $divided={!first}>{content}</ListRow>
  );
}
export function Overlay({
  title,
  children,
  onClose,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  return (
    <ModalBackdrop onClick={onClose}>
      <ModalPanel
        onDismiss={onClose}
        aria-label="Settings confirmation"
        onClick={(event) => event.stopPropagation()}
      >
        <ModalHeader>
          <Heading level={2} size="sm">
            {title}
          </Heading>
          <Button
            iconOnly
            variant="tertiary"
            size="sm"
            onClick={onClose}
            aria-label="Close"
          >
            <X aria-hidden="true" />
          </Button>
        </ModalHeader>
        {children}
      </ModalPanel>
    </ModalBackdrop>
  );
}
export function TextBlock({
  title,
  body,
  divided,
}: {
  title: string;
  body: string;
  divided: boolean;
}) {
  return (
    <ListRow $divided={divided}>
      <Stack $gap="s4">
        <Text weight="semibold">{title}</Text>
        <Text tone="muted">{body}</Text>
      </Stack>
    </ListRow>
  );
}
