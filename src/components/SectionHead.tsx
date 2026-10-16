import { Button, SectionHead as Header } from "@/design-system";
import type { SectionHeadProps } from "@/design-system/components/SectionHead/types";
export default function SectionHead({ action, ...props }: SectionHeadProps) {
  return (
    <Header
      {...props}
      action={
        action === undefined ? (
          <Button
            variant="primary"
            onClick={() =>
              window.dispatchEvent(new CustomEvent("readiness:open-upload"))
            }
          >
            Upload
          </Button>
        ) : (
          action
        )
      }
    />
  );
}
